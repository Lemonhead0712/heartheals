"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ReferenceLine,
  Legend,
  Scatter,
} from "recharts"
import { processEmotionData, type EmotionEntry } from "@/utils/emotion-analytics"
import { LoadingSpinner } from "./ui/loading-spinner"
import {
  TrendingUp,
  TrendingDown,
  Minus,
  HelpCircle,
  Calendar,
  PieChartIcon,
  BarChart2,
  Zap,
  ArrowRight,
  Lightbulb,
  Info,
  RefreshCw,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { EmotionChartTooltip } from "./emotion-chart-tooltip"
import { ResponsiveEmotionPieChart } from "./responsive-emotion-pie-chart"
import { formatRelativeTime, getDateRangeForPeriod, formatDateRange } from "@/utils/date-utils"
import { useRealTimeUpdate } from "@/hooks/use-real-time-update"
import { useMediaQuery } from "@/hooks/use-media-query"
import { InteractiveEmotionPatterns } from "./interactive-emotion-patterns"
import { ErrorBoundary } from "./error-boundary"

// Custom scatter dot component with animation
const CustomScatterDot = (props: any) => {
  const { cx, cy, fill } = props

  return (
    <g>
      {/* Pulse effect */}
      <circle cx={cx} cy={cy} r={6} fill={fill} opacity={0.2} className="animate-pulse-slow" />

      {/* Main dot */}
      <circle cx={cx} cy={cy} r={4} stroke="white" strokeWidth={1.5} fill={fill} className="drop-shadow-sm" />
    </g>
  )
}

// Custom active dot with enhanced appearance
const CustomActiveDot = (props: any) => {
  const { cx, cy, stroke, fill } = props

  return (
    <g>
      {/* Outer ring */}
      <circle
        cx={cx}
        cy={cy}
        r={8}
        stroke={stroke}
        strokeWidth={2}
        fill="none"
        className="animate-ping-once"
        style={{ animationDuration: "1s" }}
      />

      {/* Inner dot */}
      <circle cx={cx} cy={cy} r={4} stroke="white" strokeWidth={1.5} fill={fill} className="drop-shadow-md" />
    </g>
  )
}

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
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [highlightedDay, setHighlightedDay] = useState<string | null>(null)

  // Detect screen size for responsive design
  const isMobile = useMediaQuery("(max-width: 640px)")
  const isTablet = useMediaQuery("(max-width: 1024px)")

  // Update the component every minute to keep relative times current
  const currentTime = useRealTimeUpdate(60000)

  // Update last updated time when data changes
  useEffect(() => {
    if (!isLoading && emotionLogs.length > 0) {
      setLastUpdated(new Date())
    }
  }, [emotionLogs, isLoading])

  // Handle manual refresh
  const handleRefresh = () => {
    setIsRefreshing(true)
    // In a real implementation, this would trigger a data refresh
    // For now, we'll just update the last updated time
    setTimeout(() => {
      setLastUpdated(new Date())
      setIsRefreshing(false)
    }, 500)
  }

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

  // Enhanced data for area chart with scatter points
  const enhancedChartData = useMemo(() => {
    if (!analytics.intensityOverTime || analytics.intensityOverTime.length === 0) {
      return []
    }

    // Add additional data for visualization enhancements
    return analytics.intensityOverTime.map((item) => {
      // Calculate additional metrics for visualization
      const hasMultipleEntries = typeof item.count === "number" && item.count > 1

      return {
        ...item,
        // Add smooth transitions for area chart
        smoothIntensity: item.intensity,
        // Add point size based on data counts if available
        pointSize: hasMultipleEntries ? Math.min(Math.max(item.count, 3), 7) : 3,
        // Add moving average if we have enough data points
        movingAvg: item.intensity, // Simplified, would calculate actual moving average with enough data
      }
    })
  }, [analytics.intensityOverTime])

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

  // Get date range text
  const getDateRangeText = () => {
    if (customDateRange) {
      return formatDateRange(customDateRange.start, customDateRange.end)
    }

    const { start, end } = getDateRangeForPeriod(timeRange === "all" ? "year" : timeRange)

    switch (timeRange) {
      case "week":
        return "Past 7 days"
      case "month":
        return "Past 30 days"
      case "all":
        return "All time"
      default:
        return formatDateRange(start, end)
    }
  }

  // Handle day highlighting on chart hover
  const handleDayHighlight = (data: any) => {
    if (data && data.activeLabel) {
      setHighlightedDay(data.activeLabel)
    } else {
      setHighlightedDay(null)
    }
  }

  return (
    <Card className="border-blue-200 bg-white/80 backdrop-blur-sm shadow-md">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-pink-700">Emotional Analytics</CardTitle>
          <CardDescription className="text-pink-600">Advanced insights from your emotional journey</CardDescription>
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
            {/* Last updated indicator */}
            <div className="flex justify-end">
              <span className="text-xs text-pink-500">Last updated: {formatRelativeTime(lastUpdated)}</span>
            </div>

            {/* Time range selector */}
            <div className="flex justify-between items-center bg-pink-50 p-3 rounded-md">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-pink-700" aria-hidden="true" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-pink-800">Time Range</p>
                  <p className="text-xs text-pink-600">{getDateRangeText()}</p>
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
                  value="patterns"
                  className="data-[state=active]:bg-pink-100 data-[state=active]:text-pink-800"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Patterns
                </TabsTrigger>
                <TabsTrigger
                  value="distribution"
                  className="data-[state=active]:bg-pink-100 data-[state=active]:text-pink-800"
                >
                  <PieChartIcon className="h-4 w-4 mr-2" />
                  Distribution
                </TabsTrigger>
              </TabsList>

              {/* Trends Tab - Intensity Over Time */}
              <TabsContent value="trends" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium text-pink-700">Intensity Over Time</h3>
                  <span className="text-xs text-pink-500">Real-time data</span>
                </div>

                {enhancedChartData.length > 1 ? (
                  <div className="relative">
                    {/* Enhanced chart container with better responsiveness */}
                    <div className="w-full aspect-[3/2] sm:aspect-[2/1] md:h-[300px] md:aspect-auto touch-manipulation rounded-lg bg-gradient-to-b from-white to-pink-50 p-4 shadow-sm border border-pink-100">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={enhancedChartData}
                          margin={{
                            top: 16,
                            right: 16,
                            left: 0,
                            bottom: 5,
                          }}
                          onMouseMove={handleDayHighlight}
                          onMouseLeave={() => setHighlightedDay(null)}
                        >
                          {/* Enhanced gradients */}
                          <defs>
                            <linearGradient id="colorIntensity" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#E91E63" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#E91E63" stopOpacity={0.05} />
                            </linearGradient>
                            <linearGradient id="colorMoving" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#9C27B0" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#9C27B0" stopOpacity={0.05} />
                            </linearGradient>
                            <filter id="shadow" filterUnits="userSpaceOnUse" x="-20" y="-20" width="200%" height="200%">
                              <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#00000020" />
                            </filter>
                          </defs>

                          {/* Better grid styling */}
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} strokeOpacity={0.5} />

                          {/* Enhanced axes */}
                          <XAxis
                            dataKey="day"
                            tick={{ fontSize: 12, fill: "#9f1239" }}
                            stroke="#f9a8d4"
                            tickMargin={10}
                            axisLine={{ stroke: "#f9a8d4" }}
                            tickLine={{ stroke: "#f9a8d4" }}
                            padding={{ left: 5, right: 5 }}
                          />
                          <YAxis
                            domain={[0, 10]}
                            tick={{ fontSize: 12, fill: "#9f1239" }}
                            stroke="#f9a8d4"
                            tickCount={6}
                            tickMargin={10}
                            axisLine={{ stroke: "#f9a8d4" }}
                            tickLine={{ stroke: "#f9a8d4" }}
                            label={{
                              value: "Intensity",
                              angle: -90,
                              position: "insideLeft",
                              style: { textAnchor: "middle", fill: "#d1467d", fontSize: 12, fontWeight: 500 },
                              offset: -5,
                              dx: -15,
                            }}
                          />

                          {/* Enhanced tooltip */}
                          <Tooltip
                            content={<EmotionChartTooltip />}
                            cursor={{ stroke: "#d1467d", strokeWidth: 1, strokeDasharray: "3 3" }}
                            wrapperStyle={{ outline: "none", filter: "drop-shadow(0px 2px 8px rgba(0, 0, 0, 0.15))" }}
                            isAnimationActive={true}
                            position={{ y: 0 }}
                          />

                          {/* Area under the curve with gradient */}
                          <Area
                            type="monotoneX"
                            dataKey="intensity"
                            stroke="#E91E63"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorIntensity)"
                            activeDot={(props) => <CustomActiveDot {...props} fill="#E91E63" stroke="#fff" />}
                            animationDuration={1500}
                            animationEasing="ease-out"
                            isAnimationActive={!isMobile}
                          />

                          {/* Scatter points to emphasize data points */}
                          <Scatter
                            name="Entries"
                            data={enhancedChartData}
                            fill="#E91E63"
                            shape={(props) => <CustomScatterDot {...props} />}
                            isAnimationActive={!isMobile}
                          />

                          {/* Reference line for average */}
                          <ReferenceLine
                            y={analytics.averageIntensity}
                            stroke="#9C27B0"
                            strokeDasharray="3 3"
                            strokeWidth={2}
                            label={{
                              value: `Avg: ${analytics.averageIntensity}`,
                              position: "right",
                              fill: "#9C27B0",
                              fontSize: 11,
                              fontWeight: 600,
                              backgroundColor: "#fff",
                              padding: 5,
                            }}
                          />

                          {/* Enhanced legend */}
                          <Legend
                            verticalAlign="top"
                            height={36}
                            content={() => (
                              <div className="flex items-center justify-center mt-2 text-xs gap-4">
                                <div className="flex items-center">
                                  <div className="w-3 h-3 bg-pink-500 rounded-full mr-1"></div>
                                  <span className="text-pink-700 font-medium">Intensity</span>
                                </div>
                                <div className="flex items-center">
                                  <div
                                    className="w-3 h-0.5 bg-purple-500 mr-1"
                                    style={{ height: "2px", width: "12px" }}
                                  ></div>
                                  <span className="text-purple-700 font-medium">Average</span>
                                </div>
                              </div>
                            )}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Enhanced data statistics */}
                    {highlightedDay && (
                      <div className="mt-3 p-2 bg-white border border-pink-200 rounded-md shadow-sm text-xs">
                        <p className="font-medium text-pink-700">{highlightedDay}: Showing detailed emotion data</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-pink-600 bg-pink-50 rounded-lg">
                    <p className="mb-2">Not enough data to display trends.</p>
                    <p className="text-sm">Log more entries to see patterns over time.</p>
                  </div>
                )}
              </TabsContent>

              {/* NEW: Patterns Tab - Interactive Calendar and Visualizations */}
              <TabsContent value="patterns" className="mt-0">
                <ErrorBoundary>
                  <InteractiveEmotionPatterns entries={filteredData} />
                </ErrorBoundary>
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
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
