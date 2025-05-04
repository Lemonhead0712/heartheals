"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Dynamically import heavy chart components
const EmotionRadarChart = dynamic(() => import("@/components/emotion-radar-chart"), {
  loading: () => (
    <div className="h-64 w-full flex items-center justify-center">
      <div className="animate-pulse text-center">
        <div className="h-32 w-32 mx-auto rounded-full bg-gray-200 dark:bg-gray-700"></div>
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Loading emotion radar chart...</p>
      </div>
    </div>
  ),
  ssr: false, // Disable server-side rendering for chart components
})

const EmotionPieChart = dynamic(() => import("@/components/responsive-emotion-pie-chart"), {
  loading: () => (
    <div className="h-64 w-full flex items-center justify-center">
      <div className="animate-pulse text-center">
        <div className="h-32 w-32 mx-auto rounded-full bg-gray-200 dark:bg-gray-700"></div>
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Loading emotion pie chart...</p>
      </div>
    </div>
  ),
  ssr: false,
})

const EmotionCalendarHeatmap = dynamic(() => import("@/components/emotion-calendar-heatmap"), {
  loading: () => <div className="h-64 w-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg"></div>,
  ssr: false,
})

interface DynamicEmotionChartsProps {
  defaultChart?: "radar" | "pie" | "calendar" | null
}

export default function DynamicEmotionCharts({ defaultChart = null }: DynamicEmotionChartsProps) {
  const [activeChart, setActiveChart] = useState<"radar" | "pie" | "calendar" | null>(defaultChart)

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Emotion Analytics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap gap-2 justify-center">
          <Button
            onClick={() => setActiveChart("radar")}
            variant={activeChart === "radar" ? "default" : "outline"}
            size="sm"
          >
            Emotion Radar
          </Button>
          <Button
            onClick={() => setActiveChart("pie")}
            variant={activeChart === "pie" ? "default" : "outline"}
            size="sm"
          >
            Emotion Distribution
          </Button>
          <Button
            onClick={() => setActiveChart("calendar")}
            variant={activeChart === "calendar" ? "default" : "outline"}
            size="sm"
          >
            Emotion Calendar
          </Button>
        </div>

        <div className="min-h-[300px] flex items-center justify-center">
          {activeChart === "radar" && <EmotionRadarChart />}
          {activeChart === "pie" && <EmotionPieChart />}
          {activeChart === "calendar" && <EmotionCalendarHeatmap />}
          {!activeChart && (
            <div className="text-center p-8 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400">Select a chart type to view your emotion data</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
