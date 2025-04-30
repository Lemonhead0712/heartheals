// Function to format relative time (e.g., "5 minutes ago")
export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - new Date(date).getTime()
  const diffSecs = Math.round(diffMs / 1000)
  const diffMins = Math.round(diffSecs / 60)
  const diffHours = Math.round(diffMins / 60)
  const diffDays = Math.round(diffHours / 24)

  if (diffSecs < 10) {
    return "just now"
  } else if (diffSecs < 60) {
    return `${diffSecs} seconds ago`
  } else if (diffMins === 1) {
    return "1 minute ago"
  } else if (diffMins < 60) {
    return `${diffMins} minutes ago`
  } else if (diffHours === 1) {
    return "1 hour ago"
  } else if (diffHours < 24) {
    return `${diffHours} hours ago`
  } else if (diffDays === 1) {
    return "yesterday"
  } else if (diffDays < 30) {
    return `${diffDays} days ago`
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: new Date().getFullYear() !== date.getFullYear() ? "numeric" : undefined,
    })
  }
}

// Function to format a date range
export function formatDateRange(start: Date, end: Date): string {
  // If in same year and month
  if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()) {
    return `${start.toLocaleDateString("en-US", { month: "short" })} ${start.getDate()} - ${end.getDate()}, ${start.getFullYear()}`
  }

  // If in same year
  if (start.getFullYear() === end.getFullYear()) {
    return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString(
      "en-US",
      { month: "short", day: "numeric" },
    )}, ${start.getFullYear()}`
  }

  // Different years
  return `${start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
}

// Function to get start and end dates for a specific time period
export function getDateRangeForPeriod(period: "day" | "week" | "month" | "year"): { start: Date; end: Date } {
  const end = new Date()
  const start = new Date()

  switch (period) {
    case "day":
      start.setHours(0, 0, 0, 0)
      break
    case "week":
      start.setDate(start.getDate() - 7)
      break
    case "month":
      start.setMonth(start.getMonth() - 1)
      break
    case "year":
      start.setFullYear(start.getFullYear() - 1)
      break
  }

  return { start, end }
}

// Calculate the day difference between two dates
export function getDayDifference(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// Format date for display in charts
export function formatChartDate(date: Date): string {
  const now = new Date()

  if (getDayDifference(date, now) <= 1) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  } else if (getDayDifference(date, now) < 7) {
    return date.toLocaleDateString("en-US", { weekday: "short" })
  } else {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }
}
