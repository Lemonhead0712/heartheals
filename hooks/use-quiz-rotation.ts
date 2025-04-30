"use client"

import { useState, useEffect } from "react"

type QuizHistory = {
  quizType: string
  questionIds: string[]
  timestamp: string
}

export function useQuizRotation(quizType: string) {
  const [shownQuestionIds, setShownQuestionIds] = useState<string[]>([])
  const [currentQuizQuestions, setCurrentQuizQuestions] = useState<string[]>([])

  // Load quiz history from localStorage
  useEffect(() => {
    try {
      const quizHistory = JSON.parse(localStorage.getItem("heartsHeal_quizHistory") || "[]") as QuizHistory[]

      // Find history for this quiz type
      const thisQuizHistory = quizHistory
        .filter((history) => history.quizType === quizType)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5) // Consider only the 5 most recent quiz sessions

      // Extract question IDs from history
      if (thisQuizHistory.length > 0) {
        const recentQuestionIds = thisQuizHistory.flatMap((history) => history.questionIds)
        setShownQuestionIds(recentQuestionIds)
      }
    } catch (error) {
      console.error("Error loading quiz history:", error)
      setShownQuestionIds([])
    }
  }, [quizType])

  // Save the current quiz session to history
  const saveQuizSession = (questionIds: string[]) => {
    try {
      const quizHistory = JSON.parse(localStorage.getItem("heartsHeal_quizHistory") || "[]") as QuizHistory[]

      // Add new session
      const newSession: QuizHistory = {
        quizType,
        questionIds,
        timestamp: new Date().toISOString(),
      }

      // Add to history and save
      quizHistory.push(newSession)

      // Keep only the last 20 sessions to avoid localStorage bloat
      const trimmedHistory = quizHistory.slice(-20)

      localStorage.setItem("heartsHeal_quizHistory", JSON.stringify(trimmedHistory))

      // Update state
      setShownQuestionIds([...shownQuestionIds, ...questionIds])
      setCurrentQuizQuestions(questionIds)
    } catch (error) {
      console.error("Error saving quiz history:", error)
    }
  }

  return {
    shownQuestionIds,
    currentQuizQuestions,
    saveQuizSession,
  }
}
