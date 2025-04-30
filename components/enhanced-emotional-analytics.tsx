"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  LineChart,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ReferenceLine,
} from "recharts"
import { processEmotionData, type EmotionEntry } from "@/utils/emotion-analytics"
import { LoadingSpinner } from "./ui/loading-spinner"
import {
  TrendingUp,
  TrendingDown,
  Minus,
  HelpCircle,
  Calendar,
  Filter,
  PieChartIcon,
  BarChart2,
  Zap,
  ArrowRight,
  EyeOff,
  Lightbulb,
  Info,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { EmotionChartTooltip } from "./emotion-chart-tooltip"
import { ResponsiveEmotionPieChart } from "./responsive-emotion-pie-chart"

interface EmotionalAnalyticsProps {
  emotionLogs?: EmotionEntry[]
  isLoading?: boolean
  error?: string | null
  isPremium?: boolean
}

export function EnhancedEmotionalAnalytics({
  emotionLogs = [],
  isLoading = false,
  error = null,
  isPremium = true,
}: EmotionalAnalyticsProps) {
  const { toast } = useToast()
  const [timeRange, setTimeRange] = useState<"week" | "month" | "all">("week")
  const [activeTab, setActiveTab] = useState("trends")
  const [visibleSurveyInsights, setVisibleSurveyInsights] = useState<string[]>([])
  const [customDateRange, setCustomDateRange] = useState<{ start: Date; end: Date } | null>(null)
  const [showEmotionDetails, setShowEmotionDetails] = useState(false)

  // Filter data based on selected time range
  const filteredData = useMemo(() => {
    if (!emotionLogs || emotionLogs.length === 0) return []

    const now = new Date()
    let cutoffDate: Date

    // If custom date range is set, use it
    if (customDateRange) {
      return emotionLogs.filter((entry) => {
        const entryDate = new Date(entry.timestamp)
        return entryDate >= customDateRange.start && entryDate <= customDateRange.end
      })
    }

    // Otherwise use predefined ranges
    switch (timeRange) {
      case "week":
        cutoffDate = new Date(now.setDate(now.getDate() - 7))
        break
      case "month":
        cutoffDate = new Date(now.setMonth(now.getMonth() - 1))
        break
      default:
        return emotionLogs
    }

    return emotionLogs.filter((entry) => new Date(entry.timestamp) > cutoffDate)
  }, [emotionLogs, timeRange, customDateRange])

  // Process the filtered data
  const analytics = useMemo(() => processEmotionData(filteredData), [filteredData])

  // Group entries by day and emotion for stacked chart
  const dailyEmotionGroups = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return []

    const dayMap = new Map()

    filteredData.forEach((entry) => {
      const date = new Date(entry.timestamp)
      const day = date.toLocaleDateString("en-US", { weekday: "short" })

      if (!dayMap.has(day)) {
        dayMap.set(day, {
          day,
          totalIntensity: 0,
          count: 0,
          emotions: {},
        })
      }

      const dayData = dayMap.get(day)
      dayData.totalIntensity += entry.intensity
      dayData.count += 1

      if (!dayData.emotions[entry.emotion]) {
        dayData.emotions[entry.emotion] = {
          count: 0,
          totalIntensity: 0,
        }
      }

      dayData.emotions[entry.emotion].count += 1
      dayData.emotions[entry.emotion].totalIntensity += entry.intensity
    })

    // Process the map into an array for the chart
    return Array.from(dayMap.values()).map((dayData) => {
      const result: any = { day: dayData.day }

      // Add average intensity for each emotion
      Object.entries(dayData.emotions).forEach(([emotion, data]: [string, any]) => {
        result[emotion] = Math.round((data.totalIntensity / data.count) * 10) / 10
      })

      return result
    })
  }, [filteredData])

  // Generate correlation data between survey answers and emotions
  const surveyCorrelations = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return []

    // Only include entries with survey answers
    const entriesWithSurveys = filteredData.filter((entry) => entry.surveyAnswers && entry.surveyAnswers.length > 0)

    if (entriesWithSurveys.length === 0) return []

    // Group entries by question and answer
    const correlations: any[] = []

    entriesWithSurveys.forEach((entry) => {
      if (!entry.surveyAnswers) return

      entry.surveyAnswers.forEach((answer) => {
        const existing = correlations.find(
          (item) => item.questionId === answer.questionId && item.answer === answer.answer,
        )

        if (existing) {
          existing.entries.push(entry)
          existing.avgIntensity =
            Math.round(
              ((existing.avgIntensity * (existing.entries.length - 1) + entry.intensity) / existing.entries.length) *
                10,
            ) / 10

          // Update emotion counts
          if (!existing.emotions[entry.emotion]) {
            existing.emotions[entry.emotion] = 0
          }
          existing.emotions[entry.emotion]++

          // Update top emotion
          if (existing.emotions[entry.emotion] > existing.emotions[existing.topEmotion || ""]) {
            existing.topEmotion = entry.emotion
          }
        } else {
          correlations.push({
            questionId: answer.questionId,
            answer: answer.answer,
            entries: [entry],
            avgIntensity: entry.intensity,
            emotions: { [entry.emotion]: 1 },
            topEmotion: entry.emotion,
          })
        }
      })
    })

    return correlations
  }, [filteredData])

  // Toggle visibility of survey insights
  const toggleSurveyInsight = (questionId: string) => {
    setVisibleSurveyInsights((prev) =>
      prev.includes(questionId) ? prev.filter((id) => id !== questionId) : [...prev, questionId],
    )
  }

  // Function to get trend icon
  const getTrendIcon = () => {
    switch (analytics.recentTrend) {
      case "improving":
        return <TrendingDown className="h-5 w-5 text-green-500" aria-hidden="true" />
      case "worsening":
        return <TrendingUp className="h-5 w-5 text-red-500" aria-hidden="true" />
      case "stable":
        return <Minus className="h-5 w-5 text-blue-500" aria-hidden="true" />
      default:
        return <HelpCircle className="h-5 w-5 text-gray-400" aria-hidden="true" />
    }
  }

  // Function to get emotion colors for charts
  const getEmotionColor = (emotion: string) => {
    // Common emotion colors
    const emotionColors: Record<string, string> = {
      Joy: "#4CAF50",
      Happy: "#4CAF50",
      Sad: "#9C27B0",
      Sadness: "#9C27B0",
      Anger: "#F44336",
      Angry: "#F44336",
      Fear: "#795548",
      Anxious: "#FFC107",
      Anxiety: "#FFC107",
      Calm: "#2196F3",
      Surprise: "#607D8B",
      Trust: "#00BCD4",
      Anticipation: "#FF9800",
      Disgust: "#795548",
    }

    // Check for direct match or partial match
    const normalizedEmotion = emotion.toLowerCase()

    if (emotionColors[emotion]) {
      return emotionColors[emotion]
    }

    for (const [key, value] of Object.entries(emotionColors)) {
      if (normalizedEmotion.includes(key.toLowerCase()) || key.toLowerCase().includes(normalizedEmotion)) {
        return value
      }
    }

    // Generate consistent color from string
    const hash = Array.from(normalizedEmotion).reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0)

    const h = Math.abs(hash) % 360
    return `hsl(${h}, 70%, 50%)`
  }

  // Generate insights from combined data
  const generateInsights = () => {
    if (!filteredData || filteredData.length < 3) {
      return []
    }

    const insights = []

    // Check for emotional patterns
    if (analytics.recentTrend === "improving") {
      insights.push({
        type: "positive",
        title: "Improving Trend",
        description:
          "Your emotional intensity has been decreasing recently, which may indicate improving emotional well-being.",
        icon: <TrendingDown className="h-5 w-5" />,
      })
    } else if (analytics.recentTrend === "worsening") {
      insights.push({
        type: "negative",
        title: "Increasing Intensity",
        description: "Your emotional intensity has been increasing recently. Consider practicing self-care activities.",
        icon: <TrendingUp className="h-5 w-5" />,
      })
    }

    // Check for frequent emotions
    if (analytics.emotionDistribution.length > 0) {
      const topEmotion = analytics.emotionDistribution[0]
      if (topEmotion.count >= 3 && topEmotion.count / filteredData.length > 0.5) {
        insights.push({
          type: "neutral",
          title: `Frequent ${topEmotion.name}`,
          description: `You've experienced ${topEmotion.name} ${topEmotion.count} times recently, making up over 50% of your entries.`,
          icon: <Zap className="h-5 w-5" />,
        })
      }
    }

    // Generate survey-based insights
    if (analytics.surveyInsights && analytics.surveyInsights.length > 0) {
      for (const insight of analytics.surveyInsights) {
        if (insight.distribution.length > 0 && insight.distribution[0].count >= 2) {
          insights.push({
            type: "survey",
            title: "Survey Pattern",
            description: `You frequently responded "${insight.mostCommonAnswer}" to a survey question.`,
            icon: <Lightbulb className="h-5 w-5" />,
          })
          break // Just one survey insight for now
        }
      }
    }

    return insights
  }

  const insights = useMemo(() => generateInsights(), [analytics, filteredData])

  // Share insights
  const shareInsight = (insight: any) => {
    toast({
      title: "Insight Saved",
      description: "This insight has been saved to your journal.",
    })
  }

  // Toggle detailed emotion view
  const toggleEmotionDetails = () => {
    setShowEmotionDetails(!showEmotionDetails)
  }

  return (
    <Card className="border-blue-200 bg-white/80 backdrop-blur-sm shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-pink-700">Emotional Analytics</CardTitle>
        <CardDescription className="text-pink-600">Advanced insights from your emotional journey</CardDescription>
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
        ) : !isPremium ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-center bg-gray-50 rounded-lg p-6">
            <PieChartIcon className="h-12 w-12 text-pink-300 mb-4" />
            <h3 className="text-xl font-semibold text-pink-700 mb-2">Premium Analytics</h3>
            <p className="text-pink-600 mb-4">
              Upgrade to premium to unlock detailed emotional analytics and insights.
            </p>
            <Button className="bg-pink-600 hover:bg-pink-700">Upgrade Now</Button>
          </div>
        ) : emotionLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-center">
            <p className="text-pink-700 mb-4">No emotion logs found. Start tracking your emotions to see analytics.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Time range selector */}
            <div className="flex justify-between items-center bg-pink-50 p-3 rounded-md">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-pink-700" aria-hidden="true" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-pink-800">Time Range</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant={timeRange === "week" && !customDateRange ? "default" : "outline"}
                  onClick={() => {
                    setTimeRange("week")
                    setCustomDateRange(null)
                  }}
                  className={
                    timeRange === "week" && !customDateRange ? "bg-pink-600 hover:bg-pink-700" : "border-pink-200"
                  }
                >
                  Week
                </Button>
                <Button
                  size="sm"
                  variant={timeRange === "month" && !customDateRange ? "default" : "outline"}
                  onClick={() => {
                    setTimeRange("month")
                    setCustomDateRange(null)
                  }}
                  className={
                    timeRange === "month" && !customDateRange ? "bg-pink-600 hover:bg-pink-700" : "border-pink-200"
                  }
                >
                  Month
                </Button>
                <Button
                  size="sm"
                  variant={timeRange === "all" && !customDateRange ? "default" : "outline"}
                  onClick={() => {
                    setTimeRange("all")
                    setCustomDateRange(null)
                  }}
                  className={
                    timeRange === "all" && !customDateRange ? "bg-pink-600 hover:bg-pink-700" : "border-pink-200"
                  }
                >
                  All
                </Button>
              </div>
            </div>

            {/* Trend Summary */}
            <div className="flex items-center justify-between bg-pink-50 p-3 rounded-md">
              <div className="flex items-center">
                {getTrendIcon()}
                <div className="ml-2">
                  <p className="text-sm font-medium text-pink-800">Emotional Trend</p>
                  <p className="text-xs text-pink-600">Based on {filteredData.length} entries</p>
                </div>
              </div>
              <Badge
                className={`
                ${analytics.recentTrend === "improving" ? "bg-green-100 text-green-800" : ""}
                ${analytics.recentTrend === "worsening" ? "bg-red-100 text-red-800" : ""}
                ${analytics.recentTrend === "stable" ? "bg-blue-100 text-blue-800" : ""}
                ${analytics.recentTrend === "mixed" ? "bg-yellow-100 text-yellow-800" : ""}
                ${analytics.recentTrend === "insufficient-data" ? "bg-gray-100 text-gray-800" : ""}
              `}
              >
                {analytics.recentTrend.charAt(0).toUpperCase() + analytics.recentTrend.slice(1).replace("-", " ")}
              </Badge>
            </div>

            {/* Insights Cards */}
            {insights.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-pink-700">Personal Insights</h3>
                <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2">
                  {insights.map((insight, idx) => (
                    <Card
                      key={idx}
                      className={`
                      p-3 border
                      ${insight.type === "positive" ? "border-green-200 bg-green-50" : ""}
                      ${insight.type === "negative" ? "border-red-200 bg-red-50" : ""}
                      ${insight.type === "neutral" ? "border-blue-200 bg-blue-50" : ""}
                      ${insight.type === "survey" ? "border-purple-200 bg-purple-50" : ""}
                      ${insight.type === "survey" ? "border-purple-200 bg-purple-50" : ""}
                    `}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start">
                          <div
                            className={`
                            p-2 rounded-full mr-2
                            ${insight.type === "positive" ? "bg-green-100 text-green-600" : ""}
                            ${insight.type === "negative" ? "bg-red-100 text-red-600" : ""}
                            ${insight.type === "neutral" ? "bg-blue-100 text-blue-600" : ""}
                            ${insight.type === "survey" ? "bg-purple-100 text-purple-600" : ""}
                          `}
                          >
                            {insight.icon}
                          </div>
                          <div>
                            <h4
                              className={`
                              text-sm font-medium
                              ${insight.type === "positive" ? "text-green-700" : ""}
                              ${insight.type === "negative" ? "text-red-700" : ""}
                              ${insight.type === "neutral" ? "text-blue-700" : ""}
                              ${insight.type === "survey" ? "text-purple-700" : ""}
                            `}
                            >
                              {insight.title}
                            </h4>
                            <p
                              className={`
                              text-xs
                              ${insight.type === "positive" ? "text-green-600" : ""}
                              ${insight.type === "negative" ? "text-red-600" : ""}
                              ${insight.type === "neutral" ? "text-blue-600" : ""}
                              ${insight.type === "survey" ? "text-purple-600" : ""}
                            `}
                            >
                              {insight.description}
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => shareInsight(insight)}>
                          <ArrowRight className="h-4 w-4" />
                          <span className="sr-only">Save insight</span>
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Main Analytics Tabs */}
            <Tabs defaultValue="trends" value={activeTab} onValueChange={setActiveTab} className="pt-2">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger
                  value="trends"
                  className="data-[state=active]:bg-pink-100 data-[state=active]:text-pink-800"
                >
                  <BarChart2 className="h-4 w-4 mr-2" />
                  Trends
                </TabsTrigger>
                <TabsTrigger
                  value="distribution"
                  className="data-[state=active]:bg-pink-100 data-[state=active]:text-pink-800"
                >
                  <PieChartIcon className="h-4 w-4 mr-2" />
                  Emotions
                </TabsTrigger>
                <TabsTrigger
                  value="survey"
                  className="data-[state=active]:bg-pink-100 data-[state=active]:text-pink-800"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Survey
                </TabsTrigger>
              </TabsList>

              {/* Trends Tab */}
              <TabsContent value="trends" className="space-y-4">
                <h3 className="text-sm font-medium text-pink-700">Intensity Over Time</h3>

                {analytics.intensityOverTime.length > 1 ? (
                  <div className="relative">
                    {/* Responsive container with aspect ratio */}
                    <div className="w-full aspect-[3/2] sm:aspect-[2/1] md:h-[250px] md:aspect-auto touch-manipulation">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={analytics.intensityOverTime}
                          margin={{
                            top: 10,
                            right: 10,
                            left: 0,
                            bottom: 5,
                          }}
                        >
                          <defs>
                            <linearGradient id="intensityGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#E91E63" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#E91E63" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                          <XAxis
                            dataKey="day"
                            tick={{ fontSize: 12 }}
                            stroke="#d1d5db"
                            tickMargin={8}
                            axisLine={{ stroke: "#e5e7eb" }}
                            tickLine={false}
                            padding={{ left: 5, right: 5 }}
                          />
                          <YAxis
                            domain={[0, 10]}
                            tick={{ fontSize: 12 }}
                            stroke="#d1d5db"
                            tickCount={6}
                            tickMargin={8}
                            axisLine={{ stroke: "#e5e7eb" }}
                            tickLine={false}
                            label={{
                              value: "Intensity",
                              angle: -90,
                              position: "insideLeft",
                              style: { textAnchor: "middle", fill: "#d1467d", fontSize: 12, fontWeight: 500 },
                              offset: -5,
                              dx: -10,
                            }}
                          />
                          <Tooltip
                            content={<EmotionChartTooltip />}
                            cursor={{ stroke: "#d1467d", strokeWidth: 1, strokeDasharray: "3 3" }}
                            wrapperStyle={{ outline: "none" }}
                            isAnimationActive={true}
                            position={{ y: 0 }}
                          />
                          <Area
                            type="monotone"
                            dataKey="intensity"
                            stroke="#E91E63"
                            strokeWidth={2.5}
                            fillOpacity={1}
                            fill="url(#intensityGradient)"
                            activeDot={{
                              r: 6,
                              stroke: "#fff",
                              strokeWidth: 2,
                              fill: "#E91E63",
                              className: "drop-shadow-md hover:drop-shadow-lg transition-all duration-200",
                            }}
                            animationDuration={1500}
                            animationEasing="ease-out"
                          />
                          <ReferenceLine
                            y={analytics.averageIntensity}
                            stroke="#9C27B0"
                            strokeDasharray="3 3"
                            strokeWidth={1.5}
                            label={{
                              value: `Avg: ${analytics.averageIntensity}`,
                              position: "right",
                              fill: "#9C27B0",
                              fontSize: 11,
                              fontWeight: 500,
                            }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Mobile-friendly legend */}
                    <div className="flex items-center justify-center mt-2 text-xs text-pink-700 gap-4">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-pink-500 rounded-full mr-1"></div>
                        <span>Intensity</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-0.5 bg-purple-500 mr-1" style={{ height: "2px", width: "12px" }}></div>
                        <span>Average</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-pink-600 bg-pink-50 rounded-lg">
                    <p className="mb-2">Not enough data to display trends.</p>
                    <p className="text-sm">Log more entries to see patterns over time.</p>
                  </div>
                )}
              </TabsContent>

              {/* Distribution Tab */}
              <TabsContent value="distribution" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-pink-700">Emotion Distribution</h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={toggleEmotionDetails}
                    title={showEmotionDetails ? "Hide details" : "Show details"}
                  >
                    <Info className="h-4 w-4 text-pink-600" />
                    <span className="sr-only">{showEmotionDetails ? "Hide details" : "Show details"}</span>
                  </Button>
                </div>

                {analytics.emotionDistribution.length > 0 ? (
                  <>
                    {/* Responsive Pie Chart */}
                    <ResponsiveEmotionPieChart data={analytics.emotionDistribution} />

                    {/* Detailed emotion table (toggleable) */}
                    {showEmotionDetails && (
                      <div className="mt-4 overflow-x-auto">
                        <table className="min-w-full divide-y divide-pink-200 text-sm">
                          <thead className="bg-pink-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-pink-700 uppercase tracking-wider">
                                Emotion
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-pink-700 uppercase tracking-wider">
                                Count
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-pink-700 uppercase tracking-wider">
                                Percentage
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-pink-100">
                            {analytics.emotionDistribution.map((emotion, idx) => {
                              const percentage = (emotion.count / analytics.totalEntries) * 100
                              return (
                                <tr key={idx} className="hover:bg-pink-50">
                                  <td className="px-3 py-2">
                                    <div className="flex items-center">
                                      <div
                                        className="w-3 h-3 rounded-full mr-2"
                                        style={{ backgroundColor: emotion.color }}
                                      ></div>
                                      <span className="font-medium text-pink-800">{emotion.name}</span>
                                    </div>
                                  </td>
                                  <td className="px-3 py-2 text-pink-800">{emotion.count}</td>
                                  <td className="px-3 py-2 text-pink-800">{percentage.toFixed(1)}%</td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-pink-600">No emotion data available.</div>
                )}

                <div className="bg-pink-50 p-4 rounded-md">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 md:grid-cols-4">
                    <div className="bg-white p-3 rounded-md shadow-sm">
                      <p className="text-xs text-pink-600">Most Frequent</p>
                      <p
                        className="text-lg font-medium text-pink-800 flex items-center truncate"
                        title={analytics.mostFrequentEmotion}
                      >
                        {analytics.mostFrequentEmoji} {analytics.mostFrequentEmotion}
                      </p>
                    </div>

                    <div className="bg-white p-3 rounded-md shadow-sm">
                      <p className="text-xs text-pink-600">Avg Intensity</p>
                      <p className="text-lg font-medium text-pink-800">{analytics.averageIntensity}/10</p>
                    </div>

                    <div className="bg-white p-3 rounded-md shadow-sm">
                      <p className="text-xs text-pink-600">Total Entries</p>
                      <p className="text-lg font-medium text-pink-800">{analytics.totalEntries}</p>
                    </div>

                    <div className="bg-white p-3 rounded-md shadow-sm">
                      <p className="text-xs text-pink-600">Unique Emotions</p>
                      <p className="text-lg font-medium text-pink-800">{analytics.emotionDistribution.length}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Survey Tab */}
              <TabsContent value="survey" className="space-y-4">
                <h3 className="text-sm font-medium text-pink-700">Survey Insights</h3>

                {analytics.surveyInsights && analytics.surveyInsights.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.surveyInsights.map((insight, idx) => (
                      <Card key={idx} className="border-pink-200 overflow-hidden">
                        <div
                          className="p-3 cursor-pointer hover:bg-pink-50"
                          onClick={() => toggleSurveyInsight(insight.question)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="text-sm font-medium text-pink-800">{insight.question}</h4>
                              <p className="text-xs text-pink-600">
                                Most common response: "{insight.mostCommonAnswer}"
                              </p>
                            </div>
                            <div className="flex items-center">
                              <Badge className="bg-blue-100 text-blue-800 mr-2">
                                {insight.distribution.length} responses
                              </Badge>
                              {visibleSurveyInsights.includes(insight.question) ? (
                                <EyeOff className="h-4 w-4 text-pink-400" />
                              ) : (
                                <Filter className="h-4 w-4 text-pink-400" />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Collapsible chart for this question */}
                        {visibleSurveyInsights.includes(insight.question) && (
                          <div className="p-3 pt-0 border-t border-pink-100">
                            <div className="h-[180px] pt-4">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                  data={insight.distribution}
                                  margin={{
                                    top: 5,
                                    right: 30,
                                    left: 20,
                                    bottom: 25,
                                  }}
                                >
                                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                  <XAxis
                                    dataKey="answer"
                                    tick={{ fontSize: 11 }}
                                    stroke="#d1d5db"
                                    angle={-45}
                                    textAnchor="end"
                                    height={60}
                                  />
                                  <YAxis tick={{ fontSize: 12 }} stroke="#d1d5db" />
                                  <Tooltip
                                    formatter={(value) => [`${value} responses`]}
                                    contentStyle={{
                                      fontSize: "12px",
                                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                                      borderColor: "#f9a8d4",
                                    }}
                                    labelStyle={{ color: "#be185d" }}
                                  />
                                  <Bar dataKey="count" name="Responses" fill="#9C27B0" animationDuration={1500} />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-pink-50 rounded-lg">
                    <div className="mb-2">
                      <Filter className="h-10 w-10 mx-auto text-pink-300" />
                    </div>
                    <h4 className="text-pink-700 font-medium">No Survey Data Available</h4>
                    <p className="text-sm text-pink-600 max-w-md mx-auto mt-1">
                      Complete the follow-up survey after logging emotions to see correlations between your emotions and
                      survey responses.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
