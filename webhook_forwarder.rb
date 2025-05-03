require 'sinatra/base'
require 'json'
require 'stripe'
require 'redis'
require 'sidekiq'
require 'logger'
require 'dotenv/load'
require 'rack/throttle'
require 'statsd-ruby'

# Configure Stripe
Stripe.api_key = ENV['STRIPE_SECRET_KEY']

# Configure Redis
REDIS = Redis.new(
  url: ENV['REDIS_URL'] || 'redis://localhost:6379/0',
  reconnect_attempts: 10,
  reconnect_delay: 1.5,
  reconnect_delay_max: 10.0
)

# Configure StatsD for metrics
STATSD = Statsd.new(ENV['STATSD_HOST'] || 'localhost', ENV['STATSD_PORT'] || 8125)

# Configure Sidekiq
Sidekiq.configure_server do |config|
  config.redis = { url: ENV['REDIS_URL'] || 'redis://localhost:6379/0' }
end

Sidekiq.configure_client do |config|
  config.redis = { url: ENV['REDIS_URL'] || 'redis://localhost:6379/0' }
end

# Webhook forwarding worker
class WebhookForwardWorker
  include Sidekiq::Worker
  sidekiq_options retry: 10, dead: false, queue: 'webhook_forwarding'

  def perform(event_id, destination_url, payload, headers = {})
    logger.info "Forwarding webhook event #{event_id} to #{destination_url}"
    
    begin
      STATSD.increment('webhook.forward.attempt')
      start_time = Time.now
      
      response = HTTParty.post(
        destination_url,
        body: payload,
        headers: headers.merge({
          'Content-Type' => 'application/json',
          'User-Agent' => 'HeartHeals-WebhookForwarder/1.0',
          'X-Forwarded-Event-ID' => event_id
        }),
        timeout: 15
      )
      
      duration = ((Time.now - start_time) * 1000).round
      STATSD.timing('webhook.forward.duration', duration)
      
      if response.success?
        logger.info "Successfully forwarded event #{event_id} to #{destination_url} (#{response.code})"
        STATSD.increment('webhook.forward.success')
        REDIS.hset("webhook:forwarded:#{event_id}", destination_url, Time.now.to_i)
      else
        logger.error "Failed to forward event #{event_id} to #{destination_url}: HTTP #{response.code} - #{response.body}"
        STATSD.increment('webhook.forward.failure')
        raise "HTTP Error: #{response.code}"
      end
    rescue => e
      logger.error "Error forwarding webhook event #{event_id} to #{destination_url}: #{e.message}"
      STATSD.increment('webhook.forward.error')
      REDIS.hincrby("webhook:errors:#{event_id}", destination_url, 1)
      raise # Re-raise to trigger Sidekiq retry
    end
  end
end

# Main application
class WebhookForwarderApp < Sinatra::Base
  use Rack::Throttle::Interval, :min => 0.05  # Max 20 req/sec
  
  configure do
    set :logger, Logger.new($stdout)
    set :environment, ENV['RACK_ENV'] || 'development'
    enable :logging
  end
  
  before do
    STATSD.increment('webhook.request')
  end
  
  # Health check endpoint
  get '/health' do
    content_type :json
    { status: 'ok', version: '1.0.0' }.to_json
  end
  
  # Webhook configuration API
  post '/api/destinations' do
    content_type :json
    halt 401, { error: 'Unauthorized' }.to_json unless authorized?
    
    data = JSON.parse(request.body.read)
    url = data['url']
    event_types = data['event_types'] || ['*']
    description = data['description'] || ''
    
    halt 400, { error: 'URL is required' }.to_json unless url
    
    id = SecureRandom.uuid
    REDIS.hset("webhook:destination:#{id}", 
               'url', url, 
               'event_types', event_types.to_json, 
               'description', description,
               'created_at', Time.now.to_i)
    
    { id: id, url: url, event_types: event_types }.to_json
  end
  
  # List destinations
  get '/api/destinations' do
    content_type :json
    halt 401, { error: 'Unauthorized' }.to_json unless authorized?
    
    destinations = []
    REDIS.scan_each(match: "webhook:destination:*") do |key|
      data = REDIS.hgetall(key)
      destinations << {
        id: key.split(':').last,
        url: data['url'],
        event_types: JSON.parse(data['event_types'] || '["*"]'),
        description: data['description'],
        created_at: data['created_at'].to_i
      }
    end
    
    destinations.to_json
  end
  
  # Delete a destination
  delete '/api/destinations/:id' do
    content_type :json
    halt 401, { error: 'Unauthorized' }.to_json unless authorized?
    
    id = params['id']
    if REDIS.exists?("webhook:destination:#{id}")
      REDIS.del("webhook:destination:#{id}")
      { success: true, message: "Destination #{id} deleted" }.to_json
    else
      halt 404, { error: 'Destination not found' }.to_json
    end
  end
  
  # Stripe webhook endpoint
  post '/webhooks/stripe' do
    begin
      # Verify signature
      payload = request.body.read
      sig_header = request.env['HTTP_STRIPE_SIGNATURE']
      
      event = nil
      
      begin
        STATSD.increment('webhook.stripe.received')
        event = Stripe::Webhook.construct_event(
          payload, sig_header, ENV['STRIPE_WEBHOOK_SECRET']
        )
      rescue JSON::ParserError => e
        logger.error "Invalid payload: #{e.message}"
        STATSD.increment('webhook.stripe.invalid_payload')
        halt 400, { error: 'Invalid payload' }.to_json
      rescue Stripe::SignatureVerificationError => e
        logger.error "Invalid signature: #{e.message}"
        STATSD.increment('webhook.stripe.invalid_signature')
        halt 403, { error: 'Invalid signature' }.to_json
      end
      
      # Store the event
      event_data = event.to_hash
      event_id = event_data[:id]
      event_type = event_data[:type]
      
      logger.info "Received Stripe webhook event: #{event_id} (#{event_type})"
      STATSD.increment('webhook.stripe.valid')
      STATSD.increment("webhook.stripe.event.#{event_type.gsub('.', '_')}")
      
      # Store event in Redis (with 24 hour expiration)
      REDIS.set("webhook:event:#{event_id}", payload, ex: 86400)
      
      # Forward to configured destinations
      forward_count = 0
      REDIS.scan_each(match: "webhook:destination:*") do |key|
        destination = REDIS.hgetall(key)
        event_types = JSON.parse(destination['event_types'] || '["*"]')
        
        # Check if this destination should receive this event type
        if event_types.include?('*') || event_types.include?(event_type)
          # Queue the forwarding job
          WebhookForwardWorker.perform_async(
            event_id, 
            destination['url'], 
            payload,
            { 'X-Stripe-Signature' => sig_header }
          )
          forward_count += 1
        end
      end
      
      logger.info "Queued webhook event #{event_id} for forwarding to #{forward_count} destinations"
      STATSD.gauge('webhook.forward.destinations', forward_count)
      
      # Return success
      content_type :json
      { received: true, id: event_id, type: event_type, forwarded_to: forward_count }.to_json
      
    rescue => e
      logger.error "Webhook processing error: #{e.message}"
      STATSD.increment('webhook.processing.error')
      halt 500, { error: e.message }.to_json
    end
  end
  
  # Generic webhook forwarding endpoint
  post '/webhooks/generic' do
    begin
      payload = request.body.read
      event_id = SecureRandom.uuid
      source = params['source'] || 'unknown'
      
      logger.info "Received generic webhook from source: #{source}"
      STATSD.increment('webhook.generic.received')
      STATSD.increment("webhook.generic.source.#{source}")
      
      # Store event in Redis (with 24 hour expiration)
      REDIS.set("webhook:event:#{event_id}", payload, ex: 86400)
      
      # Forward to configured destinations
      forward_count = 0
      REDIS.scan_each(match: "webhook:destination:*") do |key|
        destination = REDIS.hgetall(key)
        event_types = JSON.parse(destination['event_types'] || '["*"]')
        
        # For generic webhooks, we use the source as the event type
        if event_types.include?('*') || event_types.include?("generic.#{source}")
          # Queue the forwarding job
          WebhookForwardWorker.perform_async(
            event_id, 
            destination['url'], 
            payload,
            { 'X-Original-Source' => source }
          )
          forward_count += 1
        end
      end
      
      logger.info "Queued generic webhook for forwarding to #{forward_count} destinations"
      
      # Return success
      content_type :json
      { received: true, id: event_id, source: source, forwarded_to: forward_count }.to_json
      
    rescue => e
      logger.error "Generic webhook processing error: #{e.message}"
      STATSD.increment('webhook.generic.error')
      halt 500, { error: e.message }.to_json
    end
  end
  
  # Admin dashboard with basic stats
  get '/admin/dashboard' do
    halt 401, 'Unauthorized' unless authorized?
    
    @destinations_count = 0
    REDIS.scan_each(match: "webhook:destination:*") { |_| @destinations_count += 1 }
    
    @event_count = 0
    REDIS.scan_each(match: "webhook:event:*") { |_| @event_count += 1 }
    
    @error_count = 0
    REDIS.scan_each(match: "webhook:errors:*") { |_| @error_count += 1 }
    
    erb :dashboard
  end
  
  private
  
  def authorized?
    return true if ENV['RACK_ENV'] == 'development' && !ENV['AUTH_TOKEN']
    
    auth_header = request.env['HTTP_AUTHORIZATION']
    return false unless auth_header
    
    token = auth_header.gsub('Bearer ', '')
    token == ENV['AUTH_TOKEN']
  end
end

# Start the app if this file is executed directly
if __FILE__ == $0
  WebhookForwarderApp.run!
end
