export type EmotionEntry = {
  id: string
  emotion: string
  emoji: string
  intensity: number
  notes: string
  timestamp: Date
  surveyAnswers?: SurveyAnswer[]
}

export type SurveyAnswer = {
  questionId: string
  answer: string
}

export type EmotionDistribution = {
  name: string
  count: number
  color: string
}

export type IntensityOverTime = {
  day: string
  intensity: number
  count?: number // Add count for visualization purposes
  entries?: EmotionEntry[] // Add entries for reference (if needed)
}

export type EmotionAnalytics = {
  emotionDistribution: EmotionDistribution[]
  intensityOverTime: IntensityOverTime[]
  averageIntensity: number
  mostFrequentEmotion: string
  mostFrequentEmoji: string
  totalEntries: number
  recentTrend: "improving" | "worsening" | "stable" | "mixed" | "insufficient-data"
  surveyInsights?: SurveyInsight[]
  surveyCorrelations?: any[] // Add this line
}

export type SurveyInsight = {
  question: string
  mostCommonAnswer: string
  distribution: { answer: string; count: number }[]
}

// Color mapping for common emotions
const emotionColors: Record<string, string> = {
  Joy: "#4CAF50",
  Happy: "#4CAF50",
  Excited: "#8BC34A",
  Calm: "#2196F3",
  Peaceful: "#03A9F4",
  Relaxed: "#00BCD4",
  Sad: "#9C27B0",
  Depressed: "#673AB7",
  Melancholy: "#7E57C2",
  Angry: "#F44336",
  Frustrated: "#FF5722",
  Irritated: "#FF9800",
  Anxious: "#FFC107",
  Worried: "#FFD54F",
  Nervous: "#FFE082",
  Fear: "#795548",
  Scared: "#8D6E63",
  Terrified: "#6D4C41",
  Surprised: "#607D8B",
  Confused: "#9E9E9E",
  Disgusted: "#795548",
}

// Get a color for an emotion, with fallbacks for unknown emotions
function getEmotionColor(emotion: string): string {
  const normalizedEmotion = emotion.toLowerCase()

  // Check for exact match
  if (emotionColors[emotion]) {
    return emotionColors[emotion]
  }

  // Check for partial match
  for (const [key, value] of Object.entries(emotionColors)) {
    if (normalizedEmotion.includes(key.toLowerCase()) || key.toLowerCase().includes(normalizedEmotion)) {
      return value
    }
  }

  // Generate a consistent color based on the emotion string
  const hash = Array.from(normalizedEmotion).reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc)
  }, 0)

  const h = Math.abs(hash) % 360
  return `hsl(${h}, 70%, 50%)`
}

// Enhanced function to group entries by day for the intensity chart
function groupEntriesByDay(entries: EmotionEntry[]): IntensityOverTime[] {
  const dayMap = new Map<string, { total: number; count: number; entries: EmotionEntry[] }>()

  // Sort entries by timestamp
  const sortedEntries = [...entries].sort((a, b) => {
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  })

  // Group by day and calculate average intensity
  sortedEntries.forEach((entry) => {
    const date = new Date(entry.timestamp)
    const day = date.toLocaleDateString("en-US", { weekday: "short" })

    if (!dayMap.has(day)) {
      dayMap.set(day, { total: 0, count: 0, entries: [] })
    }

    const current = dayMap.get(day)!
    current.total += entry.intensity
    current.count += 1
    current.entries.push(entry)
  })

  // Convert to array format needed for chart with enhanced data
  return Array.from(dayMap.entries()).map(([day, { total, count, entries }]) => ({
    day,
    intensity: Math.round((total / count) * 10) / 10, // Round to 1 decimal place
    count: count, // Add count for visualization purposes
    entries: entries, // Add entries for reference (if needed)
  }))
}

// Analyze emotion distribution
function analyzeEmotionDistribution(entries: EmotionEntry[]): EmotionDistribution[] {
  const emotionMap = new Map<string, number>()

  entries.forEach((entry) => {
    const emotion = entry.emotion
    emotionMap.set(emotion, (emotionMap.get(emotion) || 0) + 1)
  })

  return Array.from(emotionMap.entries())
    .map(([name, count]) => ({
      name,
      count,
      color: getEmotionColor(name),
    }))
    .sort((a, b) => b.count - a.count) // Sort by frequency, most frequent first
}

// Determine the recent trend in emotional intensity
function determineRecentTrend(
  entries: EmotionEntry[],
): "improving" | "worsening" | "stable" | "mixed" | "insufficient-data" {
  if (entries.length < 3) {
    return "insufficient-data"
  }

  // Sort entries by timestamp, most recent first
  const sortedEntries = [...entries].sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  })

  // Take the 10 most recent entries or all if less than 10
  const recentEntries = sortedEntries.slice(0, Math.min(10, sortedEntries.length))

  // Calculate the trend by comparing consecutive intensities
  let improving = 0
  let worsening = 0
  let stable = 0

  for (let i = 0; i < recentEntries.length - 1; i++) {
    const currentIntensity = recentEntries[i].intensity
    const previousIntensity = recentEntries[i + 1].intensity

    if (currentIntensity < previousIntensity) {
      improving++
    } else if (currentIntensity > previousIntensity) {
      worsening++
    } else {
      stable++
    }
  }

  // Determine the overall trend
  if (improving > worsening && improving > stable) {
    return "improving"
  } else if (worsening > improving && worsening > stable) {
    return "worsening"
  } else if (stable > improving && stable > worsening) {
    return "stable"
  } else {
    return "mixed"
  }
}

// Analyze survey answers to generate insights
function analyzeSurveyAnswers(entries: EmotionEntry[]): SurveyInsight[] {
  // Create a map to store question-answer pairs
  const questionAnswerMap = new Map<string, Map<string, number>>()

  // Collect all unique questions
  const questions = new Map<string, string>()

  // Process all entries with survey answers
  entries.forEach((entry) => {
    if (entry.surveyAnswers && entry.surveyAnswers.length > 0) {
      entry.surveyAnswers.forEach((answer) => {
        // Store question ID to text mapping (assuming we have this data)
        if (!questions.has(answer.questionId)) {
          // This is a placeholder - in a real app, you'd have the question text
          questions.set(answer.questionId, answer.questionId)
        }

        // Count answers for each question
        if (!questionAnswerMap.has(answer.questionId)) {
          questionAnswerMap.set(answer.questionId, new Map<string, number>())
        }

        const answerMap = questionAnswerMap.get(answer.questionId)!
        answerMap.set(answer.answer, (answerMap.get(answer.answer) || 0) + 1)
      })
    }
  })

  // Generate insights for each question
  const insights: SurveyInsight[] = []

  questionAnswerMap.forEach((answerMap, questionId) => {
    // Find the most common answer
    let mostCommonAnswer = ""
    let maxCount = 0

    answerMap.forEach((count, answer) => {
      if (count > maxCount) {
        maxCount = count
        mostCommonAnswer = answer
      }
    })

    // Create distribution data
    const distribution = Array.from(answerMap.entries())
      .map(([answer, count]) => ({ answer, count }))
      .sort((a, b) => b.count - a.count)

    insights.push({
      question: questions.get(questionId) || questionId,
      mostCommonAnswer,
      distribution,
    })
  })

  return insights
}

// Analyze survey answers for correlations with emotions
function analyzeSurveyCorrelations(entries: EmotionEntry[]): any[] {
  // Skip processing if no entries or no survey answers
  const entriesWithSurveys = entries.filter((entry) => entry.surveyAnswers && entry.surveyAnswers.length > 0)

  if (entriesWithSurveys.length === 0) return []

  // Group entries by survey answers to find correlations
  const correlations: Record<string, any> = {}

  entriesWithSurveys.forEach((entry) => {
    if (!entry.surveyAnswers) return

    entry.surveyAnswers.forEach((answer) => {
      const key = `${answer.questionId}:${answer.answer}`

      if (!correlations[key]) {
        correlations[key] = {
          questionId: answer.questionId,
          answer: answer.answer,
          emotions: {},
          intensities: [],
          count: 0,
        }
      }

      const corr = correlations[key]
      corr.count += 1
      corr.intensities.push(entry.intensity)

      if (!corr.emotions[entry.emotion]) {
        corr.emotions[entry.emotion] = 0
      }
      corr.emotions[entry.emotion] += 1
    })
  })

  // Process correlations to find dominant emotions and average intensities
  return Object.values(correlations).map((corr) => {
    // Find most common emotion for this answer
    let topEmotion = ""
    let topCount = 0

    Object.entries(corr.emotions).forEach(([emotion, count]: [string, number]) => {
      if (count > topCount) {
        topEmotion = emotion
        topCount = count
      }
    })

    // Calculate average intensity
    const avgIntensity = corr.intensities.reduce((sum: number, val: number) => sum + val, 0) / corr.intensities.length

    return {
      ...corr,
      topEmotion,
      avgIntensity: Math.round(avgIntensity * 10) / 10,
    }
  })
}

// Optimize data for large datasets by aggregating points
export function optimizeTimeSeriesData(data: IntensityOverTime[], maxPoints = 30): IntensityOverTime[] {
  if (!data || data.length <= maxPoints) {
    return data
  }

  const aggregationFactor = Math.ceil(data.length / maxPoints)
  const result: IntensityOverTime[] = []

  for (let i = 0; i < data.length; i += aggregationFactor) {
    const chunk = data.slice(i, i + aggregationFactor)
    const avgIntensity = chunk.reduce((sum, item) => sum + item.intensity, 0) / chunk.length

    // For the day label, use a range if aggregating multiple days
    const dayLabel =
      chunk.length > 1 ? `${chunk[0].day}${chunk.length > 2 ? "..." : "-"}${chunk[chunk.length - 1].day}` : chunk[0].day

    result.push({
      day: dayLabel,
      intensity: Math.round(avgIntensity * 10) / 10,
    })
  }

  return result
}

// Process emotion entries to generate analytics
export function processEmotionData(entries: EmotionEntry[]): EmotionAnalytics {
  if (!entries || entries.length === 0) {
    return {
      emotionDistribution: [],
      intensityOverTime: [],
      averageIntensity: 0,
      mostFrequentEmotion: "None",
      mostFrequentEmoji: "😐",
      totalEntries: 0,
      recentTrend: "insufficient-data",
    }
  }

  const emotionDistribution = analyzeEmotionDistribution(entries)
  const intensityOverTime = groupEntriesByDay(entries)
  // Optimize the data if there are too many points
  const optimizedIntensityOverTime = optimizeTimeSeriesData(intensityOverTime)

  // Calculate average intensity
  const totalIntensity = entries.reduce((sum, entry) => sum + entry.intensity, 0)
  const averageIntensity = Math.round((totalIntensity / entries.length) * 10) / 10

  // Find most frequent emotion
  const mostFrequentEmotion = emotionDistribution.length > 0 ? emotionDistribution[0].name : "None"

  // Find most frequent emoji
  const emojiMap = new Map<string, number>()
  entries.forEach((entry) => {
    emojiMap.set(entry.emoji, (emojiMap.get(entry.emoji) || 0) + 1)
  })

  const mostFrequentEmoji = Array.from(emojiMap.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || "😐"

  // Determine recent trend
  const recentTrend = determineRecentTrend(entries)

  // Generate survey insights if we have survey data
  const hasSurveyData = entries.some((entry) => entry.surveyAnswers && entry.surveyAnswers.length > 0)
  const surveyInsights = hasSurveyData ? analyzeSurveyAnswers(entries) : undefined

  // Modify the return statement in processEmotionData to include surveyCorrelations
  return {
    emotionDistribution,
    intensityOverTime: optimizedIntensityOverTime, // Use the optimized data
    averageIntensity,
    mostFrequentEmotion,
    mostFrequentEmoji,
    totalEntries: entries.length,
    recentTrend,
    surveyInsights,
    surveyCorrelations: hasSurveyData ? analyzeSurveyCorrelations(entries) : [],
  }
}
