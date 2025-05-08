"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import { LoadingSpinner } from "./ui/loading-spinner"
import type { EmotionEntry, SurveyInsight } from "@/utils/emotion-analytics"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Info, BarChart2, PieChartIcon, Activity, HelpCircle, RefreshCw } from "lucide-react"
import { formatRelativeTime } from "@/utils/date-utils"

// Define the structure for survey question metadata
interface SurveyQuestionMeta {
  id: string
  text: string
  category: string
  positiveAnswers: string[]
  negativeAnswers: string[]
}

// Define the structure for processed survey data
interface ProcessedSurveyData {
  questionInsights: SurveyInsight[]
  categoryScores: { category: string; score: number; count: number }[]
  timeSeriesData: { date: string; positiveScore: number; negativeScore: number; totalResponses: number }[]
  correlations: { emotion: string; surveyScore: number; count: number }[]
  overallScore: number
  responseRate: number
  mostPositiveCategory: string
  mostNegativeCategory: string
  totalSurveys: number
}

// Survey question metadata - in a real app, this would come from a database
const surveyQuestionsMeta: SurveyQuestionMeta[] = [
  {
    id: "sleep",
    text: "How well did you sleep last night?",
    category: "Physical",
    positiveAnswers: ["Very well", "Well"],
    negativeAnswers: ["Poorly", "Very poorly"],
  },
  {
    id: "stress",
    text: "How stressed do you feel right now?",
    category: "Mental",
    positiveAnswers: ["Not at all", "Slightly"],
    negativeAnswers: ["Very", "Extremely"],
  },
  {
    id: "energy",
    text: "How is your energy level today?",
    category: "Physical",
    positiveAnswers: ["High", "Very high"],
    negativeAnswers: ["Low", "Very low"],
  },
  {
    id: "social",
    text: "How connected do you feel to others today?",
    category: "Social",
    positiveAnswers: ["Very connected", "Connected"],
    negativeAnswers: ["Disconnected", "Very disconnected"],
  },
  {
    id: "purpose",
    text: "How meaningful did your activities feel today?",
    category: "Purpose",
    positiveAnswers: ["Very meaningful", "Meaningful"],
    negativeAnswers: ["Not meaningful", "Not at all meaningful"],
  },
]

// Color palette for different categories
const categoryColors: Record<string, string> = {
  Physical: "#4CAF50",
  Mental: "#2196F3",
  Social: "#9C27B0",
  Purpose: "#FF9800",
  Overall: "#E91E63",
}

// Function to process survey data from emotion entries
function processSurveyData(entries: EmotionEntry[]): ProcessedSurveyData {
  // Filter entries that have survey answers
  const entriesWithSurveys = entries.filter((entry) => entry.surveyAnswers && entry.surveyAnswers.length > 0)

  if (entriesWithSurveys.length === 0) {
    // Return default empty data structure
    return {
      questionInsights: [],
      categoryScores: [],
      timeSeriesData: [],
      correlations: [],
      overallScore: 0,
      responseRate: 0,
      mostPositiveCategory: "",
      mostNegativeCategory: "",
      totalSurveys: 0,
    }
  }

  // Process question insights
  const questionAnswerMap = new Map<string, Map<string, number>>()

  // Collect all answers
  entriesWithSurveys.forEach((entry) => {
    if (!entry.surveyAnswers) return

    entry.surveyAnswers.forEach((answer) => {
      if (!questionAnswerMap.has(answer.questionId)) {
        questionAnswerMap.set(answer.questionId, new Map<string, number>())
      }

      const answerMap = questionAnswerMap.get(answer.questionId)!
      answerMap.set(answer.answer, (answerMap.get(answer.answer) || 0) + 1)
    })
  })

  // Generate insights for each question
  const questionInsights: SurveyInsight[] = []

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

    // Get question text from metadata
    const questionMeta = surveyQuestionsMeta.find((q) => q.id === questionId)
    const questionText = questionMeta ? questionMeta.text : questionId

    // Create distribution data
    const distribution = Array.from(answerMap.entries())
      .map(([answer, count]) => ({ answer, count }))
      .sort((a, b) => b.count - a.count)

    questionInsights.push({
      question: questionText,
      mostCommonAnswer,
      distribution,
    })
  })

  // Calculate category scores
  const categoryScoreMap = new Map<string, { total: number; count: number }>()

  // Initialize categories
  surveyQuestionsMeta.forEach((question) => {
    if (!categoryScoreMap.has(question.category)) {
      categoryScoreMap.set(question.category, { total: 0, count: 0 })
    }
  })

  // Process each entry for category scores
  entriesWithSurveys.forEach((entry) => {
    if (!entry.surveyAnswers) return

    entry.surveyAnswers.forEach((answer) => {
      const questionMeta = surveyQuestionsMeta.find((q) => q.id === answer.questionId)
      if (!questionMeta) return

      const category = questionMeta.category
      const isPositive = questionMeta.positiveAnswers.includes(answer.answer)
      const isNegative = questionMeta.negativeAnswers.includes(answer.answer)

      // Score: positive = 1, neutral = 0.5, negative = 0
      let score = 0.5 // Default to neutral
      if (isPositive) score = 1
      if (isNegative) score = 0

      if (!categoryScoreMap.has(category)) {
        categoryScoreMap.set(category, { total: 0, count: 0 })
      }

      const categoryData = categoryScoreMap.get(category)!
      categoryData.total += score
      categoryData.count += 1
    })
  })

  // Convert to array and calculate average scores
  const categoryScores = Array.from(categoryScoreMap.entries())
    .map(([category, data]) => ({
      category,
      score: data.count > 0 ? (data.total / data.count) * 100 : 0, // Convert to percentage
      count: data.count,
    }))
    .sort((a, b) => b.score - a.score)

  // Generate time series data
  const timeSeriesMap = new Map<string, { positive: number; negative: number; total: number }>()

  entriesWithSurveys.forEach((entry) => {
    if (!entry.surveyAnswers) return

    const date = new Date(entry.timestamp).toISOString().split("T")[0]
    if (!timeSeriesMap.has(date)) {
      timeSeriesMap.set(date, { positive: 0, negative: 0, total: 0 })
    }

    const dateData = timeSeriesMap.get(date)!

    entry.surveyAnswers.forEach((answer) => {
      const questionMeta = surveyQuestionsMeta.find((q) => q.id === answer.questionId)
      if (!questionMeta) return

      const isPositive = questionMeta.positiveAnswers.includes(answer.answer)
      const isNegative = questionMeta.negativeAnswers.includes(answer.answer)

      if (isPositive) dateData.positive += 1
      if (isNegative) dateData.negative += 1
      dateData.total += 1
    })
  })

  // Convert to array and sort by date
  const timeSeriesData = Array.from(timeSeriesMap.entries())
    .map(([date, data]) => ({
      date,
      positiveScore: (data.positive / data.total) * 100,
      negativeScore: (data.negative / data.total) * 100,
      totalResponses: data.total,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Find correlations between emotions and survey scores
  const emotionScoreMap = new Map<string, { total: number; count: number }>()

  entriesWithSurveys.forEach((entry) => {
    if (!entry.surveyAnswers || !entry.emotion) return

    let entryPositiveCount = 0
    let entryTotalCount = 0

    entry.surveyAnswers.forEach((answer) => {
      const questionMeta = surveyQuestionsMeta.find((q) => q.id === answer.questionId)
      if (!questionMeta) return

      const isPositive = questionMeta.positiveAnswers.includes(answer.answer)
      if (isPositive) entryPositiveCount += 1
      entryTotalCount += 1
    })

    if (entryTotalCount === 0) return

    const surveyScore = (entryPositiveCount / entryTotalCount) * 100

    if (!emotionScoreMap.has(entry.emotion)) {
      emotionScoreMap.set(entry.emotion, { total: 0, count: 0 })
    }

    const emotionData = emotionScoreMap.get(entry.emotion)!
    emotionData.total += surveyScore
    emotionData.count += 1
  })

  // Convert to array
  const correlations = Array.from(emotionScoreMap.entries())
    .map(([emotion, data]) => ({
      emotion,
      surveyScore: data.count > 0 ? Math.round(data.total / data.count) : 0,
      count: data.count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10) // Top 10 emotions

  // Calculate overall metrics
  let totalPositive = 0
  let totalQuestions = 0

  entriesWithSurveys.forEach((entry) => {
    if (!entry.surveyAnswers) return

    entry.surveyAnswers.forEach((answer) => {
      const questionMeta = surveyQuestionsMeta.find((q) => q.id === answer.questionId)
      if (!questionMeta) return

      const isPositive = questionMeta.positiveAnswers.includes(answer.answer)
      if (isPositive) totalPositive += 1
      totalQuestions += 1
    })
  })

  const overallScore = totalQuestions > 0 ? (totalPositive / totalQuestions) * 100 : 0
  const responseRate = entries.length > 0 ? (entriesWithSurveys.length / entries.length) * 100 : 0

  // Find most positive and negative categories
  const mostPositiveCategory = categoryScores.length > 0 ? categoryScores[0].category : ""
  const mostNegativeCategory = categoryScores.length > 0 ? categoryScores[categoryScores.length - 1].category : ""

  return {
    questionInsights,
    categoryScores,
    timeSeriesData,
    correlations,
    overallScore,
    responseRate,
    mostPositiveCategory,
    mostNegativeCategory,
    totalSurveys: entriesWithSurveys.length,
  }
}

interface EmotionalSurveyVisualizerProps {
  entries: EmotionEntry[]
  className?: string
  isLoading?: boolean
  error?: string | null
}

export function EmotionalSurveyVisualizer({
  entries = [],
  className = "",
  isLoading = false,
  error = null,
}: EmotionalSurveyVisualizerProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [showDetails, setShowDetails] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Detect screen size for responsive design
  const isMobile = useMediaQuery("(max-width: 640px)")
  const isTablet = useMediaQuery("(max-width: 1024px)")

  // Process survey data
  const surveyData = useMemo(() => processSurveyData(entries), [entries])

  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setLastUpdated(new Date())
      setIsRefreshing(false)
    }, 500)
  }

  // Toggle details view
  const toggleDetails = () => {
    setShowDetails(!showDetails)
  }

  // Custom tooltip formatter
  const formatTooltipValue = (value: number, name: string) => {
    if (name === "positiveScore" || name === "negativeScore" || name === "score") {
      return `${Math.round(value)}%`
    }
    return value
  }

  // Get color for score
  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-green-600"
    if (score >= 50) return "text-blue-600"
    if (score >= 25) return "text-yellow-600"
    return "text-red-600"
  }

  // Get background color for score
  const getScoreBgColor = (score: number) => {
    if (score >= 75) return "bg-green-100"
    if (score >= 50) return "bg-blue-100"
    if (score >= 25) return "bg-yellow-100"
    return "bg-red-100"
  }

  // Get emoji for score
  const getScoreEmoji = (score: number) => {
    if (score >= 75) return "😊"
    if (score >= 50) return "🙂"
    if (score >= 25) return "😐"
    return "😟"
  }

  return (
    <Card className={`border-blue-200 bg-white/80 backdrop-blur-sm shadow-md ${className}`}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-pink-700">Emotional Survey Analysis</CardTitle>
          <CardDescription className="text-pink-600">Insights from your emotional survey responses</CardDescription>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRefresh}
          disabled={isLoading || isRefreshing}
          className="h-8 w-8"
          title="Refresh data"
        >
          <RefreshCw className={`h-4 w-4 text-pink-500 ${isRefreshing ? "animate-spin" : ""}`} />
          <span className="sr-only">Refresh</span>
        </Button>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-[300px]">
            <LoadingSpinner size="md" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-center">
            <p className="text-red-700">{error}</p>
          </div>
        ) : surveyData.totalSurveys === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-center">
            <HelpCircle className="h-12 w-12 text-pink-300 mb-4" />
            <h3 className="text-xl font-semibold text-pink-700 mb-2">No Survey Data</h3>
            <p className="text-pink-600 mb-4">
              Complete emotional surveys after logging your emotions to see insights here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Last updated indicator */}
            <div className="flex justify-end">
              <span className="text-xs text-pink-500">Last updated: {formatRelativeTime(lastUpdated)}</span>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-4">
              <Card className="bg-gradient-to-br from-pink-50 to-white border-pink-200">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center">
                    <div className={`text-3xl mb-2 ${getScoreColor(surveyData.overallScore)}`} aria-hidden="true">
                      {getScoreEmoji(surveyData.overallScore)}
                    </div>
                    <div className="text-xs text-pink-600 mb-1">Overall Wellbeing Score</div>
                    <div className="text-xl font-bold text-pink-800">{Math.round(surveyData.overallScore)}%</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-pink-50 to-white border-pink-200">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center">
                    <div className="text-3xl mb-2 text-pink-500" aria-hidden="true">
                      📊
                    </div>
                    <div className="text-xs text-pink-600 mb-1">Survey Completion Rate</div>
                    <div className="text-xl font-bold text-pink-800">{Math.round(surveyData.responseRate)}%</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-pink-50 to-white border-pink-200">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center">
                    <div className="text-3xl mb-2 text-green-500" aria-hidden="true">
                      ⭐
                    </div>
                    <div className="text-xs text-pink-600 mb-1">Strongest Category</div>
                    <div
                      className="text-xl font-bold text-pink-800 truncate max-w-full"
                      title={surveyData.mostPositiveCategory}
                    >
                      {surveyData.mostPositiveCategory || "N/A"}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-pink-50 to-white border-pink-200">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center">
                    <div className="text-3xl mb-2 text-yellow-500" aria-hidden="true">
                      🔍
                    </div>
                    <div className="text-xs text-pink-600 mb-1">Area for Growth</div>
                    <div
                      className="text-xl font-bold text-pink-800 truncate max-w-full"
                      title={surveyData.mostNegativeCategory}
                    >
                      {surveyData.mostNegativeCategory || "N/A"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Tabs */}
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="pt-2">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-pink-100 data-[state=active]:text-pink-800"
                >
                  <PieChartIcon className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="categories"
                  className="data-[state=active]:bg-pink-100 data-[state=active]:text-pink-800"
                >
                  <BarChart2 className="h-4 w-4 mr-2" />
                  Categories
                </TabsTrigger>
                <TabsTrigger
                  value="trends"
                  className="data-[state=active]:bg-pink-100 data-[state=active]:text-pink-800"
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Trends
                </TabsTrigger>
                <TabsTrigger
                  value="correlations"
                  className="data-[state=active]:bg-pink-100 data-[state=active]:text-pink-800"
                >
                  <Info className="h-4 w-4 mr-2" />
                  Details
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium text-pink-700">Wellbeing Overview</h3>
                  <span className="text-xs text-pink-500">Based on {surveyData.totalSurveys} surveys</span>
                </div>

                {/* Radar Chart for Category Overview */}
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart outerRadius="75%" data={surveyData.categoryScores}>
                      <PolarGrid stroke="#f9a8d4" strokeDasharray="3 3" />
                      <PolarAngleAxis
                        dataKey="category"
                        tick={{ fontSize: 12, fill: "#9f1239" }}
                        style={{ fontSize: 12 }}
                      />
                      <PolarRadiusAxis
                        angle={90}
                        domain={[0, 100]}
                        tick={{ fontSize: 10 }}
                        tickCount={5}
                        stroke="#f9a8d4"
                        tickFormatter={(value) => `${value}%`}
                      />
                      <Radar
                        name="Score"
                        dataKey="score"
                        stroke="rgba(219, 39, 119, 0.8)"
                        fill="rgba(219, 39, 119, 0.15)"
                        fillOpacity={0.6}
                        animationBegin={0}
                        animationDuration={1500}
                        animationEasing="ease-out"
                      />
                      <Tooltip
                        formatter={(value: any, name: any) => [
                          `${Math.round(value)}%`,
                          name === "score" ? "Wellbeing Score" : name,
                        ]}
                        contentStyle={{
                          backgroundColor: "white",
                          borderColor: "#f9a8d4",
                          borderRadius: "4px",
                          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Question Insights */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-pink-700">Key Insights</h3>
                  <div className="space-y-2">
                    {surveyData.questionInsights.slice(0, 3).map((insight, idx) => (
                      <Card key={idx} className="p-3 border border-pink-100">
                        <div className="flex items-start">
                          <div className="p-2 rounded-full mr-2 bg-pink-100 text-pink-600">
                            <Info className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-pink-700">{insight.question}</h4>
                            <p className="text-xs text-pink-600">
                              Most common answer: <span className="font-medium">{insight.mostCommonAnswer}</span>
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Categories Tab */}
              <TabsContent value="categories" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium text-pink-700">Category Scores</h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={toggleDetails}
                    title={showDetails ? "Hide details" : "Show details"}
                  >
                    <Info className="h-4 w-4 text-pink-600" />
                    <span className="sr-only">{showDetails ? "Hide details" : "Show details"}</span>
                  </Button>
                </div>

                {/* Bar Chart for Categories */}
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={surveyData.categoryScores}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                      <XAxis
                        type="number"
                        domain={[0, 100]}
                        tickFormatter={(value) => `${value}%`}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis dataKey="category" type="category" tick={{ fontSize: 12 }} width={80} />
                      <Tooltip
                        formatter={(value: any, name: any) => [
                          `${Math.round(value)}%`,
                          name === "score" ? "Wellbeing Score" : name,
                        ]}
                        contentStyle={{
                          backgroundColor: "white",
                          borderColor: "#f9a8d4",
                          borderRadius: "4px",
                          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                        }}
                      />
                      <Bar
                        dataKey="score"
                        fill="#E91E63"
                        radius={[0, 4, 4, 0]}
                        animationDuration={1500}
                        animationEasing="ease-out"
                        label={{
                          position: "right",
                          formatter: (value: any) => `${Math.round(value)}%`,
                          fontSize: 12,
                          fill: "#9f1239",
                        }}
                      >
                        {surveyData.categoryScores.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={categoryColors[entry.category] || "#E91E63"}
                            fillOpacity={0.8}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Detailed category information */}
                {showDetails && (
                  <div className="mt-4 overflow-x-auto">
                    <table className="min-w-full divide-y divide-pink-200 text-sm">
                      <thead className="bg-pink-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-pink-700 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-pink-700 uppercase tracking-wider">
                            Score
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-pink-700 uppercase tracking-wider">
                            Responses
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-pink-700 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-pink-100">
                        {surveyData.categoryScores.map((category, idx) => (
                          <tr key={idx} className="hover:bg-pink-50">
                            <td className="px-3 py-2">
                              <div className="flex items-center">
                                <div
                                  className="w-3 h-3 rounded-full mr-2"
                                  style={{ backgroundColor: categoryColors[category.category] || "#E91E63" }}
                                ></div>
                                <span className="font-medium text-pink-800">{category.category}</span>
                              </div>
                            </td>
                            <td className="px-3 py-2 text-pink-800">{Math.round(category.score)}%</td>
                            <td className="px-3 py-2 text-pink-800">{category.count}</td>
                            <td className="px-3 py-2">
                              <Badge
                                className={`${getScoreBgColor(category.score)} ${getScoreColor(
                                  category.score,
                                )} font-medium`}
                              >
                                {category.score >= 75
                                  ? "Excellent"
                                  : category.score >= 50
                                    ? "Good"
                                    : category.score >= 25
                                      ? "Fair"
                                      : "Needs Attention"}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </TabsContent>

              {/* Trends Tab */}
              <TabsContent value="trends" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium text-pink-700">Wellbeing Trends Over Time</h3>
                  <span className="text-xs text-pink-500">{surveyData.timeSeriesData.length} data points</span>
                </div>

                {surveyData.timeSeriesData.length > 1 ? (
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={surveyData.timeSeriesData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 12 }}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                          tickFormatter={(value) => {
                            const date = new Date(value)
                            return date.toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })
                          }}
                        />
                        <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} tick={{ fontSize: 12 }} />
                        <Tooltip
                          formatter={(value: any, name: any) => {
                            if (name === "positiveScore") return [`${Math.round(value)}%`, "Positive Responses"]
                            if (name === "negativeScore") return [`${Math.round(value)}%`, "Negative Responses"]
                            if (name === "totalResponses") return [value, "Total Responses"]
                            return [value, name]
                          }}
                          labelFormatter={(label) => {
                            const date = new Date(label)
                            return date.toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          }}
                          contentStyle={{
                            backgroundColor: "white",
                            borderColor: "#f9a8d4",
                            borderRadius: "4px",
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                          }}
                        />
                        <Legend
                          verticalAlign="top"
                          height={36}
                          formatter={(value) => {
                            if (value === "positiveScore") return "Positive Responses"
                            if (value === "negativeScore") return "Negative Responses"
                            return value
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="positiveScore"
                          stroke="#4CAF50"
                          strokeWidth={2}
                          dot={{ r: 4, strokeWidth: 1 }}
                          activeDot={{ r: 6, strokeWidth: 2 }}
                          animationDuration={1500}
                          animationEasing="ease-out"
                        />
                        <Line
                          type="monotone"
                          dataKey="negativeScore"
                          stroke="#F44336"
                          strokeWidth={2}
                          dot={{ r: 4, strokeWidth: 1 }}
                          activeDot={{ r: 6, strokeWidth: 2 }}
                          animationDuration={1500}
                          animationEasing="ease-out"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-8 text-pink-600 bg-pink-50 rounded-lg">
                    <p className="mb-2">Not enough data to display trends.</p>
                    <p className="text-sm">Complete more surveys to see patterns over time.</p>
                  </div>
                )}

                {/* Trend Insights */}
                {surveyData.timeSeriesData.length > 1 && (
                  <div className="bg-pink-50 p-4 rounded-md">
                    <h4 className="text-sm font-medium text-pink-700 mb-2">Trend Insights</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded-md shadow-sm">
                        <p className="text-xs text-pink-600">Recent Trend</p>
                        <p className="text-lg font-medium text-pink-800">
                          {surveyData.timeSeriesData.length >= 2 &&
                          surveyData.timeSeriesData[surveyData.timeSeriesData.length - 1].positiveScore >
                            surveyData.timeSeriesData[surveyData.timeSeriesData.length - 2].positiveScore
                            ? "Improving 📈"
                            : surveyData.timeSeriesData.length >= 2 &&
                                surveyData.timeSeriesData[surveyData.timeSeriesData.length - 1].positiveScore <
                                  surveyData.timeSeriesData[surveyData.timeSeriesData.length - 2].positiveScore
                              ? "Declining 📉"
                              : "Stable ↔️"}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-md shadow-sm">
                        <p className="text-xs text-pink-600">Survey Consistency</p>
                        <p className="text-lg font-medium text-pink-800">
                          {surveyData.timeSeriesData.length >= 3 ? "Regular tracking 🎯" : "Just getting started 🌱"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Correlations Tab */}
              <TabsContent value="correlations" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium text-pink-700">Emotion & Survey Correlations</h3>
                  <span className="text-xs text-pink-500">
                    Showing top {Math.min(surveyData.correlations.length, 10)} emotions
                  </span>
                </div>

                {surveyData.correlations.length > 0 ? (
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={surveyData.correlations}
                        margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                        <XAxis
                          type="number"
                          domain={[0, 100]}
                          tickFormatter={(value) => `${value}%`}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis dataKey="emotion" type="category" tick={{ fontSize: 12 }} width={80} />
                        <Tooltip
                          formatter={(value: any, name: any) => {
                            if (name === "surveyScore") return [`${Math.round(value)}%`, "Wellbeing Score"]
                            if (name === "count") return [value, "Number of Entries"]
                            return [value, name]
                          }}
                          contentStyle={{
                            backgroundColor: "white",
                            borderColor: "#f9a8d4",
                            borderRadius: "4px",
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                          }}
                        />
                        <Bar
                          dataKey="surveyScore"
                          fill="#9C27B0"
                          radius={[0, 4, 4, 0]}
                          animationDuration={1500}
                          animationEasing="ease-out"
                          label={{
                            position: "right",
                            formatter: (value: any) => `${Math.round(value)}%`,
                            fontSize: 12,
                            fill: "#9f1239",
                          }}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-8 text-pink-600 bg-pink-50 rounded-lg">
                    <p className="mb-2">Not enough data to display correlations.</p>
                    <p className="text-sm">Log more emotions and complete surveys to see patterns.</p>
                  </div>
                )}

                {/* Question Details */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-pink-700">Survey Question Details</h3>
                  <div className="space-y-2">
                    {surveyData.questionInsights.map((insight, idx) => (
                      <Card key={idx} className="p-3 border border-pink-100">
                        <div>
                          <h4 className="text-sm font-medium text-pink-700 mb-1">{insight.question}</h4>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {insight.distribution.map((item, i) => (
                              <Badge
                                key={i}
                                className={`${
                                  item.answer === insight.mostCommonAnswer
                                    ? "bg-pink-100 text-pink-800 border border-pink-200"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {item.answer}: {item.count}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
