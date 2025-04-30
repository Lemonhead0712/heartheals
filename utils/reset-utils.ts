/**
 * Utility functions for resetting application data
 */

// Types of data that can be reset
export type ResetDataType = "emotions" | "thoughts" | "breathing" | "settings" | "all"

// Reset progress information
export interface ResetProgress {
  step: string
  progress: number
  isComplete: boolean
  error?: string
}

/**
 * Clear all localStorage data
 * @param type Type of data to clear, or 'all' for everything
 * @returns Promise that resolves when complete
 */
export const clearLocalStorage = async (type: ResetDataType = "all"): Promise<void> => {
  return new Promise((resolve) => {
    try {
      if (typeof window === "undefined") {
        resolve()
        return
      }

      if (type === "all") {
        localStorage.clear()
      } else {
        // Get all keys
        const keys = Object.keys(localStorage)

        // Filter keys based on type
        const keysToRemove = keys.filter((key) => {
          switch (type) {
            case "emotions":
              return key.startsWith("emotion_") || key.startsWith("emotionLog_")
            case "thoughts":
              return key.startsWith("thought_") || key.startsWith("thoughtLog_")
            case "breathing":
              return key.startsWith("breathing_") || key.startsWith("breathingSession_")
            case "settings":
              return key.endsWith("Settings") || key.endsWith("Preference")
            default:
              return false
          }
        })

        // Remove filtered keys
        keysToRemove.forEach((key) => localStorage.removeItem(key))
      }

      // Small delay to simulate processing
      setTimeout(resolve, 300)
    } catch (error) {
      console.error("Error clearing localStorage:", error)
      // Still resolve to continue with other operations
      resolve()
    }
  })
}

/**
 * Clear all sessionStorage data
 * @returns Promise that resolves when complete
 */
export const clearSessionStorage = async (): Promise<void> => {
  return new Promise((resolve) => {
    try {
      if (typeof window === "undefined") {
        resolve()
        return
      }

      sessionStorage.clear()
      setTimeout(resolve, 200)
    } catch (error) {
      console.error("Error clearing sessionStorage:", error)
      resolve()
    }
  })
}

/**
 * Clear all IndexedDB databases
 * @returns Promise that resolves when complete
 */
export const clearIndexedDB = async (): Promise<void> => {
  return new Promise(async (resolve) => {
    try {
      if (typeof window === "undefined" || !window.indexedDB) {
        resolve()
        return
      }

      const databases = await window.indexedDB.databases()

      if (databases.length === 0) {
        resolve()
        return
      }

      let completed = 0

      databases.forEach((db) => {
        if (db.name) {
          const deleteRequest = window.indexedDB.deleteDatabase(db.name)

          deleteRequest.onsuccess = () => {
            completed++
            if (completed === databases.length) {
              resolve()
            }
          }

          deleteRequest.onerror = () => {
            console.error(`Error deleting database ${db.name}`)
            completed++
            if (completed === databases.length) {
              resolve()
            }
          }
        } else {
          completed++
          if (completed === databases.length) {
            resolve()
          }
        }
      })
    } catch (error) {
      console.error("Error clearing IndexedDB:", error)
      resolve()
    }
  })
}

/**
 * Clear all application caches
 * @returns Promise that resolves when complete
 */
export const clearCaches = async (): Promise<void> => {
  return new Promise(async (resolve) => {
    try {
      if (typeof window === "undefined" || !("caches" in window)) {
        resolve()
        return
      }

      const cacheNames = await window.caches.keys()

      if (cacheNames.length === 0) {
        resolve()
        return
      }

      await Promise.all(cacheNames.map((cacheName) => window.caches.delete(cacheName)))
      resolve()
    } catch (error) {
      console.error("Error clearing caches:", error)
      resolve()
    }
  })
}

/**
 * Reset all application data
 * @param onProgress Callback for progress updates
 * @returns Promise that resolves when complete
 */
export const resetApplication = async (
  onProgress?: (progress: ResetProgress) => void,
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Step 1: Clear localStorage
    onProgress?.({
      step: "Clearing preferences and logs",
      progress: 0,
      isComplete: false,
    })

    await clearLocalStorage()

    onProgress?.({
      step: "Clearing preferences and logs",
      progress: 25,
      isComplete: false,
    })

    // Step 2: Clear sessionStorage
    await clearSessionStorage()

    onProgress?.({
      step: "Clearing session data",
      progress: 50,
      isComplete: false,
    })

    // Step 3: Clear IndexedDB
    await clearIndexedDB()

    onProgress?.({
      step: "Clearing databases",
      progress: 75,
      isComplete: false,
    })

    // Step 4: Clear caches
    await clearCaches()

    onProgress?.({
      step: "Finalizing reset",
      progress: 100,
      isComplete: true,
    })

    return { success: true }
  } catch (error) {
    console.error("Error during application reset:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred during reset",
    }
  }
}
