import { logError } from "@/utils/error-utils"

// Interface for webhook event record
export interface WebhookEventRecord {
  id: string
  type: string
  timestamp: number
  processed: boolean
  processingTime?: number
  result?: any
  error?: any
}

// In-memory store for webhook events (replace with a real database in production)
const webhookEvents: Record<string, WebhookEventRecord> = {}

// Check if a webhook event has been processed
export async function hasProcessedEvent(eventId: string): Promise<boolean> {
  try {
    // In a real app, you would query your database
    // return await db.webhookEvents.findUnique({ where: { id: eventId } }) !== null
    return webhookEvents[eventId] !== undefined
  } catch (error) {
    logError(`Error checking if event ${eventId} has been processed`, error)
    // Default to false to allow processing if we can't check
    return false
  }
}

// Record a webhook event as processed
export async function recordProcessedEvent(
  eventId: string,
  eventType: string,
  timestamp: number,
  result: any,
  processingTime: number,
  error?: any,
): Promise<void> {
  try {
    // In a real app, you would insert into your database
    // await db.webhookEvents.create({...})
    webhookEvents[eventId] = {
      id: eventId,
      type: eventType,
      timestamp,
      processed: true,
      processingTime,
      result,
      error,
    }
  } catch (error) {
    logError(`Error recording processed event ${eventId}`, error)
  }
}

// Get a webhook event record
export async function getWebhookEvent(eventId: string): Promise<WebhookEventRecord | null> {
  try {
    // In a real app, you would query your database
    // return await db.webhookEvents.findUnique({ where: { id: eventId } })
    return webhookEvents[eventId] || null
  } catch (error) {
    logError(`Error getting webhook event ${eventId}`, error)
    return null
  }
}

// List recent webhook events
export async function listRecentWebhookEvents(limit = 100, offset = 0): Promise<WebhookEventRecord[]> {
  try {
    // In a real app, you would query your database
    // return await db.webhookEvents.findMany({ orderBy: { timestamp: 'desc' }, take: limit, skip: offset })
    return Object.values(webhookEvents)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(offset, offset + limit)
  } catch (error) {
    logError(`Error listing recent webhook events`, error)
    return []
  }
}

// Get webhook event statistics
export async function getWebhookEventStats(): Promise<{
  total: number
  successful: number
  failed: number
  averageProcessingTime: number
}> {
  try {
    // In a real app, you would query your database
    const events = Object.values(webhookEvents)
    const total = events.length
    const successful = events.filter((e) => e.processed && !e.error).length
    const failed = events.filter((e) => e.error).length
    const processingTimes = events.filter((e) => e.processingTime).map((e) => e.processingTime!)
    const averageProcessingTime =
      processingTimes.length > 0 ? processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length : 0

    return {
      total,
      successful,
      failed,
      averageProcessingTime,
    }
  } catch (error) {
    logError(`Error getting webhook event statistics`, error)
    return {
      total: 0,
      successful: 0,
      failed: 0,
      averageProcessingTime: 0,
    }
  }
}
