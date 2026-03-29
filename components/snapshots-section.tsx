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

  const currentTime = useRealTimeUpdate(60000)

  const loadQuizData = () => {
    try {
      const savedQuizzes = JSON.parse(localStorage.getItem("heartsHeal_quizResults") || "[]")
      const selfCompassionQuizzes = savedQuizzes
        .filter((quiz: QuizResult) => quiz.type === "self-compassion")
        .sort((a: QuizResult, b: QuizResult) => new Date(b.date).getTime() - new Date(a.date).getTime())

      setQuizResults(selfCompassionQuizzes.slice(0, 3))

      const chartData = savedQuizzes
        .filter((quiz: QuizResult) => quiz.type === "self-compassion")
        .sort((a: QuizResult, b: QuizResult) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((quiz: QuizResult) => ({
          date: new Date(quiz.date).toLocaleDateString([], { month: "short", day: "numeric" }),
          score: quiz.score,
          "self-kindness": quiz.categoryScores?.["self-kindness"] || 0,
          "common-humanity": quiz.categoryScores?.["common-humanity"] || 0,
          mindfulness: quiz.categoryScores?.["mindfulness"] || 0,
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
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "heartsHeal_quizResults") loadQuizData()
    }
    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const handleRefresh = () => {
    setIsRefreshing(true)
    loadQuizData()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  if (quizResults.length === 0) {
    return (
      <Card className="h-full glass-card-elevated">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-foreground text-base">Self-Compassion Snapshots</CardTitle>
            <CardDescription>Track your self-compassion journey</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={isRefreshing} className="h-8 w-8">
            <RefreshCw className={`h-4 w-4 text-muted-foreground ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="sr-only">Refresh</span>
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col items-center text-center px-6 pb-6">
          <div className="bg-primary/10 rounded-2xl p-4 mb-4">
            <TrendingUp className="h-7 w-7 text-primary" />
          </div>
          <h3 className="text-sm font-medium text-foreground mb-1">No snapshots yet</h3>
          <p className="text-sm text-muted-foreground mb-5 max-w-xs">
            Take a self-compassion quiz to start tracking your progress.
          </p>
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/thoughts?tab=quizzes">
              Take Your First Quiz
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full glass-card-elevated">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-foreground text-base">Self-Compassion Snapshots</CardTitle>
          <CardDescription>Track your self-compassion journey</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={isRefreshing} className="h-8 w-8">
          <RefreshCw className={`h-4 w-4 text-muted-foreground ${isRefreshing ? "animate-spin" : ""}`} />
          <span className="sr-only">Refresh</span>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {chartData.length > 1 && (
          <div className="h-[180px] w-full">
            <ChartContainer
              config={{
                score: { label: "Overall Score", color: "hsl(var(--chart-1))" },
                "self-kindness": { label: "Self-Kindness", color: "hsl(var(--chart-2))" },
                "common-humanity": { label: "Common Humanity", color: "hsl(var(--chart-3))" },
                mindfulness: { label: "Mindfulness", color: "hsl(var(--chart-4))" },
              }}
              className="h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="score" stroke="var(--color-score)" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="self-kindness" stroke="var(--color-self-kindness)" strokeWidth={1.5} dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="common-humanity" stroke="var(--color-common-humanity)" strokeWidth={1.5} dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="mindfulness" stroke="var(--color-mindfulness)" strokeWidth={1.5} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Recent Assessments</h3>
          </div>
          {quizResults.map((result, index) => (
            <div key={index} className="bg-accent/50 p-3 rounded-xl flex justify-between items-center">
              <div>
                <div className="text-sm font-medium text-foreground">Self-Compassion Check</div>
                <div className="text-xs text-muted-foreground">{formatRelativeTime(new Date(result.date))}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-foreground">{result.score}%</div>
                <div className="text-xs text-muted-foreground">Score</div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-1 flex justify-end">
          <Button asChild variant="ghost" size="sm" className="text-primary hover:text-primary/80">
            <Link href="/thoughts?tab=quizzes">
              Take Another Quiz
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
