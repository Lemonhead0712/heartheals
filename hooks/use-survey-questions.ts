"use client"

import { useState, useEffect } from "react"
import type { SurveyAnswer } from "@/utils/emotion-analytics"

// Define the question type
export type SurveyQuestion = {
  id: string
  text: string
  options: string[]
}

// Pool of 12 distinct questions about emotional states
const questionPool: SurveyQuestion[] = [
  {
    id: "q1",
    text: "How connected do you feel to others today?",
    options: ["Very disconnected", "Somewhat disconnected", "Neutral", "Somewhat connected", "Very connected"],
  },
  {
    id: "q2",
    text: "How well did you sleep last night?",
    options: ["Very poorly", "Poorly", "Average", "Well", "Very well"],
  },
  {
    id: "q3",
    text: "How would you rate your energy level today?",
    options: ["Very low", "Low", "Moderate", "High", "Very high"],
  },
  {
    id: "q4",
    text: "How much physical activity have you had today?",
    options: ["None", "Very little", "Some", "Quite a bit", "A lot"],
  },
  {
    id: "q5",
    text: "How would you describe your stress level today?",
    options: ["Very low", "Low", "Moderate", "High", "Very high"],
  },
  {
    id: "q6",
    text: "How satisfied are you with your productivity today?",
    options: ["Very unsatisfied", "Unsatisfied", "Neutral", "Satisfied", "Very satisfied"],
  },
  {
    id: "q7",
    text: "How much time did you spend outdoors today?",
    options: ["None", "Less than 30 minutes", "30-60 minutes", "1-2 hours", "More than 2 hours"],
  },
  {
    id: "q8",
    text: "How would you rate your diet today?",
    options: ["Very unhealthy", "Somewhat unhealthy", "Average", "Somewhat healthy", "Very healthy"],
  },
  {
    id: "q9",
    text: "How much screen time have you had today?",
    options: ["Very little", "Less than average", "Average", "More than average", "A lot"],
  },
  {
    id: "q10",
    text: "How much time did you spend on self-care today?",
    options: ["None", "Very little", "Some", "Quite a bit", "A lot"],
  },
  {
    id: "q11",
    text: "How would you rate your social interactions today?",
    options: ["Very negative", "Somewhat negative", "Neutral", "Somewhat positive", "Very positive"],
  },
  {
    id: "q12",
    text: "How mindful or present have you felt today?",
    options: ["Not at all", "Slightly", "Moderately", "Quite", "Extremely"],
  },
]

export function useSurveyQuestions(count = 3) {
  const [questions, setQuestions] = useState<SurveyQuestion[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})

  // Randomly select questions on mount
  useEffect(() => {
    selectRandomQuestions()
  }, [])

  // Randomly select a specified number of questions from the pool
  const selectRandomQuestions = () => {
    const shuffled = [...questionPool].sort(() => 0.5 - Math.random())
    setQuestions(shuffled.slice(0, count))
    setAnswers({}) // Reset answers when questions change
  }

  // Select an answer for a question
  const selectAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }))
  }

  // Check if all questions have been answered
  const isComplete = questions.every((q) => answers[q.id])

  // Get formatted answers for storage
  const getFormattedAnswers = (): SurveyAnswer[] => {
    return Object.entries(answers).map(([questionId, answer]) => ({
      questionId,
      answer,
    }))
  }

  // Reset the survey with new random questions
  const resetSurvey = () => {
    selectRandomQuestions()
  }

  return {
    questions,
    answers,
    isComplete,
    selectAnswer,
    getFormattedAnswers,
    resetSurvey,
  }
}
