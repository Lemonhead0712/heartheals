"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight, Trash2 } from "lucide-react"
import { formatDateTime } from "@/utils/date-utils"
import { Badge } from "@/components/ui/badge"

interface EmotionEntry {
  id: string
  emotion: string
  emoji: string
  intensity: number
  notes: string
  timestamp: string
  surveyAnswers?: Array<{ question: string; answer: string }>
}

interface DailyEmotionFolderProps {
  date: string
  entries: EmotionEntry[]
  onDeleteEntry: (id: string) => void
}

export function DailyEmotionFolder({ date, entries, onDeleteEntry }: DailyEmotionFolderProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Format the date for display
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })

  // Get the day of the week for the badge
  const dayOfWeek = new Date(date).toLocaleDateString("en-US", { weekday: "short" })

  // Animation variants
  const folderVariants = {
    closed: {
      height: "auto",
      transition: {
        when: "afterChildren",
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
    open: {
      height: "auto",
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  }

  const entryVariants = {
    closed: { opacity: 0, y: -10, height: 0, marginBottom: 0 },
    open: { opacity: 1, y: 0, height: "auto", marginBottom: 16 },
  }

  return (
    <motion.div className="mb-4" initial="closed" animate={isOpen ? "open" : "closed"} variants={folderVariants}>
      <Card
        className={`border-pink-200 bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow ${
          isOpen ? "border-b-0 rounded-b-none" : ""
        }`}
      >
        <CardContent className="p-4">
          <Button
            variant="ghost"
            className="w-full flex justify-between items-center p-0 h-auto"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="flex items-center">
              {isOpen ? (
                <ChevronDown className="h-5 w-5 text-pink-500 mr-2" />
              ) : (
                <ChevronRight className="h-5 w-5 text-pink-500 mr-2" />
              )}
              <span className="font-medium text-pink-800">{formattedDate}</span>
              <Badge className="ml-2 bg-pink-100 text-pink-700 hover:bg-pink-200">{dayOfWeek}</Badge>
            </div>
            <Badge className="bg-pink-500 hover:bg-pink-600">
              {entries.length} {entries.length === 1 ? "entry" : "entries"}
            </Badge>
          </Button>
        </CardContent>
      </Card>

      <AnimatePresence>
        {isOpen && (
          <div className="border border-t-0 border-pink-200 rounded-b-lg bg-white/80 backdrop-blur-sm px-4 pt-2 pb-4">
            {entries.map((entry) => (
              <motion.div
                key={entry.id}
                variants={entryVariants}
                initial="closed"
                animate="open"
                exit="closed"
                className="mb-4 last:mb-0"
              >
                <Card className="border-pink-200 bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="pt-6 relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 h-8 w-8 p-0 text-pink-400 hover:text-pink-700 hover:bg-pink-100"
                      onClick={() => onDeleteEntry(entry.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl" role="img" aria-label={entry.emotion}>
                          {entry.emoji}
                        </span>
                        <div>
                          <h3 className="text-xl font-medium text-pink-800">{entry.emotion}</h3>
                          <p className="text-sm text-pink-600">{formatDateTime(new Date(entry.timestamp))}</p>
                        </div>
                      </div>
                      <div className="bg-pink-100 text-pink-800 px-2 py-1 rounded-full text-sm">
                        Intensity: {entry.intensity}/10
                      </div>
                    </div>
                    {entry.notes && <p className="mt-4 text-pink-700 bg-pink-50 p-4 rounded-md">{entry.notes}</p>}

                    {/* Display survey answers if available */}
                    {entry.surveyAnswers && entry.surveyAnswers.length > 0 && (
                      <div className="mt-4 bg-blue-50 p-4 rounded-md">
                        <h4 className="text-sm font-medium text-blue-800 mb-2">Survey Responses</h4>
                        <div className="space-y-2">
                          {entry.surveyAnswers.map((answer, index) => (
                            <div key={index} className="text-sm text-blue-700">
                              <span className="font-medium">Q{index + 1}:</span> {answer.answer}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
