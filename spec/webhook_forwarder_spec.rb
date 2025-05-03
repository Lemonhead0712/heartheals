require 'rack/test'
require 'rspec'
require 'json'
require 'webmock/rspec'

require_relative '../webhook_forwarder'

describe WebhookForwarderApp do
  include Rack::Test::Methods

  def app
    WebhookForwarderApp
  end

  before do
    # Mock Redis
    allow(REDIS).to receive(:set).and_return("OK")
    allow(REDIS).to receive(:scan_each).and_yield("webhook:destination:test-id")
    allow(REDIS).to receive(:hgetall).and_return({
      'url' => 'https://example.com/webhook-receiver',
      'event_types' => '["*"]',
      'description' => 'Test destination',
      'created_at' => Time.now.to_i.to_s
    })
    
    # Mock Sidekiq
    allow(WebhookForwardWorker).to receive(:perform_async).and_return(true)
    
    # Mock Stripe
    allow(Stripe::Webhook).to receive(:construct_event).and_return(
      OpenStruct.new(to_hash: { id: 'evt_test123', type: 'charge.succeeded' })
    )
  end

  describe "GET /health" do
    it "returns status ok" do
      get '/health'
      expect(last_response).to be_ok
      expect(JSON.parse(last_response.body)['status']).to eq('ok')
    end
  end

  describe "POST /webhooks/stripe" do
    it "processes a valid webhook" do
      header 'Stripe-Signature', 'test_signature'
      post '/webhooks/stripe', '{"test": "payload"}'
      expect(last_response).to be_ok
      response_data = JSON.parse(last_response.body)
      expect(response_data['received']).to be true
      expect(response_data['id']).to eq('evt_test123')
    end
  end

  describe "POST /webhooks/generic" do
    it "processes a generic webhook" do
      post '/webhooks/generic?source=test_source', '{"test": "data"}'
      expect(last_response).to be_ok
      response_data = JSON.parse(last_response.body)
      expect(response_data['received']).to be true
      expect(response_data['source']).to eq('test_source')
    end
  end

  describe "API endpoints" do
    before do
      header 'Authorization', 'Bearer test_token'
      allow_any_instance_of(WebhookForwarderApp).to receive(:authorized?).and_return(true)
    end

    it "creates a new destination" do
      post '/api/destinations', { url: 'https://example.com/new', event_types: ['*'] }.to_json
      expect(last_response).to be_ok
    end

    it "lists destinations" do
      get '/api/destinations'
      expect(last_response).to be_ok
      expect(JSON.parse(last_response.body)).to be_an(Array)
    end
  end
end
