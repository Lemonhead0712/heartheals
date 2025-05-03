"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { QuizMeterBar } from "@/components/quiz-meter-bar"

interface QuizResultDisplayProps {
  quizTitle: string
  score: number
  maxScore: number
  onRetakeQuiz?: () => void
}

export function QuizResultDisplay({ quizTitle, score, maxScore, onRetakeQuiz }: QuizResultDisplayProps) {
  const percentage = Math.round((score / maxScore) * 100)

  const getFeedback = () => {
    if (percentage >= 90) return "Excellent! You've mastered this topic!"
    if (percentage >= 75) return "Great job! You have a solid understanding."
    if (percentage >= 60) return "Good work! You're on the right track."
    if (percentage >= 40) return "You're making progress. Keep learning!"
    return "Keep practicing. You'll improve with time!"
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">{quizTitle} Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center mb-4">
          <span className="text-4xl font-bold">{score}</span>
          <span className="text-lg text-muted-foreground">/{maxScore}</span>
        </div>

        <QuizMeterBar score={score} maxScore={maxScore} className="h-6" />

        <p className="text-center font-medium">{getFeedback()}</p>
      </CardContent>
      {onRetakeQuiz && (
        <CardFooter>
          <Button onClick={onRetakeQuiz} className="w-full">
            Retake Quiz
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
