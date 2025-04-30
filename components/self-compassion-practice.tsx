"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { motion } from "framer-motion"
import { Heart, RefreshCw, ArrowLeft, ArrowRight, CheckCircle } from "lucide-react"

type SelfCompassionPracticeProps = {
  practiceType: "self-kindness" | "common-humanity" | "mindfulness" | "general"
}

export function SelfCompassionPractice({ practiceType }: SelfCompassionPracticeProps) {
  const [step, setStep] = useState(1)
  const [responses, setResponses] = useState<{ [key: number]: string }>({})
  const [completed, setCompleted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const practices = {
    "self-kindness": {
      title: "Self-Kindness Practice",
      description: "Cultivate a kind and understanding attitude toward yourself",
      steps: [
        {
          instruction:
            "Think of a situation where you've been struggling or feeling inadequate. Write it down briefly:",
          placeholder: "I've been struggling with...",
        },
        {
          instruction:
            "Now, imagine what you would say to a dear friend facing the same situation. Write that message of support:",
          placeholder: "If my friend was going through this, I would say...",
        },
        {
          instruction:
            "Finally, write a message of kindness to yourself about this situation, using the same supportive tone:",
          placeholder: "To be kind to myself, I will remember that...",
        },
      ],
    },
    "common-humanity": {
      title: "Common Humanity Practice",
      description: "Recognize that struggles are part of the shared human experience",
      steps: [
        {
          instruction: "Describe a challenge you're facing that makes you feel isolated or alone:",
          placeholder: "I feel alone when...",
        },
        {
          instruction:
            "Reflect on how others might experience similar challenges. How is your experience part of being human?",
          placeholder: "Others might also experience...",
        },
        {
          instruction:
            "Write a statement acknowledging your connection with others through this shared human experience:",
          placeholder: "I am not alone because...",
        },
      ],
    },
    mindfulness: {
      title: "Mindfulness Practice",
      description: "Observe your thoughts and feelings with balanced awareness",
      steps: [
        {
          instruction: "Describe a difficult emotion you've been experiencing recently:",
          placeholder: "I've been feeling...",
        },
        {
          instruction:
            "Notice how this emotion feels in your body. Where do you feel it? Describe the sensations without judgment:",
          placeholder: "In my body, this feels like...",
        },
        {
          instruction: "Write a statement acknowledging this feeling without over-identifying with it:",
          placeholder: "I notice I'm feeling... This is a temporary state, not who I am.",
        },
      ],
    },
    general: {
      title: "Self-Compassion Break",
      description: "A brief practice combining all elements of self-compassion",
      steps: [
        {
          instruction: "Acknowledge your suffering. What difficult emotion or situation are you experiencing?",
          placeholder: "This is a moment of suffering...",
        },
        {
          instruction: "Remind yourself that suffering is part of the shared human experience:",
          placeholder: "Suffering is a part of life. I'm not alone in this feeling.",
        },
        {
          instruction: "Offer yourself kindness. What do you need to hear right now?",
          placeholder: "May I be kind to myself in this moment...",
        },
      ],
    },
  }

  const currentPractice = practices[practiceType]
  const currentStep = currentPractice.steps[step - 1]
  const currentResponse = responses[step] || ""

  // Save responses to localStorage when completed
  useEffect(() => {
    if (completed && Object.keys(responses).length > 0) {
      try {
        const savedPractices = JSON.parse(localStorage.getItem("HeartsHeal_selfCompassionPractices") || "[]")
        savedPractices.push({
          type: practiceType,
          responses: responses,
          date: new Date().toISOString(),
        })
        localStorage.setItem("HeartsHeal_selfCompassionPractices", JSON.stringify(savedPractices))
      } catch (error) {
        console.error("Error saving practice to localStorage:", error)
      }
    }
  }, [completed, responses, practiceType])

  const handleNext = () => {
    if (step < currentPractice.steps.length) {
      setStep(step + 1)
    } else {
      setIsSubmitting(true)
      // Simulate saving data
      setTimeout(() => {
        setCompleted(true)
        setIsSubmitting(false)
      }, 1000)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleReset = () => {
    setStep(1)
    setResponses({})
    setCompleted(false)
  }

  const handleResponseChange = (value: string) => {
    setResponses({
      ...responses,
      [step]: value,
    })
  }

  return (
    <Card className="border-purple-200 bg-white/90 backdrop-blur-sm shadow-md">
      <CardHeader>
        <CardTitle className="text-purple-800 flex items-center">
          <Heart className="h-5 w-5 mr-2 text-pink-500" />
          {currentPractice.title}
        </CardTitle>
        <CardDescription className="text-purple-600">{currentPractice.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {!completed ? (
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-purple-600 mb-2">
              <span>
                Step {step} of {currentPractice.steps.length}
              </span>
              <span>{Math.round((step / currentPractice.steps.length) * 100)}% complete</span>
            </div>
            <div className="w-full bg-purple-100 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-pink-400 to-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(step / currentPractice.steps.length) * 100}%` }}
              ></div>
            </div>

            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-3"
            >
              <p className="text-purple-800">{currentStep.instruction}</p>
              <Textarea
                value={currentResponse}
                onChange={(e) => handleResponseChange(e.target.value)}
                placeholder={currentStep.placeholder}
                className="min-h-[120px] border-purple-200 focus-visible:ring-purple-500"
                aria-label={currentStep.instruction}
              />
            </motion.div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-4"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
              <Heart className="h-8 w-8 text-pink-500" />
            </div>
            <h3 className="text-xl font-medium text-purple-800 mb-2">Practice Complete</h3>
            <p className="text-purple-600 mb-4">
              Well done! Regular self-compassion practice can significantly improve your emotional well-being.
            </p>

            <div className="mt-6 space-y-4 text-left">
              <h4 className="font-medium text-purple-700">Your Reflections:</h4>
              {Object.entries(responses).map(([stepNum, response]) => (
                <div key={stepNum} className="bg-purple-50 p-3 rounded-md">
                  <p className="text-sm font-medium text-purple-700 mb-1">
                    {currentPractice.steps[Number.parseInt(stepNum) - 1].instruction}
                  </p>
                  <p className="text-purple-600 whitespace-pre-line">{response}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {!completed ? (
          <>
            <Button
              variant="outline"
              className="border-purple-200 text-purple-700 hover:bg-purple-50"
              onClick={handleBack}
              disabled={step === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button
              className="bg-purple-600 hover:bg-purple-700"
              onClick={handleNext}
              disabled={!currentResponse.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : step === currentPractice.steps.length ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </>
        ) : (
          <Button
            variant="outline"
            className="border-purple-200 text-purple-700 hover:bg-purple-50 mx-auto"
            onClick={handleReset}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Start Another Practice
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
