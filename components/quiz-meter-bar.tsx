"use client"

import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"

interface QuizMeterBarProps {
  score: number
  maxScore?: number
  showLabel?: boolean
  className?: string
  height?: string
  animationDuration?: number
}

export function QuizMeterBar({
  score,
  maxScore = 100,
  showLabel = true,
  className = "",
  height = "h-4",
  animationDuration = 1500,
}: QuizMeterBarProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const percentage = Math.round((score / maxScore) * 100)

  useEffect(() => {
    // Start with 0 and animate to the actual value
    setDisplayValue(0)

    // Use a small delay to ensure the 0 value is rendered first
    const timer = setTimeout(() => {
      setDisplayValue(percentage)
    }, 100)

    return () => clearTimeout(timer)
  }, [percentage])

  return (
    <div className="space-y-2">
      <Progress
        value={displayValue}
        className={`${height} ${className}`}
        animate={true}
        animationDuration={animationDuration}
      />
      {showLabel && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Score</span>
          <span className="font-medium">{displayValue}%</span>
        </div>
      )}
    </div>
  )
}
