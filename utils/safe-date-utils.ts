/**
 * Safely parses a date string or object into a Date object
 * @param dateInput Date string, object, or timestamp
 * @returns Valid Date object or null if parsing fails
 */
export function safeParseDate(dateInput: string | Date | number | undefined | null): Date | null {
  if (!dateInput) return null

  try {
    // If it's already a Date object
    if (dateInput instanceof Date) {
      return isNaN(dateInput.getTime()) ? null : dateInput
    }

    // If it's a timestamp number
    if (typeof dateInput === "number") {
      const date = new Date(dateInput)
      return isNaN(date.getTime()) ? null : date
    }

    // If it's an ISO string (YYYY-MM-DD)
    if (typeof dateInput === "string") {
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
        const [year, month, day] = dateInput.split("-").map(Number)
        const date = new Date(year, month - 1, day)
        return isNaN(date.getTime()) ? null : date
      }

      // Try standard date parsing
      const date = new Date(dateInput)
      return isNaN(date.getTime()) ? null : date
    }

    return null
  } catch (error) {
    console.error("Error parsing date:", error)
    return null
  }
}

/**
 * Safely formats a date with fallback for invalid dates
 * @param date Date to format
 * @param options Intl.DateTimeFormatOptions
 * @param fallback Fallback string if date is invalid
 * @returns Formatted date string or fallback
 */
export function safeFormatDate(
  date: Date | string | number | undefined | null,
  options: Intl.DateTimeFormatOptions = {},
  fallback = "Invalid date",
): string {
  try {
    const parsedDate = date instanceof Date ? date : safeParseDate(date)
    if (!parsedDate) return fallback

    return new Intl.DateTimeFormat("en-US", options).format(parsedDate)
  } catch (error) {
    console.error("Error formatting date:", error)
    return fallback
  }
}
