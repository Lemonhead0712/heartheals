"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"

// Dynamically import heavy components
const EmotionRadarChart = dynamic(() => import("@/components/emotion-radar-chart"), {
  loading: () => (
    <div className="h-64 w-full flex items-center justify-center">
      <div className="animate-pulse text-center">
        <div className="h-32 w-32 mx-auto rounded-full bg-gray-200 dark:bg-gray-700"></div>
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Loading chart...</p>
      </div>
    </div>
  ),
  ssr: false, // Disable server-side rendering for chart components
})

const EmotionCalendarHeatmap = dynamic(() => import("@/components/emotion-calendar-heatmap"), {
  loading: () => <div className="h-64 w-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg"></div>,
  ssr: false,
})

export default function DynamicChartLoader() {
  const [activeChart, setActiveChart] = useState<"radar" | "calendar" | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 justify-center">
        <Button onClick={() => setActiveChart("radar")} variant={activeChart === "radar" ? "default" : "outline"}>
          Show Emotion Radar
        </Button>
        <Button onClick={() => setActiveChart("calendar")} variant={activeChart === "calendar" ? "default" : "outline"}>
          Show Emotion Calendar
        </Button>
        {activeChart && (
          <Button onClick={() => setActiveChart(null)} variant="ghost">
            Hide Chart
          </Button>
        )}
      </div>

      <div className="min-h-[300px] flex items-center justify-center">
        {activeChart === "radar" && <EmotionRadarChart />}
        {activeChart === "calendar" && <EmotionCalendarHeatmap />}
        {!activeChart && (
          <div className="text-center p-8 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">Select a chart type to load</p>
          </div>
        )}
      </div>
    </div>
  )
}
