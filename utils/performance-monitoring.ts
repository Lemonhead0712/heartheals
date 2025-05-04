/**
 * Performance Monitoring Utilities for HeartHeals
 */

// Types for Web Vitals metrics
type MetricName = "FCP" | "LCP" | "CLS" | "FID" | "TTFB" | "INP"

interface PerformanceMetric {
  name: MetricName
  value: number
  rating: "good" | "needs-improvement" | "poor"
  navigationType?: string
}

/**
 * Captures and reports Web Vitals metrics
 */
export function reportWebVitals(metric: any) {
  const { name, value, navigationType } = metric

  // Rate the metric based on standard thresholds
  let rating: "good" | "needs-improvement" | "poor" = "good"

  switch (name) {
    case "FCP": // First Contentful Paint
      rating = value < 1800 ? "good" : value < 3000 ? "needs-improvement" : "poor"
      break
    case "LCP": // Largest Contentful Paint
      rating = value < 2500 ? "good" : value < 4000 ? "needs-improvement" : "poor"
      break
    case "FID": // First Input Delay
      rating = value < 100 ? "good" : value < 300 ? "needs-improvement" : "poor"
      break
    case "CLS": // Cumulative Layout Shift
      rating = value < 0.1 ? "good" : value < 0.25 ? "needs-improvement" : "poor"
      break
    case "TTFB": // Time to First Byte
      rating = value < 800 ? "good" : value < 1800 ? "needs-improvement" : "poor"
      break
    case "INP": // Interaction to Next Paint
      rating = value < 200 ? "good" : value < 500 ? "needs-improvement" : "poor"
      break
  }

  // Format the metric for reporting
  const formattedMetric: PerformanceMetric = {
    name: name as MetricName,
    value,
    rating,
    navigationType,
  }

  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.log(`Performance: ${name} - ${value.toFixed(2)} (${rating})`)
  }

  // Send to analytics if enabled
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true") {
    sendToAnalytics(formattedMetric)
  }
}

/**
 * Send metrics to analytics service
 */
function sendToAnalytics(metric: PerformanceMetric) {
  const analyticsEndpoint = "/api/analytics/performance"

  if (typeof fetch !== "undefined") {
    fetch(analyticsEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(metric),
      // Use keepalive to ensure the request completes even if page is unloading
      keepalive: true,
    }).catch((err) => {
      console.error("Failed to send performance metric:", err)
    })
  }
}

/**
 * Measures component render time
 */
export function measureComponentPerformance(componentName: string) {
  const startTime = performance.now()

  return () => {
    const endTime = performance.now()
    const renderTime = endTime - startTime

    if (process.env.NODE_ENV === "development") {
      console.log(`Component render time: ${componentName} - ${renderTime.toFixed(2)}ms`)
    }

    return renderTime
  }
}
