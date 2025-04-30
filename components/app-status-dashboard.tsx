"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react"
import { useSubscription } from "@/contexts/subscription-context"

type SystemStatus = {
  name: string
  status: "operational" | "degraded" | "outage" | "maintenance" | "unknown"
  message?: string
}

type AppMetrics = {
  totalUsers: number
  activeUsers: number
  premiumUsers: number
  totalJournalEntries: number
  totalQuizzes: number
  totalEmotionLogs: number
}

export function AppStatusDashboard() {
  const { tier, isActive } = useSubscription()
  const [activeTab, setActiveTab] = useState("status")
  const [isLoading, setIsLoading] = useState(true)
  const [systemStatus, setSystemStatus] = useState<SystemStatus[]>([])
  const [appMetrics, setAppMetrics] = useState<AppMetrics | null>(null)
  const [userStats, setUserStats] = useState({
    journalEntries: 0,
    quizzes: 0,
    emotionLogs: 0,
  })

  // Simulate loading system status
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mock system status data
      setSystemStatus([
        { name: "Authentication Service", status: "operational" },
        { name: "Database", status: "operational" },
        { name: "Payment Processing", status: "operational" },
        { name: "Analytics", status: "operational" },
        { name: "API Services", status: "operational" },
      ])

      // Mock app metrics
      setAppMetrics({
        totalUsers: 5243,
        activeUsers: 1872,
        premiumUsers: 843,
        totalJournalEntries: 28976,
        totalQuizzes: 12453,
        totalEmotionLogs: 35621,
      })

      // Load user stats from localStorage
      try {
        const journalEntries = JSON.parse(localStorage.getItem("heartsHeal_journalEntries") || "[]").length
        const quizResults = JSON.parse(localStorage.getItem("heartsHeal_quizResults") || "[]").length
        const emotionLogs = JSON.parse(localStorage.getItem("heartsHeal_emotionLogs") || "[]").length

        setUserStats({
          journalEntries,
          quizzes: quizResults,
          emotionLogs,
        })
      } catch (error) {
        console.error("Error loading user stats:", error)
      }

      setIsLoading(false)
    }

    loadData()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "bg-green-100 text-green-800"
      case "degraded":
        return "bg-yellow-100 text-yellow-800"
      case "outage":
        return "bg-red-100 text-red-800"
      case "maintenance":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case "degraded":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case "outage":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "maintenance":
        return <Loader2 className="h-4 w-4 text-blue-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <Card className="border-purple-200 bg-white/90 backdrop-blur-sm shadow-md">
      <CardHeader>
        <CardTitle className="text-purple-800">HeartsHeal Application Status</CardTitle>
        <CardDescription className="text-purple-600">
          Monitor the health and performance of the HeartsHeal application
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="status" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="status" className="text-purple-700 data-[state=active]:bg-purple-100">
              System Status
            </TabsTrigger>
            <TabsTrigger value="user" className="text-purple-700 data-[state=active]:bg-purple-100">
              Your Usage
            </TabsTrigger>
          </TabsList>

          <TabsContent value="status">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                <span className="ml-2 text-purple-700">Loading system status...</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" />
                    <span className="font-medium text-green-800">All Systems Operational</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Updated just now</Badge>
                </div>

                <div className="space-y-2">
                  {systemStatus.map((system) => (
                    <div key={system.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center">
                        {getStatusIcon(system.status)}
                        <span className="ml-2 text-gray-800">{system.name}</span>
                      </div>
                      <Badge className={getStatusColor(system.status)}>
                        {system.status.charAt(0).toUpperCase() + system.status.slice(1)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="user">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                <span className="ml-2 text-purple-700">Loading your usage data...</span>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-purple-50 p-4 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-purple-800">Your Subscription</h3>
                    <Badge
                      className={
                        tier === "premium" && isActive ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800"
                      }
                    >
                      {tier === "premium" && isActive ? "Premium" : "Free Tier"}
                    </Badge>
                  </div>
                  <p className="text-sm text-purple-600">
                    {tier === "premium" && isActive
                      ? "You have unlimited access to all HeartsHeal features."
                      : "Upgrade to premium for unlimited access to all features."}
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-purple-800">Your Activity</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-pink-50 p-4 rounded-md">
                      <h4 className="text-sm font-medium text-pink-700 mb-1">Emotion Logs</h4>
                      <p className="text-2xl font-bold text-pink-800">{userStats.emotionLogs}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-md">
                      <h4 className="text-sm font-medium text-blue-700 mb-1">Journal Entries</h4>
                      <p className="text-2xl font-bold text-blue-800">{userStats.journalEntries}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-md">
                      <h4 className="text-sm font-medium text-purple-700 mb-1">Quizzes Completed</h4>
                      <p className="text-2xl font-bold text-purple-800">{userStats.quizzes}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium text-gray-800 mb-2">Usage Limits</h3>
                  {tier === "premium" && isActive ? (
                    <p className="text-sm text-gray-600">
                      As a premium user, you have unlimited access to all features.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm text-gray-700 mb-1">
                          <span>Emotion Logs</span>
                          <span>
                            {userStats.emotionLogs}/3 {userStats.emotionLogs >= 3 && "(Limit reached)"}
                          </span>
                        </div>
                        <Progress
                          value={Math.min((userStats.emotionLogs / 3) * 100, 100)}
                          className="h-2 bg-gray-200"
                          indicatorClassName={userStats.emotionLogs >= 3 ? "bg-red-500" : "bg-blue-500"}
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm text-gray-700 mb-1">
                          <span>Journal Entries</span>
                          <span>
                            {userStats.journalEntries}/3 {userStats.journalEntries >= 3 && "(Limit reached)"}
                          </span>
                        </div>
                        <Progress
                          value={Math.min((userStats.journalEntries / 3) * 100, 100)}
                          className="h-2 bg-gray-200"
                          indicatorClassName={userStats.journalEntries >= 3 ? "bg-red-500" : "bg-blue-500"}
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm text-gray-700 mb-1">
                          <span>Quizzes</span>
                          <span>
                            {userStats.quizzes}/1 {userStats.quizzes >= 1 && "(Limit reached)"}
                          </span>
                        </div>
                        <Progress
                          value={Math.min(userStats.quizzes * 100, 100)}
                          className="h-2 bg-gray-200"
                          indicatorClassName={userStats.quizzes >= 1 ? "bg-red-500" : "bg-blue-500"}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
