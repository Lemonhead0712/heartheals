import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const metric = await request.json()

    // Log metrics in development
    if (process.env.NODE_ENV === "development") {
      console.log("Performance metric received:", metric)
    }

    // In a real application, you would store these metrics in a database
    // or send them to an analytics service

    // For now, we'll just acknowledge receipt
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error processing performance metric:", error)
    return NextResponse.json({ error: "Failed to process performance metric" }, { status: 500 })
  }
}
