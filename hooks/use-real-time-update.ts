"use client"

import { useState, useEffect } from "react"

/**
 * Hook that triggers updates at specified intervals to keep data current
 * @param intervalMs Interval in milliseconds between updates
 * @returns Current timestamp that updates at the specified interval
 */
export function useRealTimeUpdate(intervalMs = 60000) {
  const [currentTime, setCurrentTime] = useState<number>(Date.now())

  useEffect(() => {
    // Update the time immediately
    setCurrentTime(Date.now())

    // Set up interval for updates
    const intervalId = setInterval(() => {
      setCurrentTime(Date.now())
    }, intervalMs)

    // Clean up interval on unmount
    return () => clearInterval(intervalId)
  }, [intervalMs])

  return currentTime
}

/**
 * Hook that provides the current date and time, updating at specified intervals
 * @param updateIntervalMs How often to update the current time (default: every minute)
 * @returns Current Date object that updates at the specified interval
 */
export function useCurrentDateTime(updateIntervalMs = 60000) {
  const timestamp = useRealTimeUpdate(updateIntervalMs)
  return new Date(timestamp)
}

/**
 * Hook that refreshes data at specified intervals
 * @param callback Function to call when data should be refreshed
 * @param intervalMs Interval in milliseconds between refreshes
 * @param dependencies Additional dependencies that should trigger a refresh
 */
export function useDataRefresh(callback: () => void, intervalMs = 60000, dependencies: any[] = []) {
  useEffect(() => {
    // Call the callback immediately
    callback()

    // Set up interval for updates
    const intervalId = setInterval(() => {
      callback()
    }, intervalMs)

    // Clean up interval on unmount
    return () => clearInterval(intervalId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs, ...dependencies])
}
