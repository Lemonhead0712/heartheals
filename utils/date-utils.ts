// Date formatting utilities for consistent date/time display across the application

/**
 * Format a date relative to the current time (e.g., "2 minutes ago", "Yesterday")
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date()
  const targetDate = typeof date === "string" ? new Date(date) : date

  const diffTime = Math.abs(now.getTime() - targetDate.getTime())
  const diffSeconds = Math.floor(diffTime / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  // Return different formats based on how long ago the date was
  if (diffSeconds < 5) {
    return "Just now"
  } else if (diffSeconds < 60) {
    return `${diffSeconds} seconds ago`
  } else if (diffMinutes === 1) {
    return "1 minute ago"
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minutes ago`
  } else if (diffHours === 1) {
    return "1 hour ago"
  } else if (diffHours < 24) {
    return `${diffHours} hours ago`
  } else if (diffDays === 1) {
    return "Yesterday"
  } else if (diffDays < 7) {
    return `${diffDays} days ago`
  } else {
    // For older dates, return a standard format
    return targetDate.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: now.getFullYear() !== targetDate.getFullYear() ? "numeric" : undefined,
    })
  }
}

/**
 * Format a date with time for detailed display
 */
export function formatDateTime(date: Date | string): string {
  const targetDate = typeof date === "string" ? new Date(date) : date

  return (
    targetDate.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: new Date().getFullYear() !== targetDate.getFullYear() ? "numeric" : undefined,
    }) +
    " at " +
    targetDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  )
}

/**
 * Get a formatted date range string (e.g., "May 1 - May 7, 2023")
 */
export function formatDateRange(startDate: Date, endDate: Date): string {
  const sameYear = startDate.getFullYear() === endDate.getFullYear()
  const sameMonth = startDate.getMonth() === endDate.getMonth()

  const startFormat: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: !sameYear ? "numeric" : undefined,
  }

  const endFormat: Intl.DateTimeFormatOptions = {
    month: sameMonth ? undefined : "short",
    day: "numeric",
    year: "numeric",
  }

  return `${startDate.toLocaleDateString([], startFormat)} - ${endDate.toLocaleDateString([], endFormat)}`
}

/**
 * Get the start and end dates for different time periods
 */
export function getDateRangeForPeriod(period: "day" | "week" | "month" | "year"): { start: Date; end: Date } {
  const end = new Date() // Now
  const start = new Date()

  switch (period) {
    case "day":
      start.setHours(0, 0, 0, 0) // Start of today
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

/**
 * Get a human-readable string for the current date
 */
export function getCurrentDateString(): string {
  const now = new Date()
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }

  return now.toLocaleDateString(undefined, options)
}

/**
 * Format a date with customizable options
 */
export function formatDate(date: Date | string, options: Intl.DateTimeFormatOptions = {}): string {
  const targetDate = typeof date === "string" ? new Date(date) : date

  // Default options if none provided
  const defaultOptions: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: new Date().getFullYear() !== targetDate.getFullYear() ? "numeric" : undefined,
    ...options,
  }

  return targetDate.toLocaleDateString(undefined, defaultOptions)
}

/**
 * Calculate the time elapsed since a given date in a human-readable format
 */
export function getTimeElapsedSince(date: Date | string): string {
  const startDate = typeof date === "string" ? new Date(date) : date
  const now = new Date()

  const diffTime = Math.abs(now.getTime() - startDate.getTime())
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffDays / 365)

  if (diffYears > 0) {
    return `${diffYears} ${diffYears === 1 ? "year" : "years"}`
  } else if (diffMonths > 0) {
    return `${diffMonths} ${diffMonths === 1 ? "month" : "months"}`
  } else {
    return `${diffDays} ${diffDays === 1 ? "day" : "days"}`
  }
}

/**
 * Format a date for folder display
 */
export function formatDateForFolder(date: Date | string): string {
  const targetDate = typeof date === "string" ? new Date(date) : date
  const now = new Date()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)

  // Check if date is today
  if (targetDate.toDateString() === now.toDateString()) {
    return "Today"
  }

  // Check if date is yesterday
  if (targetDate.toDateString() === yesterday.toDateString()) {
    return "Yesterday"
  }

  // Otherwise return formatted date
  return targetDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: now.getFullYear() !== targetDate.getFullYear() ? "numeric" : undefined,
  })
}
