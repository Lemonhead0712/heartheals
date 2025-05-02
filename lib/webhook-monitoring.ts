import { logError } from "@/utils/error-utils"

// Interface for webhook metrics
export interface WebhookMetrics {
  totalEvents: number
  successfulEvents: number
  failedEvents: number
  averageProcessingTime: number
  eventsByType: Record<string, number>
  errorsCount: number
  lastProcessedAt?: Date
}

// In-memory metrics store (replace with a real metrics system in production)
let metrics: WebhookMetrics = {
  totalEvents: 0,
  successfulEvents: 0,
  failedEvents: 0,
  averageProcessingTime: 0,
  eventsByType: {},
  errorsCount: 0,
}

// Record webhook event metrics
export function recordWebhookMetrics({
  eventType,
  success,
  processingTime,
  error,
}: {
  eventType: string
  success: boolean
  processingTime: number
  error?: any
}): void {
  try {
    // Update metrics
    metrics.totalEvents++
    metrics.lastProcessedAt = new Date()

    if (success) {
      metrics.successfulEvents++
    } else {
      metrics.failedEvents++
      metrics.errorsCount++
    }

    // Update average processing time
    const totalProcessingTime = metrics.averageProcessingTime * (metrics.totalEvents - 1) + processingTime
    metrics.averageProcessingTime = totalProcessingTime / metrics.totalEvents

    // Update events by type
    metrics.eventsByType[eventType] = (metrics.eventsByType[eventType] || 0) + 1

    // In a real app, you would send these metrics to your monitoring system
    // await sendMetricsToMonitoringSystem(metrics)
  } catch (error) {
    logError("Error recording webhook metrics", error)
  }
}

// Get current webhook metrics
export function getWebhookMetrics(): WebhookMetrics {
  return { ...metrics }
}

// Reset webhook metrics (for testing)
export function resetWebhookMetrics(): void {
  metrics = {
    totalEvents: 0,
    successfulEvents: 0,
    failedEvents: 0,
    averageProcessingTime: 0,
    eventsByType: {},
    errorsCount: 0,
  }
}

// Check if webhook processing is healthy
export function isWebhookHealthy(): boolean {
  // Example health check: less than 10% failure rate and processed at least one event in the last hour
  if (metrics.totalEvents === 0) return true // No events yet

  const failureRate = metrics.failedEvents / metrics.totalEvents
  const recentActivity = metrics.lastProcessedAt
    ? new Date().getTime() - metrics.lastProcessedAt.getTime() < 60 * 60 * 1000
    : false

  return failureRate < 0.1 && recentActivity
}

// Get webhook health status
export function getWebhookHealthStatus(): {
  healthy: boolean
  status: string
  metrics: WebhookMetrics
} {
  const healthy = isWebhookHealthy()
  return {
    healthy,
    status: healthy ? "healthy" : "unhealthy",
    metrics,
  }
}
