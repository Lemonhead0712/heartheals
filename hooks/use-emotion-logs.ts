"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import type { EmotionEntry, SurveyAnswer } from "@/utils/emotion-analytics"

export function useEmotionLogs() {
  const { toast } = useToast()
  const [entries, setEntries] = useState<EmotionEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load entries from localStorage
  useEffect(() => {
    loadEntries()
  }, [])

  const loadEntries = () => {
    setIsLoading(true)
    setError(null)

    try {
      const savedEntries = localStorage.getItem("heartsHeal_emotionLogs")
      if (savedEntries) {
        const parsed = JSON.parse(savedEntries)
        // Convert string timestamps back to Date objects
        const processedEntries = parsed.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp),
        }))
        setEntries(processedEntries)
      } else {
        setEntries([])
      }
    } catch (err) {
      console.error("Error loading emotion logs:", err)
      setError("Failed to load your emotion logs. Please try again.")
      toast({
        title: "Error",
        description: "Failed to load your emotion logs. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addEntry = (entry: Omit<EmotionEntry, "id" | "timestamp">) => {
    try {
      const newEntry: EmotionEntry = {
        ...entry,
        id: Date.now().toString(),
        timestamp: new Date(),
      }

      const updatedEntries = [newEntry, ...entries]
      setEntries(updatedEntries)

      // Save to localStorage
      localStorage.setItem("heartsHeal_emotionLogs", JSON.stringify(updatedEntries))

      // Trigger storage event for other components to detect the change
      window.dispatchEvent(new Event("storage"))

      toast({
        title: "Entry Saved",
        description: "Your emotional log entry has been saved successfully.",
      })

      return true
    } catch (err) {
      console.error("Error saving emotion log:", err)
      toast({
        title: "Error",
        description: "Failed to save your emotion log. Please try again.",
        variant: "destructive",
      })
      return false
    }
  }

  const deleteEntry = (id: string) => {
    try {
      const updatedEntries = entries.filter((entry) => entry.id !== id)
      setEntries(updatedEntries)

      // Save to localStorage
      localStorage.setItem("heartsHeal_emotionLogs", JSON.stringify(updatedEntries))

      // Trigger storage event for other components to detect the change
      window.dispatchEvent(new Event("storage"))

      toast({
        title: "Entry Deleted",
        description: "Your emotional log entry has been deleted.",
      })

      return true
    } catch (err) {
      console.error("Error deleting emotion log:", err)
      toast({
        title: "Error",
        description: "Failed to delete your emotion log. Please try again.",
        variant: "destructive",
      })
      return false
    }
  }

  const updateEntry = (id: string, updates: Partial<Omit<EmotionEntry, "id" | "timestamp">>) => {
    try {
      const entryIndex = entries.findIndex((entry) => entry.id === id)

      if (entryIndex === -1) {
        toast({
          title: "Error",
          description: "Entry not found. Please try again.",
          variant: "destructive",
        })
        return false
      }

      const updatedEntry = {
        ...entries[entryIndex],
        ...updates,
      }

      const updatedEntries = [...entries]
      updatedEntries[entryIndex] = updatedEntry

      setEntries(updatedEntries)

      // Save to localStorage
      localStorage.setItem("heartsHeal_emotionLogs", JSON.stringify(updatedEntries))

      // Trigger storage event for other components to detect the change
      window.dispatchEvent(new Event("storage"))

      toast({
        title: "Entry Updated",
        description: "Your emotional log entry has been updated.",
      })

      return true
    } catch (err) {
      console.error("Error updating emotion log:", err)
      toast({
        title: "Error",
        description: "Failed to update your emotion log. Please try again.",
        variant: "destructive",
      })
      return false
    }
  }

  // Add survey answers to the most recent entry
  const addSurveyAnswers = (answers: SurveyAnswer[]): boolean => {
    try {
      if (!entries || entries.length === 0) {
        console.warn("No emotion entries available to add survey answers to")
        return false
      }

      const updatedEntries = [...entries]
      updatedEntries[0] = {
        ...updatedEntries[0],
        surveyAnswers: answers,
      }

      setEntries(updatedEntries)

      // Save to localStorage
      localStorage.setItem("heartsHeal_emotionLogs", JSON.stringify(updatedEntries))

      // Trigger storage event for other components to detect the change
      window.dispatchEvent(new Event("storage"))

      toast({
        title: "Survey Saved",
        description: "Your survey responses have been saved successfully.",
      })

      return true
    } catch (err) {
      console.error("Error adding survey answers:", err)
      toast({
        title: "Error",
        description: "Failed to save your survey answers. Please try again.",
        variant: "destructive",
      })
      return false
    }
  }

  return {
    entries,
    isLoading,
    error,
    loadEntries,
    addEntry,
    deleteEntry,
    updateEntry,
    addSurveyAnswers,
  }
}
