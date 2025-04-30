"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { EmotionalThoughtsSpinner } from "@/components/emotional-thoughts-spinner"

export default function LoadingExample() {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingSize, setLoadingSize] = useState<"sm" | "md" | "lg">("md")
  const [customMessage, setCustomMessage] = useState("")

  const triggerLoading = (size: "sm" | "md" | "lg", duration = 3000) => {
    setLoadingSize(size)
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), duration)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => triggerLoading("sm")} variant="outline" className="border-purple-200">
          Small Spinner
        </Button>
        <Button onClick={() => triggerLoading("md")} variant="outline" className="border-purple-200">
          Medium Spinner
        </Button>
        <Button onClick={() => triggerLoading("lg")} variant="outline" className="border-purple-200">
          Large Spinner
        </Button>
        <Button onClick={() => triggerLoading("md", 3000)} className="bg-purple-600 hover:bg-purple-700">
          Custom Duration
        </Button>
      </div>

      <div className="bg-white/80 backdrop-blur-sm border border-purple-200 rounded-lg p-6">
        {isLoading ? (
          <EmotionalThoughtsSpinner size={loadingSize} message={customMessage || undefined} />
        ) : (
          <div className="text-center text-purple-600 py-6">Click a button above to see the spinner in action</div>
        )}
      </div>

      <Card className="border-purple-200">
        <CardContent className="pt-6">
          <label className="text-sm text-purple-700 block mb-2">Custom Loading Message</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Enter custom loading message..."
              className="flex-1 px-3 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <Button
              onClick={() => setCustomMessage("")}
              variant="ghost"
              className="text-purple-600 hover:text-purple-800 hover:bg-purple-50"
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
