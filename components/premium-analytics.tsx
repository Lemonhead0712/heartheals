"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { FeatureGate } from "./feature-gate"
import { LoadingSpinner } from "./ui/loading-spinner"
import { processEmotionData, type EmotionEntry } from "@/utils/emotion-analytics"
import { AlertCircle } from "lucide-react"

export function PremiumAnalytics() {
  const [activeTab, setActiveTab] = useState("emotions")
  const [isLoading, setIsLoading] = useState(true)
  const [emotionData, setEmotionData] = useState<EmotionEntry[]>([])
  const [error, setError] = useState<string | null>(null)

  // Load emotion data from localStorage
  useEffect(() => {
    const loadEmotionData = () => {
      setIsLoading(true)
      setError(null)

      try {
        // Get data from localStorage
        const storedData = localStorage.getItem("heartHeals_emotionLogs")

        if (storedData) {
          const parsedData = JSON.parse(storedData)

          // Convert string timestamps back to Date objects
          const processedData = parsedData.map((entry: any) => ({
            ...entry,
            timestamp: new Date(entry.timestamp),
          }))

          setEmotionData(processedData)
        } else {
          setEmotionData([])
        }
      } catch (err) {
        console.error("Error loading emotion data:", err)
        setError("Failed to load your emotion data.")
      } finally {
        setIsLoading(false)
      }
    }

    loadEmotionData()

    // Set up event listener for localStorage changes
    const handleStorageChange = () => {
      loadEmotionData()
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  // Process the data for charts
  const analytics = processEmotionData(emotionData)

  return (
    <FeatureGate featureId="analytics">
      <Card className="border-purple-200 bg-white/90 backdrop-blur-sm shadow-md">
        <CardHeader>
          <CardTitle className="text-purple-800">Emotional Analytics</CardTitle>
          <CardDescription className="text-purple-600">Visualize your emotional patterns and trends</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <LoadingSpinner size="md" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center p-8 text-red-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>{error}</span>
            </div>
          ) : emotionData.length === 0 ? (
            <div className="text-center py-8 text-purple-600">
              <p>No emotion logs found. Start tracking your emotions to see analytics.</p>
            </div>
          ) : (
            <Tabs defaultValue="emotions" onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="emotions" className="text-purple-700 data-[state=active]:bg-purple-100">
                  Emotion Distribution
                </TabsTrigger>
                <TabsTrigger value="intensity" className="text-purple-700 data-[state=active]:bg-purple-100">
                  Intensity Over Time
                </TabsTrigger>
              </TabsList>

              <TabsContent value="emotions" className="space-y-4">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.emotionDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {analytics.emotionDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} entries`, "Count"]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-purple-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-purple-800 mb-2">Emotion Insights</h3>
                  <ul className="space-y-1 text-sm text-purple-700">
                    <li>
                      • Most frequent emotion: <span className="font-medium">{analytics.mostFrequentEmotion}</span>
                    </li>
                    <li>
                      • Most used emoji: <span className="text-xl">{analytics.mostFrequentEmoji}</span>
                    </li>
                    <li>
                      • Total entries: <span className="font-medium">{analytics.totalEntries}</span>
                    </li>
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="intensity" className="space-y-4">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.intensityOverTime}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis domain={[0, 10]} />
                      <Tooltip formatter={(value) => [`${value}/10`, "Intensity"]} />
                      <Bar dataKey="intensity" fill="#9C27B0" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-purple-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-purple-800 mb-2">Intensity Insights</h3>
                  <ul className="space-y-1 text-sm text-purple-700">
                    <li>
                      • Average intensity: <span className="font-medium">{analytics.averageIntensity}/10</span>
                    </li>
                    <li>
                      • Recent trend:{" "}
                      <span className="font-medium capitalize">{analytics.recentTrend.replace("-", " ")}</span>
                    </li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </FeatureGate>
  )
}
