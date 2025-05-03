# Webhook Forwarder

A lightweight but powerful webhook forwarding service that receives webhook events from services like Stripe and forwards them to multiple destinations.

## Features

- **Multiple destinations**: Forward webhook events to multiple endpoints
- **Event filtering**: Configure which event types each destination receives
- **Reliability**: Built-in retry mechanism with Sidekiq
- **Security**: Verifies Stripe webhook signatures
- **Monitoring**: Tracks statistics with StatsD
- **Admin Dashboard**: View and manage webhook destinations

## Setup

### Prerequisites

- Ruby 3.0+
- Redis
- [Optional] StatsD + Graphite for metrics

### Configuration

1. Copy the `.env.example` file to `.env` and fill in the required variables:

\`\`\`
cp .env.example .env
\`\`\`

2. Install dependencies:

\`\`\`
bundle install
\`\`\`

### Running with Docker Compose

The easiest way to run the service is with Docker Compose:

\`\`\`
docker-compose up -d
\`\`\`

This will start:
- The webhook forwarder service
- Redis for storage and queues
- Sidekiq for background processing
- StatsD + Graphite for metrics (optional)

### Running Manually

1. Start Redis:

\`\`\`
redis-server
\`\`\`

2. Start Sidekiq worker:

\`\`\`
bundle exec sidekiq -r ./webhook_forwarder.rb
\`\`\`

3. Start the webhook forwarder:

\`\`\`
bundle exec ruby webhook_forwarder.rb
\`\`\`

## Usage

### Endpoints

- **`POST /webhooks/stripe`**: Endpoint for Stripe webhooks
- **`POST /webhooks/generic?source=your_source`**: Endpoint for generic webhooks
- **`GET /health`**: Health check endpoint
- **`GET /admin/dashboard`**: Admin dashboard (requires authentication)
- **`POST /api/destinations`**: Create a new destination
- **`GET /api/destinations`**: List all destinations
- **`DELETE /api/destinations/:id`**: Delete a destination

### Adding a Webhook Destination

You can add a webhook destination through the admin dashboard or the API:

\`\`\`
curl -X POST http://localhost:4242/api/destinations \
  -H "Authorization: Bearer your_auth_token" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/webhook-receiver",
    "description": "Example webhook destination",
    "event_types": ["charge.succeeded", "invoice.payment_succeeded"]
  }'
\`\`\`

Use `["*"]` for the `event_types` array to receive all events.

### Setting Up Stripe Webhooks

1. Go to your Stripe Dashboard > Developers > Webhooks
2. Add an endpoint with URL: `https://your-domain.com/webhooks/stripe`
3. Select the events you want to receive
4. Get the signing secret and add it to your `.env` file as `STRIPE_WEBHOOK_SECRET`

## Security

- All admin endpoints are protected with token authentication
- Stripe webhook signatures are verified
- Set a strong `AUTH_TOKEN` in your `.env` file

## Monitoring

The service exposes various metrics via StatsD, including:

- Webhook reception counts
- Forwarding success/failure counts
- Processing times

You can view these metrics in Graphite by accessing the web UI at http://localhost:8080 when running with Docker Compose.

## Development

### Running tests

\`\`\`
bundle exec rspec
\`\`\`

### Local development

For local development with Stripe webhooks, you can use the Stripe CLI:

\`\`\`
stripe listen --forward-to localhost:4242/webhooks/stripe
