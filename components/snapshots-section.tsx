"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ArrowRight, TrendingUp, RefreshCw } from "lucide-react"
import Link from "next/link"
import { formatRelativeTime } from "@/utils/date-utils"
import { useRealTimeUpdate } from "@/hooks/use-real-time-update"

type QuizResult = {
  type: string
  score: number
  categoryScores?: {
    [key: string]: number
  }
  date: string
}

export function SnapshotsSection() {
  const [quizResults, setQuizResults] = useState<QuizResult[]>([])
  const [chartData, setChartData] = useState<any[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Update the component every minute to keep relative times current
  const currentTime = useRealTimeUpdate(60000)

  const loadQuizData = () => {
    try {
      const savedQuizzes = JSON.parse(localStorage.getItem("heartsHeal_quizResults") || "[]")

      // Filter for self-compassion quizzes and sort by date (newest first)
      const selfCompassionQuizzes = savedQuizzes
        .filter((quiz: QuizResult) => quiz.type === "self-compassion")
        .sort((a: QuizResult, b: QuizResult) => new Date(b.date).getTime() - new Date(a.date).getTime())

      setQuizResults(selfCompassionQuizzes.slice(0, 3)) // Get the 3 most recent results

      // Prepare data for the chart - we want to show the trend over time
      // Sort by date (oldest first) for the chart
      const chartData = savedQuizzes
        .filter((quiz: QuizResult) => quiz.type === "self-compassion")
        .sort((a: QuizResult, b: QuizResult) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((quiz: QuizResult) => ({
          date: new Date(quiz.date).toLocaleDateString([], { month: "short", day: "numeric" }),
          score: quiz.score,
          "self-kindness": quiz.categoryScores?.["self-kindness"] || 0,
          "common-humanity": quiz.categoryScores?.["common-humanity"] || 0,
          mindfulness: quiz.categoryScores?.["mindfulness"] || 0,
          timestamp: new Date(quiz.date).getTime(), // Add raw timestamp for sorting
        }))

      setChartData(chartData)
    } catch (error) {
      console.error("Error loading quiz results:", error)
      setQuizResults([])
      setChartData([])
    }
  }

  useEffect(() => {
    loadQuizData()

    // Set up event listener for localStorage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "heartsHeal_quizResults") {
        loadQuizData()
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  // Manual refresh function
  const handleRefresh = () => {
    setIsRefreshing(true)
    loadQuizData()
    setTimeout(() => setIsRefreshing(false), 500) // Show refresh animation for at least 500ms
  }

  // If no quiz results, show a prompt to take a quiz
  if (quizResults.length === 0) {
    return (
      <Card className="h-full border-purple-200 bg-white/80 backdrop-blur-sm shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-purple-800">Self-Compassion Snapshots</CardTitle>
            <CardDescription className="text-purple-600">Track your self-compassion journey over time</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-8 w-8"
            title="Refresh data"
          >
            <RefreshCw className={`h-4 w-4 text-purple-500 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="sr-only">Refresh</span>
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col items-center text-center p-4">
          <div className="bg-purple-50 rounded-full p-3 mb-3">
            <TrendingUp className="h-8 w-8 text-purple-500" />
          </div>
          <h3 className="text-lg font-medium text-purple-700 mb-2">No snapshots yet</h3>
          <p className="text-purple-600 mb-3">Take a self-compassion quiz to start tracking your progress over time.</p>
          <Button asChild className="bg-purple-600 hover:bg-purple-700 mb-4">
            <Link href="/thoughts?tab=quizzes">
              Take Your First Quiz
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>

          <div className="w-full border-t border-purple-100 pt-3 mt-1">
            <h4 className="text-sm font-medium text-purple-700 mb-2">Available Quiz Types:</h4>
            <ul className="text-sm text-purple-600 space-y-1.5 text-left">
              <li className="flex items-start">
                <div className="mr-2 mt-1 h-1.5 w-1.5 rounded-full bg-purple-400 flex-shrink-0"></div>
                <span>
                  <strong>Self-Compassion Check:</strong> Evaluates how kindly you treat yourself during difficult times
                </span>
              </li>
              <li className="flex items-start">
                <div className="mr-2 mt-1 h-1.5 w-1.5 rounded-full bg-purple-400 flex-shrink-0"></div>
                <span>
                  <strong>Mindfulness Assessment:</strong> Measures your awareness of present moment experiences
                </span>
              </li>
              <li className="flex items-start">
                <div className="mr-2 mt-1 h-1.5 w-1.5 rounded-full bg-purple-400 flex-shrink-0"></div>
                <span>
                  <strong>Common Humanity:</strong> Explores how connected you feel to others in your struggles
                </span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full border-purple-200 bg-white/80 backdrop-blur-sm shadow-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-purple-800">Self-Compassion Snapshots</CardTitle>
          <CardDescription className="text-purple-600">Track your self-compassion journey over time</CardDescription>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="h-8 w-8"
          title="Refresh data"
        >
          <RefreshCw className={`h-4 w-4 text-purple-500 ${isRefreshing ? "animate-spin" : ""}`} />
          <span className="sr-only">Refresh</span>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3 px-4 pb-4 pt-2">
        {/* Chart showing progress over time */}
        {chartData.length > 1 && (
          <div className="h-[200px] w-full mb-4">
            <ChartContainer
              config={{
                score: {
                  label: "Overall Score",
                  color: "hsl(var(--chart-1))",
                },
                "self-kindness": {
                  label: "Self-Kindness",
                  color: "hsl(var(--chart-2))",
                },
                "common-humanity": {
                  label: "Common Humanity",
                  color: "hsl(var(--chart-3))",
                },
                mindfulness: {
                  label: "Mindfulness",
                  color: "hsl(var(--chart-4))",
                },
              }}
              className="h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="var(--color-score)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="self-kindness"
                    stroke="var(--color-self-kindness)"
                    strokeWidth={1.5}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="common-humanity"
                    stroke="var(--color-common-humanity)"
                    strokeWidth={1.5}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="mindfulness"
                    stroke="var(--color-mindfulness)"
                    strokeWidth={1.5}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        )}

        {/* Recent quiz results */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-purple-700">Recent Assessments</h3>
            <span className="text-xs text-purple-500">Last updated: {formatRelativeTime(new Date())}</span>
          </div>
          {quizResults.map((result, index) => (
            <div key={index} className="bg-purple-50 p-3 rounded-md flex justify-between items-center">
              <div>
                <div className="text-sm font-medium text-purple-800">Self-Compassion Check</div>
                <div className="text-xs text-purple-600">{formatRelativeTime(new Date(result.date))}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-purple-800">{result.score}%</div>
                <div className="text-xs text-purple-600">Overall Score</div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 flex justify-end">
          <Button asChild variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50">
            <Link href="/thoughts?tab=quizzes">
              Take Another Quiz
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
