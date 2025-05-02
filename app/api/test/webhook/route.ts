import { type NextRequest, NextResponse } from "next/server"
import { generateTestWebhookEvents } from "@/utils/webhook-test-utils"

export async function POST(request: NextRequest) {
  try {
    // Get the event type from the request
    const { eventType = "subscriptionCreated" } = await request.json()

    // Generate test webhook events
    const testEvents = generateTestWebhookEvents()

    // Get the requested event
    const event = testEvents[eventType]

    if (!event) {
      return NextResponse.json({ error: `Unknown event type: ${eventType}` }, { status: 400 })
    }

    // In a real app, you would send this to your webhook endpoint
    // This is just for demonstration
    console.log(`Test webhook event generated: ${event.event.type}`)

    // Return the generated event
    return NextResponse.json({
      success: true,
      event: event.event,
      signature: event.signature,
      message: `Test webhook event generated: ${event.event.type}`,
    })
  } catch (error) {
    console.error("Error generating test webhook:", error)
    return NextResponse.json(
      {
        error: "Failed to generate test webhook",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  // Return available test event types
  return NextResponse.json({
    availableEvents: ["subscriptionCreated", "paymentSucceeded", "paymentFailed"],
    usage: "POST to this endpoint with { eventType: 'eventName' }",
  })
}
