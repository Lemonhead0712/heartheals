import { NextResponse } from "next/server"
import { getWebhookDestinationById, updateWebhookDestination, deleteWebhookDestination } from "@/lib/webhook-forwarder"
import { logError } from "@/utils/error-utils"

// GET handler to get a specific destination
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const destination = getWebhookDestinationById(params.id)

    if (!destination) {
      return NextResponse.json({ error: "Destination not found" }, { status: 404 })
    }

    return NextResponse.json({ destination })
  } catch (error) {
    logError(`Error fetching webhook destination ${params.id}`, error)
    return NextResponse.json(
      {
        error: "Error fetching webhook destination",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// PATCH handler to update a destination
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const updatedDestination = updateWebhookDestination(params.id, data)

    if (!updatedDestination) {
      return NextResponse.json({ error: "Destination not found" }, { status: 404 })
    }

    return NextResponse.json({ destination: updatedDestination })
  } catch (error) {
    logError(`Error updating webhook destination ${params.id}`, error)
    return NextResponse.json(
      {
        error: "Error updating webhook destination",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// DELETE handler to delete a destination
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const deleted = deleteWebhookDestination(params.id)

    if (!deleted) {
      return NextResponse.json({ error: "Destination not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logError(`Error deleting webhook destination ${params.id}`, error)
    return NextResponse.json(
      {
        error: "Error deleting webhook destination",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
