import { NextResponse } from "next/server"
import { addWebhookDestination, getWebhookDestinations } from "@/lib/webhook-forwarder"
import { logError } from "@/utils/error-utils"

// GET handler to list all destinations
export async function GET(request: Request) {
  try {
    const destinations = getWebhookDestinations()
    return NextResponse.json({ destinations })
  } catch (error) {
    logError("Error fetching webhook destinations", error)
    return NextResponse.json(
      {
        error: "Error fetching webhook destinations",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// POST handler to create a new destination
export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.name || !data.url) {
      return NextResponse.json({ error: "Name and URL are required" }, { status: 400 })
    }

    // Create new destination
    const newDestination = addWebhookDestination({
      name: data.name,
      url: data.url,
      active: data.active !== undefined ? data.active : true,
      eventTypes: data.eventTypes || [],
      secret: data.secret || undefined,
      headers: data.headers || {},
      retryCount: data.retryCount || 3,
    })

    return NextResponse.json({ destination: newDestination }, { status: 201 })
  } catch (error) {
    logError("Error creating webhook destination", error)
    return NextResponse.json(
      {
        error: "Error creating webhook destination",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
