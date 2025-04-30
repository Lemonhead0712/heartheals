"use client"

import { useState } from "react"
import { performanceMonitor } from "@/utils/performance-monitor"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TestResult {
  name: string
  duration: number
  passed: boolean
}

export function PerformanceTest() {
  const [results, setResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  // Test functions
  const tests = {
    // Test DOM manipulation performance
    domManipulation: () => {
      performanceMonitor.start("domManipulation")

      const container = document.createElement("div")
      document.body.appendChild(container)

      for (let i = 0; i < 1000; i++) {
        const element = document.createElement("div")
        element.textContent = `Item ${i}`
        element.style.padding = "4px"
        element.style.margin = "2px"
        element.style.border = "1px solid #ccc"
        container.appendChild(element)
      }

      // Force layout recalculation
      const height = container.offsetHeight

      // Clean up
      document.body.removeChild(container)

      const duration = performanceMonitor.end("domManipulation")
      return duration || 0
    },

    // Test JavaScript computation performance
    computation: () => {
      performanceMonitor.start("computation")

      let result = 0
      for (let i = 0; i < 1000000; i++) {
        result += Math.sin(i * 0.01) * Math.cos(i * 0.01)
      }

      const duration = performanceMonitor.end("computation")
      return duration || 0
    },

    // Test JSON parsing/stringifying
    jsonProcessing: () => {
      performanceMonitor.start("jsonProcessing")

      const data: any[] = []
      for (let i = 0; i < 10000; i++) {
        data.push({
          id: i,
          name: `Item ${i}`,
          value: Math.random() * 1000,
          isActive: i % 2 === 0,
          tags: ["tag1", "tag2", "tag3"],
          metadata: {
            created: new Date().toISOString(),
            priority: i % 5,
          },
        })
      }

      const jsonString = JSON.stringify(data)
      const parsed = JSON.parse(jsonString)

      const duration = performanceMonitor.end("jsonProcessing")
      return duration || 0
    },
  }

  // Run all tests
  const runTests = async () => {
    setIsRunning(true)
    setResults([])

    // Add a small delay to allow UI to update
    await new Promise((resolve) => setTimeout(resolve, 100))

    const newResults: TestResult[] = []

    // Define thresholds for each test (in ms)
    const thresholds = {
      domManipulation: 200,
      computation: 300,
      jsonProcessing: 250,
    }

    // Run each test
    for (const [name, testFn] of Object.entries(tests)) {
      const duration = testFn()
      const threshold = thresholds[name as keyof typeof thresholds]

      newResults.push({
        name,
        duration,
        passed: duration < threshold,
      })

      // Add a small delay between tests
      await new Promise((resolve) => setTimeout(resolve, 50))
    }

    setResults(newResults)
    setIsRunning(false)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Performance Test</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button onClick={runTests} disabled={isRunning} className="w-full">
            {isRunning ? "Running Tests..." : "Run Performance Tests"}
          </Button>

          {results.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Results:</h3>
              <div className="space-y-2">
                {results.map((result) => (
                  <div key={result.name} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <span className="font-medium">{result.name}</span>
                      <span className="ml-2 text-sm text-gray-500">{result.duration.toFixed(2)}ms</span>
                    </div>
                    <div className={result.passed ? "text-green-500" : "text-red-500"}>
                      {result.passed ? "Passed" : "Failed"}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t">
                <div className="flex justify-between">
                  <span>Overall:</span>
                  <span className={results.every((r) => r.passed) ? "text-green-500" : "text-red-500"}>
                    {results.every((r) => r.passed) ? "All Tests Passed" : "Some Tests Failed"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
