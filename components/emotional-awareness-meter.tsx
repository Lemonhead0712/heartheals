"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"

type EmotionalAwarenessMeterProps = {
  score: number // Score from 0-100
  quizType: "emotional-awareness" | "self-compassion"
  categoryScores?: { [key: string]: number }
}

export function EmotionalAwarenessMeter({ score, quizType, categoryScores }: EmotionalAwarenessMeterProps) {
  const [animatedScore, setAnimatedScore] = useState(0)

  // Categories for different score ranges
  const categories = [
    {
      min: 0,
      max: 25,
      label: quizType === "emotional-awareness" ? "Developing" : "Beginning",
      description:
        quizType === "emotional-awareness"
          ? "Beginning to recognize emotions"
          : "Starting your self-compassion journey",
    },
    {
      min: 26,
      max: 50,
      label: "Growing",
      description:
        quizType === "emotional-awareness" ? "Building emotional vocabulary" : "Developing self-compassion skills",
    },
    {
      min: 51,
      max: 75,
      label: quizType === "emotional-awareness" ? "Aware" : "Practicing",
      description:
        quizType === "emotional-awareness"
          ? "Recognizing patterns and triggers"
          : "Regularly practicing self-compassion",
    },
    {
      min: 76,
      max: 100,
      label: quizType === "emotional-awareness" ? "Highly Aware" : "Advanced",
      description:
        quizType === "emotional-awareness" ? "Deep emotional understanding" : "Strong self-compassion practice",
    },
  ]

  // Find the current category based on score
  const currentCategory = categories.find((cat) => score >= cat.min && score <= cat.max) || categories[0]

  // Get insights based on quiz type and score
  const getInsights = () => {
    if (quizType === "emotional-awareness") {
      if (score < 50) {
        return [
          "Consider keeping a daily emotion journal",
          "Practice naming your feelings throughout the day",
          "Notice physical sensations that accompany emotions",
        ]
      } else {
        return [
          "Continue developing your emotional vocabulary",
          "Share your emotional insights with trusted others",
          "Explore the connections between thoughts and feelings",
        ]
      }
    } else {
      // self-compassion with category-specific insights
      const insights: string[] = []

      // Add overall insight based on total score
      if (score < 50) {
        insights.push("Self-compassion is a skill that can be developed with practice and patience.")
      } else {
        insights.push("You show good self-compassion awareness. Continue nurturing this important skill.")
      }

      // Add category-specific insights if available
      if (categoryScores && Object.keys(categoryScores).length > 0) {
        // Self-kindness insights
        const kindnessScore = categoryScores["self-kindness"] || 0
        if (kindnessScore < 50) {
          insights.push("Practice speaking to yourself as you would to a dear friend when you're struggling.")
        } else if (kindnessScore < 75) {
          insights.push("Continue developing self-kindness by acknowledging your efforts, not just results.")
        } else {
          insights.push("Your self-kindness is a strength. Share this gift with others who struggle.")
        }

        // Common humanity insights
        const humanityScore = categoryScores["common-humanity"] || 0
        if (humanityScore < 50) {
          insights.push("Remember that imperfection is part of the shared human experience—you're not alone.")
        } else if (humanityScore < 75) {
          insights.push("Continue recognizing your connection with others through shared human experiences.")
        } else {
          insights.push("Your sense of common humanity helps you stay connected even in difficult times.")
        }

        // Mindfulness insights
        const mindfulnessScore = categoryScores["mindfulness"] || 0
        if (mindfulnessScore < 50) {
          insights.push("Practice observing your thoughts and feelings without judgment or avoidance.")
        } else if (mindfulnessScore < 75) {
          insights.push("Continue developing balanced awareness of your emotions without over-identifying with them.")
        } else {
          insights.push("Your mindful approach to emotions helps you maintain perspective during challenges.")
        }
      } else {
        // Fallback insights if category scores aren't available
        if (score < 50) {
          return [
            "Practice speaking to yourself as you would to a friend",
            "Acknowledge that imperfection is part of being human",
            "Take small breaks when emotions feel overwhelming",
          ]
        } else {
          return [
            "Continue your self-compassion practice daily",
            "Share your self-compassion techniques with others",
            "Notice how self-compassion affects your relationships",
          ]
        }
      }

      return insights
    }
  }

  // Animate the score when component mounts or when score changes
  useEffect(() => {
    // Reset animated score to 0 when score changes
    setAnimatedScore(0)

    const timer = setTimeout(() => {
      setAnimatedScore(score)
    }, 500)

    return () => clearTimeout(timer)
  }, [score])

  // Calculate the angle for the gauge needle
  const needleAngle = (animatedScore / 100) * 180

  // Determine gradient colors based on quiz type
  const gradientColors =
    quizType === "emotional-awareness"
      ? ["#f8bbd0", "#ec407a", "#c2185b", "#880e4f"]
      : ["#b2ebf2", "#4dd0e1", "#00acc1", "#006064"]

  return (
    <Card className="border-purple-200 bg-white/90 backdrop-blur-sm shadow-md overflow-hidden">
      <CardContent className="p-6">
        <div className="text-center mb-4">
          <h3 className="text-xl font-semibold text-purple-800 mb-1">
            {quizType === "emotional-awareness" ? "Emotional Awareness" : "Self-Compassion"} Level
          </h3>
          <p className="text-purple-600">
            Based on your responses, here's an assessment of your{" "}
            {quizType === "emotional-awareness" ? "emotional awareness" : "self-compassion"} level
          </p>
        </div>

        <div className="relative h-48 mb-6">
          {/* Semi-circle background */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[200px] h-[100px] bg-gradient-to-r from-purple-100 to-purple-50 rounded-t-full overflow-hidden">
            {/* Colored segments */}
            {categories.map((cat, index) => (
              <div
                key={index}
                className="absolute bottom-0 left-0 h-full"
                style={{
                  width: `${((cat.max - cat.min) / 100) * 200}px`,
                  left: `${(cat.min / 100) * 200}px`,
                  background: gradientColors[index],
                  opacity: 0.7,
                }}
              />
            ))}

            {/* Tick marks */}
            <div className="absolute bottom-0 left-0 w-full h-full">
              {[0, 25, 50, 75, 100].map((tick) => (
                <div
                  key={tick}
                  className="absolute bottom-0 w-0.5 h-3 bg-white"
                  style={{ left: `${(tick / 100) * 200}px` }}
                />
              ))}
            </div>

            {/* Needle */}
            <motion.div
              className="absolute bottom-0 left-1/2 w-1 h-[95px] bg-purple-800 origin-bottom rounded-t-full"
              initial={{ rotate: 0 }}
              animate={{ rotate: needleAngle - 90 }}
              transition={{ duration: 1.5, type: "spring", stiffness: 60 }}
              style={{ transformOrigin: "bottom center" }}
            />

            {/* Center point */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-purple-800 rounded-full" />
          </div>

          {/* Score display */}
          <motion.div
            className="absolute bottom-2 left-1/2 -translate-x-1/2 text-2xl font-bold text-purple-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.5 }}
          >
            {animatedScore}%
          </motion.div>

          {/* Category label */}
          <motion.div
            className="absolute top-0 left-1/2 -translate-x-1/2 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 0.5 }}
          >
            <span className="text-xl font-semibold text-purple-800">{currentCategory?.label}</span>
            <p className="text-sm text-purple-600">{currentCategory?.description}</p>
          </motion.div>
        </div>

        {/* Category scores for self-compassion */}
        {quizType === "self-compassion" && categoryScores && Object.keys(categoryScores).length > 0 && (
          <motion.div
            className="mt-6 space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.2, duration: 0.5 }}
          >
            <h4 className="text-lg font-medium text-purple-800 mb-3">Self-Compassion Components</h4>

            <div className="space-y-4">
              {/* Self-Kindness */}
              <div className="bg-purple-50 p-3 rounded-md">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-purple-700">Self-Kindness</span>
                  <span className="text-sm font-medium text-purple-800">{categoryScores["self-kindness"] || 0}%</span>
                </div>
                <div className="w-full bg-purple-100 rounded-full h-2.5">
                  <div
                    className="bg-gradient-to-r from-pink-400 to-purple-500 h-2.5 rounded-full"
                    style={{ width: `${categoryScores["self-kindness"] || 0}%` }}
                  ></div>
                </div>
                <p className="text-sm text-purple-600 mt-2">
                  {categoryScores["self-kindness"] < 50
                    ? "Being kind to yourself during difficult times is an area for growth."
                    : categoryScores["self-kindness"] < 75
                      ? "You show good self-kindness, with room to grow."
                      : "You excel at treating yourself with kindness and understanding."}
                </p>
              </div>

              {/* Common Humanity */}
              <div className="bg-purple-50 p-3 rounded-md">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-purple-700">Common Humanity</span>
                  <span className="text-sm font-medium text-purple-800">{categoryScores["common-humanity"] || 0}%</span>
                </div>
                <div className="w-full bg-purple-100 rounded-full h-2.5">
                  <div
                    className="bg-gradient-to-r from-blue-400 to-purple-500 h-2.5 rounded-full"
                    style={{ width: `${categoryScores["common-humanity"] || 0}%` }}
                  ></div>
                </div>
                <p className="text-sm text-purple-600 mt-2">
                  {categoryScores["common-humanity"] < 50
                    ? "Recognizing that struggles are part of the shared human experience can reduce feelings of isolation."
                    : categoryScores["common-humanity"] < 75
                      ? "You generally recognize your connection with others in times of struggle."
                      : "You excel at seeing your experiences as part of the larger human experience."}
                </p>
              </div>

              {/* Mindfulness */}
              <div className="bg-purple-50 p-3 rounded-md">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-purple-700">Mindfulness</span>
                  <span className="text-sm font-medium text-purple-800">{categoryScores["mindfulness"] || 0}%</span>
                </div>
                <div className="w-full bg-purple-100 rounded-full h-2.5">
                  <div
                    className="bg-gradient-to-r from-teal-400 to-blue-500 h-2.5 rounded-full"
                    style={{ width: `${categoryScores["mindfulness"] || 0}%` }}
                  ></div>
                </div>
                <p className="text-sm text-purple-600 mt-2">
                  {categoryScores["mindfulness"] < 50
                    ? "Developing balanced awareness of difficult thoughts and feelings can help prevent over-identification."
                    : categoryScores["mindfulness"] < 75
                      ? "You show good mindful awareness of your emotions without being overwhelmed by them."
                      : "You excel at maintaining balanced awareness of your thoughts and feelings."}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Insights */}
        <motion.div
          className="mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 0.5 }}
        >
          <h4 className="text-lg font-medium text-purple-800 mb-2">Insights & Suggestions</h4>
          <ul className="space-y-2">
            {getInsights().map((insight, index) => (
              <motion.li
                key={index}
                className="flex items-start text-purple-700"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 2.5 + index * 0.2, duration: 0.5 }}
              >
                <span className="mr-2 text-purple-500">•</span>
                {insight}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </CardContent>
    </Card>
  )
}
