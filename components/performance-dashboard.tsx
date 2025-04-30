"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { performanceMonitor } from "@/utils/performance-monitor"
import { Progress } from "@/components/ui/progress"

type WebVitals = {
  fcp: number | null
  lcp: number | null
  fid: number | null
  cls: number | null
  ttfb: number | null
}

const formatTime = (ms: number | null | undefined) => {
  if (ms === null || ms === undefined) return "N/A"
  return `${ms.toFixed(0)}ms`
}

export function PerformanceDashboard() {
  const [webVitals, setWebVitals] = useState<WebVitals>({
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
  })

  const [resourceStats, setResourceStats] = useState({
    js: { size: 0, count: 0 },
    css: { size: 0, count: 0 },
    img: { size: 0, count: 0 },
    other: { size: 0, count: 0 },
    total: { size: 0, count: 0 },
  })

  useEffect(() => {
    // Get performance metrics after page load
    const getMetrics = () => {
      const metrics = performanceMonitor.getMetrics()

      setWebVitals({
        fcp: metrics.firstContentfulPaint,
        lcp: metrics.largestContentfulPaint,
        fid: metrics.firstInputDelay,
        cls: metrics.cumulativeLayoutShift ? metrics.cumulativeLayoutShift * 100 : null,
        ttfb: metrics.navigationTiming
          ? metrics.navigationTiming.responseStart - metrics.navigationTiming.requestStart
          : null,
      })

      // Process resource timing data
      const resources = metrics.resourceTiming || []
      const stats = {
        js: { size: 0, count: 0 },
        css: { size: 0, count: 0 },
        img: { size: 0, count: 0 },
        other: { size: 0, count: 0 },
        total: { size: 0, count: 0 },
      }

      resources.forEach((resource) => {
        const size = resource.transferSize || 0
        let type = "other"

        if (resource.name.endsWith(".js")) type = "js"
        else if (resource.name.endsWith(".css")) type = "css"
        else if (/\.(png|jpg|jpeg|gif|svg|webp)/.test(resource.name)) type = "img"

        stats[type].size += size
        stats[type].count++
        stats.total.size += size
        stats.total.count++
      })

      setResourceStats(stats)
    }

    // Wait for all resources to load
    if (document.readyState === "complete") {
      getMetrics()
    } else {
      window.addEventListener("load", getMetrics)
      return () => window.removeEventListener("load", getMetrics)
    }
  }, [])

  // Thresholds for good/needs improvement/poor
  const thresholds = {
    fcp: { good: 1800, poor: 3000 },
    lcp: { good: 2500, poor: 4000 },
    fid: { good: 100, poor: 300 },
    cls: { good: 10, poor: 25 }, // CLS is multiplied by 100 for easier reading
    ttfb: { good: 200, poor: 600 },
  }

  const getMetricStatus = (metric: keyof WebVitals) => {
    const value = webVitals[metric]
    if (value === null) return "unknown"

    const threshold = thresholds[metric]
    if (value <= threshold.good) return "good"
    if (value <= threshold.poor) return "needs-improvement"
    return "poor"
  }

  const getProgressValue = (metric: keyof WebVitals) => {
    const value = webVitals[metric]
    if (value === null) return 0

    const threshold = thresholds[metric]
    // Calculate a percentage where 0% is good and 100% is poor
    const percentage = Math.min(100, (value / threshold.poor) * 100)
    return 100 - percentage // Invert so 100% is good
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Web Vitals</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* FCP */}
            <div className="p-4 border rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="font-medium">First Contentful Paint</span>
                <span
                  className={`text-sm font-medium ${
                    getMetricStatus("fcp") === "good"
                      ? "text-green-500"
                      : getMetricStatus("fcp") === "needs-improvement"
                        ? "text-yellow-500"
                        : getMetricStatus("fcp") === "poor"
                          ? "text-red-500"
                          : "text-gray-500"
                  }`}
                >
                  {formatTime(webVitals.fcp)}
                </span>
              </div>
              <Progress value={getProgressValue("fcp")} className="h-2" />
            </div>

            {/* LCP */}
            <div className="p-4 border rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="font-medium">Largest Contentful Paint</span>
                <span
                  className={`text-sm font-medium ${
                    getMetricStatus("lcp") === "good"
                      ? "text-green-500"
                      : getMetricStatus("lcp") === "needs-improvement"
                        ? "text-yellow-500"
                        : getMetricStatus("lcp") === "poor"
                          ? "text-red-500"
                          : "text-gray-500"
                  }`}
                >
                  {formatTime(webVitals.lcp)}
                </span>
              </div>
              <Progress value={getProgressValue("lcp")} className="h-2" />
            </div>

            {/* FID */}
            <div className="p-4 border rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="font-medium">First Input Delay</span>
                <span
                  className={`text-sm font-medium ${
                    getMetricStatus("fid") === "good"
                      ? "text-green-500"
                      : getMetricStatus("fid") === "needs-improvement"
                        ? "text-yellow-500"
                        : getMetricStatus("fid") === "poor"
                          ? "text-red-500"
                          : "text-gray-500"
                  }`}
                >
                  {formatTime(webVitals.fid)}
                </span>
              </div>
              <Progress value={getProgressValue("fid")} className="h-2" />
            </div>

            {/* CLS */}
            <div className="p-4 border rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="font-medium">Cumulative Layout Shift</span>
                <span
                  className={`text-sm font-medium ${
                    getMetricStatus("cls") === "good"
                      ? "text-green-500"
                      : getMetricStatus("cls") === "needs-improvement"
                        ? "text-yellow-500"
                        : getMetricStatus("cls") === "poor"
                          ? "text-red-500"
                          : "text-gray-500"
                  }`}
                >
                  {webVitals.cls !== null ? webVitals.cls.toFixed(2) : "N/A"}
                </span>
              </div>
              <Progress value={getProgressValue("cls")} className="h-2" />
            </div>

            {/* TTFB */}
            <div className="p-4 border rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="font-medium">Time to First Byte</span>
                <span
                  className={`text-sm font-medium ${
                    getMetricStatus("ttfb") === "good"
                      ? "text-green-500"
                      : getMetricStatus("ttfb") === "needs-improvement"
                        ? "text-yellow-500"
                        : getMetricStatus("ttfb") === "poor"
                          ? "text-red-500"
                          : "text-gray-500"
                  }`}
                >
                  {formatTime(webVitals.ttfb)}
                </span>
              </div>
              <Progress value={getProgressValue("ttfb")} className="h-2" />
            </div>
          </div>

          {/* Resource Stats */}
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Resource Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-gray-500">JavaScript</div>
                <div className="text-xl font-bold">{formatSize(resourceStats.js.size)}</div>
                <div className="text-sm text-gray-500">{resourceStats.js.count} files</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-gray-500">CSS</div>
                <div className="text-xl font-bold">{formatSize(resourceStats.css.size)}</div>
                <div className="text-sm text-gray-500">{resourceStats.css.count} files</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-gray-500">Images</div>
                <div className="text-xl font-bold">{formatSize(resourceStats.img.size)}</div>
                <div className="text-sm text-gray-500">{resourceStats.img.count} files</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-gray-500">Total</div>
                <div className="text-xl font-bold">{formatSize(resourceStats.total.size)}</div>
                <div className="text-sm text-gray-500">{resourceStats.total.count} resources</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
