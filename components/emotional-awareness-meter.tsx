"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

type EmotionalAwarenessMeterProps = {
  score: number
  quizType: "emotional-awareness" | "self-compassion"
  categoryScores?: { [key: string]: number }
}

export function EmotionalAwarenessMeter({ score, quizType, categoryScores = {} }: EmotionalAwarenessMeterProps) {
  const getScoreLabel = (score: number): string => {
    if (score >= 90) return "Excellent"
    if (score >= 75) return "Good"
    if (score >= 50) return "Moderate"
    if (score >= 25) return "Developing"
    return "Beginning"
  }

  const getScoreDescription = (score: number, quizType: string): string => {
    if (quizType === "emotional-awareness") {
      if (score >= 90)
        return "You have exceptional emotional awareness and can identify, express, and regulate your emotions effectively."
      if (score >= 75) return "You have good emotional awareness and generally recognize and manage your emotions well."
      if (score >= 50) return "You have moderate emotional awareness with room for growth in some areas."
      if (score >= 25) return "You're developing your emotional awareness skills and may benefit from more practice."
      return "You're beginning your emotional awareness journey with significant room for growth."
    } else {
      if (score >= 90)
        return "You demonstrate exceptional self-compassion and treat yourself with kindness and understanding."
      if (score >= 75) return "You have good self-compassion practices and generally treat yourself with kindness."
      if (score >= 50) return "You show moderate self-compassion with room for growth in some areas."
      if (score >= 25) return "You're developing self-compassion skills and may benefit from more practice."
      return "You're beginning your self-compassion journey with significant room for growth."
    }
  }

  const getCategoryDescription = (category: string, score: number): string => {
    if (category === "self-kindness") {
      if (score >= 75) return "You're skilled at treating yourself with kindness and understanding."
      if (score >= 50) return "You sometimes treat yourself with kindness, but could be gentler with yourself."
      return "You may be overly self-critical. Try to be kinder to yourself."
    } else if (category === "common-humanity") {
      if (score >= 75) return "You recognize that struggles are part of the shared human experience."
      if (score >= 50) return "You sometimes connect your experiences to the broader human condition."
      return "You may feel isolated in your struggles. Remember, you're not alone."
    } else if (category === "mindfulness") {
      if (score >= 75) return "You maintain balanced awareness of your thoughts and feelings."
      if (score >= 50) return "You sometimes maintain perspective on difficult thoughts and feelings."
      return "You may get overwhelmed by difficult emotions. Try to observe thoughts without judgment."
    } else if (category === "recognition") {
      if (score >= 75) return "You excel at recognizing and identifying your emotions as they arise."
      if (score >= 50) return "You sometimes recognize your emotions, but might miss subtle emotional cues."
      return "You may struggle to identify specific emotions. Practice naming what you feel."
    } else if (category === "expression") {
      if (score >= 75) return "You communicate your emotions effectively and authentically."
      if (score >= 50) return "You sometimes express your emotions, but may hold back in certain situations."
      return "You may find it difficult to express emotions. Try practicing in safe environments."
    } else if (category === "regulation") {
      if (score >= 75) return "You manage your emotions effectively, even during challenging situations."
      if (score >= 50) return "You have some strategies for emotional regulation, but they may not always work."
      return "You may struggle to regulate emotions when they're intense. Consider developing more coping strategies."
    }
    return ""
  }

  const formatCategory = (category: string): string => {
    switch (category) {
      case "self-kindness":
        return "Self-Kindness"
      case "common-humanity":
        return "Common Humanity"
      case "mindfulness":
        return "Mindfulness"
      case "recognition":
        return "Emotion Recognition"
      case "expression":
        return "Emotion Expression"
      case "regulation":
        return "Emotion Regulation"
      default:
        return category.charAt(0).toUpperCase() + category.slice(1)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-purple-200 bg-white/80 backdrop-blur-sm shadow-sm">
        <CardContent className="pt-6">
          <div className="text-center mb-4">
            <h3 className="text-2xl font-bold text-purple-800">{getScoreLabel(score)}</h3>
            <p className="text-purple-600">
              {quizType === "emotional-awareness" ? "Emotional Awareness" : "Self-Compassion"} Score: {score}
            </p>
          </div>

          <div className="mb-4">
            <Progress value={score} className="h-3" />
            <div className="flex justify-between text-xs text-purple-500 mt-1">
              <span>Beginning</span>
              <span>Developing</span>
              <span>Moderate</span>
              <span>Good</span>
              <span>Excellent</span>
            </div>
          </div>

          <p className="text-purple-700 text-center">{getScoreDescription(score, quizType)}</p>
        </CardContent>
      </Card>

      {Object.keys(categoryScores).length > 0 && (
        <Card className="border-purple-200 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardContent className="pt-6 space-y-4">
            <h3 className="text-lg font-medium text-purple-800">Category Breakdown</h3>

            {Object.entries(categoryScores).map(([category, score]) => (
              <div key={category} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-purple-700">{formatCategory(category)}</span>
                  <span className="text-purple-600">{score}</span>
                </div>
                <Progress value={score} className="h-2" />
                <p className="text-sm text-purple-600">{getCategoryDescription(category, score)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
