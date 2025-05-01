"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, Pause, Play, Info, Volume2, VolumeX, RefreshCw, Settings, Save } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { PageContainer } from "@/components/page-container"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { BreathingSessionComplete } from "@/components/breathing-session-complete"
import { BreathingCountdown } from "@/components/breathing-countdown"
import { createBeepSound, createSoftTone, speakNumber } from "@/lib/audio-utils"

type BreathingPhase = "inhale" | "hold1" | "exhale" | "hold2" | "leftNostril" | "rightNostril"

type BreathingPattern = {
  id: string
  name: string
  description: string
  instructions: string[]
  inhale: number
  hold1?: number
  exhale: number
  hold2?: number
  color: string
  benefits: string[]
  category: "beginner" | "intermediate" | "advanced"
  animationType: "circle" | "wave" | "nostril"
}

type CounterSoundType = "beep" | "tone" | "voice" | "none"
type CounterFrequency = "every-second" | "half-way" | "quarter-points"

const breathingPatterns: BreathingPattern[] = [
  {
    id: "box",
    name: "Box Breathing",
    description: "Equal duration for all phases. Great for focus and calm.",
    instructions: [
      "Sit comfortably with your back straight",
      "Inhale slowly through your nose for 4 seconds",
      "Hold your breath for 4 seconds",
      "Exhale slowly through your mouth for 4 seconds",
      "Hold your breath for 4 seconds",
      "Repeat the cycle",
    ],
    inhale: 4,
    hold1: 4,
    exhale: 4,
    hold2: 4,
    color: "from-blue-300 to-blue-500",
    benefits: ["Reduces stress and anxiety", "Improves concentration", "Regulates the autonomic nervous system"],
    category: "beginner",
    animationType: "circle",
  },
  {
    id: "478",
    name: "4-7-8 Breathing",
    description: "Inhale for 4, hold for 7, exhale for 8. Helps reduce anxiety and aids sleep.",
    instructions: [
      "Sit with your back straight",
      "Place the tip of your tongue against the ridge behind your upper front teeth",
      "Exhale completely through your mouth, making a whoosh sound",
      "Close your mouth and inhale quietly through your nose for 4 seconds",
      "Hold your breath for 7 seconds",
      "Exhale completely through your mouth for 8 seconds",
      "Repeat the cycle",
    ],
    inhale: 4,
    hold1: 7,
    exhale: 8,
    color: "from-purple-300 to-purple-500",
    benefits: ["Helps with insomnia", "Reduces anxiety", "Manages cravings", "Controls emotional responses"],
    category: "intermediate",
    animationType: "wave",
  },
  {
    id: "relaxation",
    name: "Relaxation Breathing",
    description: "Slow inhale and longer exhale to activate the parasympathetic nervous system.",
    instructions: [
      "Find a comfortable position",
      "Inhale slowly through your nose for 4 seconds",
      "Exhale slowly through your mouth for 6 seconds",
      "Focus on the sensation of your breath",
      "Repeat the cycle",
    ],
    inhale: 4,
    exhale: 6,
    color: "from-pink-300 to-pink-500",
    benefits: ["Activates the relaxation response", "Lowers heart rate and blood pressure", "Reduces muscle tension"],
    category: "beginner",
    animationType: "wave",
  },
  {
    id: "alternate-nostril",
    name: "Alternate Nostril",
    description: "Traditional yogic breathing technique that balances the hemispheres of the brain.",
    instructions: [
      "Sit comfortably with your back straight",
      "Use your right thumb to close your right nostril",
      "Inhale slowly through your left nostril",
      "Close your left nostril with your ring finger",
      "Open your right nostril and exhale",
      "Inhale through your right nostril",
      "Close your right nostril and exhale through your left",
      "Repeat the cycle",
    ],
    inhale: 4,
    exhale: 4,
    color: "from-green-300 to-green-500",
    benefits: [
      "Balances the left and right hemispheres of the brain",
      "Improves focus and concentration",
      "Purifies the subtle energy channels",
      "Reduces stress and anxiety",
    ],
    category: "advanced",
    animationType: "nostril",
  },
  {
    id: "coherent",
    name: "Coherent Breathing",
    description: "Equal inhale and exhale at a rate of 5 breaths per minute.",
    instructions: [
      "Sit or lie down comfortably",
      "Breathe in slowly through your nose for 6 seconds",
      "Breathe out slowly through your nose for 6 seconds",
      "Continue this pattern without holding your breath",
      "Focus on smooth, continuous breathing",
    ],
    inhale: 6,
    exhale: 6,
    color: "from-yellow-300 to-yellow-500",
    benefits: [
      "Optimizes heart rate variability",
      "Reduces stress and anxiety",
      "Improves emotional regulation",
      "Enhances cognitive function",
    ],
    category: "intermediate",
    animationType: "wave",
  },
  {
    id: "diaphragmatic",
    name: "Diaphragmatic Breathing",
    description: "Deep belly breathing that fully engages the diaphragm.",
    instructions: [
      "Lie on your back with knees bent or sit comfortably",
      "Place one hand on your chest and the other on your abdomen",
      "Breathe in slowly through your nose, feeling your abdomen rise",
      "Exhale slowly through pursed lips, feeling your abdomen fall",
      "The hand on your chest should remain relatively still",
    ],
    inhale: 4,
    exhale: 6,
    color: "from-teal-300 to-teal-500",
    benefits: [
      "Strengthens the diaphragm",
      "Decreases oxygen demand",
      "Slows breathing rate",
      "Reduces blood pressure",
    ],
    category: "beginner",
    animationType: "circle",
  },
]

export default function BreathePage() {
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern | null>(null)
  const [isActive, setIsActive] = useState(false)
  const [phase, setPhase] = useState<BreathingPhase>("inhale")
  const [timeLeft, setTimeLeft] = useState(0)
  const [cycles, setCycles] = useState(0)
  const [totalCycles, setTotalCycles] = useState(3)
  const [customDurations, setCustomDurations] = useState({
    inhale: 4,
    hold1: 4,
    exhale: 4,
    hold2: 4,
  })
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [showInstructions, setShowInstructions] = useState(false)

  // Countdown state
  const [showCountdown, setShowCountdown] = useState(false)

  // Audio counter state
  const [counterEnabled, setCounterEnabled] = useState(false)
  const [counterSound, setCounterSound] = useState<CounterSoundType>("beep")
  const [counterFrequency, setCounterFrequency] = useState<CounterFrequency>("every-second")
  const [showCounterSettings, setShowCounterSettings] = useState(false)
  const [currentCount, setCurrentCount] = useState(0)

  // Session tracking
  const [showSessionComplete, setShowSessionComplete] = useState(false)
  const [sessionDuration, setSessionDuration] = useState(0)
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null)

  // Sound functions
  const playBeep = createBeepSound()
  const playSoftTone = createSoftTone()

  // Phase transition sounds
  const playPhaseTransitionSound = (nextPhase: BreathingPhase) => {
    if (!soundEnabled) return

    // Simple beeps for phase transitions
    if (nextPhase === "inhale" || nextPhase === "leftNostril" || nextPhase === "rightNostril") {
      createBeepSound(700, 150, 0.4)()
    } else if (nextPhase === "hold1" || nextPhase === "hold2") {
      createBeepSound(500, 150, 0.3)()
    } else if (nextPhase === "exhale") {
      createBeepSound(400, 150, 0.3)()
    }
  }

  // Play counter sound based on selected type
  const playCounterSound = (count: number) => {
    if (!counterEnabled) return

    switch (counterSound) {
      case "beep":
        playBeep()
        break
      case "tone":
        playSoftTone()
        break
      case "voice":
        // Voice counts from 1-10
        if (count >= 1 && count <= 10) {
          speakNumber(count)
        }
        break
      case "none":
      default:
        // No sound
        break
    }
  }

  // Main breathing timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout

    if (isActive && selectedPattern) {
      if (timeLeft > 0) {
        // Main timer for phase duration
        timer = setTimeout(() => setTimeLeft((prev) => Math.max(prev - 0.1, 0)), 100)

        // Counter logic
        if (counterEnabled) {
          const initialTimeForPhase = getInitialTimeForPhase()
          const elapsedTime = initialTimeForPhase - timeLeft
          const newCount = Math.floor(elapsedTime) + 1

          // Determine if we should play a count based on frequency
          let shouldPlayCount = false

          switch (counterFrequency) {
            case "every-second":
              shouldPlayCount = newCount !== currentCount
              break
            case "half-way":
              const halfwayPoint = Math.ceil(initialTimeForPhase / 2)
              shouldPlayCount =
                (newCount === halfwayPoint || newCount === initialTimeForPhase) && newCount !== currentCount
              break
            case "quarter-points":
              const quarter = Math.ceil(initialTimeForPhase / 4)
              shouldPlayCount =
                (newCount === quarter ||
                  newCount === quarter * 2 ||
                  newCount === quarter * 3 ||
                  newCount === initialTimeForPhase) &&
                newCount !== currentCount
              break
          }

          if (shouldPlayCount) {
            setCurrentCount(newCount)
            playCounterSound(newCount)
          }
        }
      } else {
        // Reset counter for next phase
        setCurrentCount(0)

        // Determine next phase
        let nextPhase: BreathingPhase
        let nextTimeLeft: number
        let cycleCompleted = false

        switch (phase) {
          case "inhale":
            if (selectedPattern.hold1) {
              nextPhase = "hold1"
              nextTimeLeft = selectedPattern.hold1
            } else {
              nextPhase = "exhale"
              nextTimeLeft = selectedPattern.exhale
            }
            break

          case "hold1":
            nextPhase = "exhale"
            nextTimeLeft = selectedPattern.exhale
            break

          case "exhale":
            if (selectedPattern.hold2) {
              nextPhase = "hold2"
              nextTimeLeft = selectedPattern.hold2
            } else {
              cycleCompleted = true
              nextPhase = selectedPattern.id === "alternate-nostril" ? "leftNostril" : "inhale"
              nextTimeLeft = selectedPattern.inhale
            }
            break

          case "hold2":
            cycleCompleted = true
            nextPhase = "inhale"
            nextTimeLeft = selectedPattern.inhale
            break

          case "leftNostril":
            nextPhase = "rightNostril"
            nextTimeLeft = selectedPattern.inhale
            break

          case "rightNostril":
            cycleCompleted = true
            nextPhase = "leftNostril"
            nextTimeLeft = selectedPattern.inhale
            break

          default:
            nextPhase = "inhale"
            nextTimeLeft = selectedPattern.inhale
        }

        // Handle cycle completion
        if (cycleCompleted) {
          const newCycles = cycles + 1
          setCycles(newCycles)

          if (newCycles >= totalCycles) {
            // Exercise complete
            setIsActive(false)
            setCycles(0)

            // Calculate session duration
            if (sessionStartTime) {
              const duration = Math.round((Date.now() - sessionStartTime) / 1000)
              setSessionDuration(duration)
              setShowSessionComplete(true)
            }

            // Play completion sound
            createBeepSound(900, 300, 0.5)()
            return
          }
        }

        // Play sound for phase transition
        playPhaseTransitionSound(nextPhase)

        // Update state for next phase
        setPhase(nextPhase)
        setTimeLeft(nextTimeLeft)
      }
    }

    return () => clearTimeout(timer)
  }, [
    isActive,
    timeLeft,
    phase,
    selectedPattern,
    cycles,
    totalCycles,
    soundEnabled,
    counterEnabled,
    counterFrequency,
    counterSound,
    currentCount,
    sessionStartTime,
  ])

  // Function to start breathing with countdown
  const startBreathingWithCountdown = (pattern: BreathingPattern) => {
    setSelectedPattern(pattern)
    setShowCountdown(true)
  }

  // Function to handle countdown completion
  const handleCountdownComplete = () => {
    setShowCountdown(false)

    // Apply custom durations if available
    if (selectedPattern && selectedPattern.id === "custom") {
      selectedPattern.inhale = customDurations.inhale
      selectedPattern.hold1 = customDurations.hold1
      selectedPattern.exhale = customDurations.exhale
      selectedPattern.hold2 = customDurations.hold2
    }

    // Set initial phase based on pattern type
    if (selectedPattern) {
      if (selectedPattern.id === "alternate-nostril") {
        setPhase("leftNostril")
      } else {
        setPhase("inhale")
      }
      setTimeLeft(selectedPattern?.inhale || 4)
    }

    setCycles(0)
    setIsActive(true)
    setSessionStartTime(Date.now())
  }

  const toggleActive = () => {
    setIsActive(!isActive)
  }

  const resetExercise = () => {
    setIsActive(false)
    setCycles(0)
    if (selectedPattern) {
      if (selectedPattern.id === "alternate-nostril") {
        setPhase("leftNostril")
      } else {
        setPhase("inhale")
      }
      setTimeLeft(selectedPattern.inhale)
    }
  }

  const getPhaseText = () => {
    switch (phase) {
      case "inhale":
        return "Inhale"
      case "hold1":
        return "Hold"
      case "exhale":
        return "Exhale"
      case "hold2":
        return "Hold"
      case "leftNostril":
        return "Left Nostril"
      case "rightNostril":
        return "Right Nostril"
    }
  }

  const getPhaseInstructions = () => {
    if (!selectedPattern) return ""

    switch (phase) {
      case "inhale":
        return "Breathe in slowly through your nose"
      case "hold1":
        return "Hold your breath"
      case "exhale":
        return "Breathe out slowly through your mouth"
      case "hold2":
        return "Hold your breath"
      case "leftNostril":
        return "Close right nostril, inhale through left"
      case "rightNostril":
        return "Close left nostril, inhale through right"
    }
  }

  const getInitialTimeForPhase = () => {
    if (!selectedPattern) return 0

    switch (phase) {
      case "inhale":
      case "leftNostril":
      case "rightNostril":
        return selectedPattern.inhale
      case "hold1":
        return selectedPattern.hold1 || 0
      case "exhale":
        return selectedPattern.exhale
      case "hold2":
        return selectedPattern.hold2 || 0
      default:
        return 0
    }
  }

  const handleCustomDurationChange = (type: keyof typeof customDurations, value: number[]) => {
    setCustomDurations((prev) => ({
      ...prev,
      [type]: value[0],
    }))
  }

  const filteredPatterns =
    activeTab === "all" ? breathingPatterns : breathingPatterns.filter((pattern) => pattern.category === activeTab)

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  }

  // Enhanced animation variants for the breathing circle
  const breathingCircleVariants = {
    inhale: {
      scale: [1, 1.5],
      opacity: [0.7, 1],
      transition: {
        duration: timeLeft,
        ease: "easeInOut",
      },
    },
    hold: {
      scale: 1.5,
      opacity: 1,
      transition: {
        duration: timeLeft,
        ease: "linear",
      },
    },
    exhale: {
      scale: [1.5, 1],
      opacity: [1, 0.7],
      transition: {
        duration: timeLeft,
        ease: "easeInOut",
      },
    },
  }

  // Wave animation variants
  const waveVariants = {
    inhale: {
      y: [0, -30],
      opacity: [0.7, 1],
      transition: {
        duration: timeLeft,
        ease: "easeInOut",
      },
    },
    hold: {
      y: -30,
      opacity: 1,
      transition: {
        duration: timeLeft,
        ease: "linear",
      },
    },
    exhale: {
      y: [-30, 0],
      opacity: [1, 0.7],
      transition: {
        duration: timeLeft,
        ease: "easeInOut",
      },
    },
  }

  // Nostril animation variants
  const leftNostrilVariants = {
    active: {
      opacity: 1,
      scale: 1.2,
      transition: {
        duration: timeLeft,
        ease: "easeInOut",
      },
    },
    inactive: {
      opacity: 0.4,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeInOut",
      },
    },
  }

  const rightNostrilVariants = {
    active: {
      opacity: 1,
      scale: 1.2,
      transition: {
        duration: timeLeft,
        ease: "easeInOut",
      },
    },
    inactive: {
      opacity: 0.4,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeInOut",
      },
    },
  }

  return (
    <PageContainer>
      <div className="min-h-screen bg-gradient-to-br from-[#fce4ec] via-[#e0f7fa] to-[#ede7f6]">
        <motion.div
          className="container mx-auto px-4 py-8 max-w-4xl"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div className="flex justify-between items-center mb-6" variants={item}>
            <Link href="/" className="inline-flex items-center text-blue-700 hover:text-blue-900 transition-colors">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Dashboard
            </Link>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className="text-blue-700 hover:text-blue-900 hover:bg-blue-100"
                    >
                      {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{soundEnabled ? "Disable sounds" : "Enable sounds"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </motion.div>

          <motion.div className="text-center mb-8" variants={item}>
            <h1 className="text-3xl font-bold text-blue-800 mb-2">Breathe With Me</h1>
            <p className="text-blue-600">Follow guided breathing patterns to find calm and balance</p>
          </motion.div>

          {!selectedPattern ? (
            <>
              <motion.div className="mb-6" variants={item}>
                <Tabs defaultValue="all" onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="beginner">Beginner</TabsTrigger>
                    <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
                  </TabsList>
                </Tabs>
              </motion.div>

              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={container}
                initial="hidden"
                animate="show"
              >
                {filteredPatterns.map((pattern) => (
                  <motion.div key={pattern.id} variants={item}>
                    <Card className="h-full border-blue-200 bg-white/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-all cursor-pointer hover:scale-[1.02] duration-300">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-blue-700">{pattern.name}</CardTitle>
                          <Badge
                            variant="outline"
                            className={
                              pattern.category === "beginner"
                                ? "bg-green-100 text-green-800 border-green-200"
                                : pattern.category === "intermediate"
                                  ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                  : "bg-red-100 text-red-800 border-red-200"
                            }
                          >
                            {pattern.category}
                          </Badge>
                        </div>
                        <CardDescription className="text-blue-600">{pattern.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-center items-center space-x-2 text-sm text-blue-600">
                          <div className="text-center">
                            <div className="font-medium">{pattern.inhale}s</div>
                            <div>Inhale</div>
                          </div>

                          {pattern.hold1 && (
                            <>
                              <div className="text-blue-300">→</div>
                              <div className="text-center">
                                <div className="font-medium">{pattern.hold1}s</div>
                                <div>Hold</div>
                              </div>
                            </>
                          )}

                          <div className="text-blue-300">→</div>
                          <div className="text-center">
                            <div className="font-medium">{pattern.exhale}s</div>
                            <div>Exhale</div>
                          </div>

                          {pattern.hold2 && (
                            <>
                              <div className="text-blue-300">→</div>
                              <div className="text-center">
                                <div className="font-medium">{pattern.hold2}s</div>
                                <div>Hold</div>
                              </div>
                            </>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                              <Info className="mr-2 h-4 w-4" />
                              Info
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>{pattern.name}</DialogTitle>
                              <DialogDescription>{pattern.description}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div>
                                <h4 className="text-sm font-medium mb-2">Instructions:</h4>
                                <ol className="list-decimal pl-5 space-y-1 text-sm">
                                  {pattern.instructions.map((instruction, i) => (
                                    <li key={i}>{instruction}</li>
                                  ))}
                                </ol>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium mb-2">Benefits:</h4>
                                <ul className="list-disc pl-5 space-y-1 text-sm">
                                  {pattern.benefits.map((benefit, i) => (
                                    <li key={i}>{benefit}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={() => startBreathingWithCountdown(pattern)}
                        >
                          Start
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}

                {/* Custom breathing pattern card */}
                <motion.div variants={item}>
                  <Card className="h-full border-blue-200 bg-white/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-all">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-blue-700">Custom Breathing</CardTitle>
                        <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                          Personalized
                        </Badge>
                      </div>
                      <CardDescription className="text-blue-600">
                        Create your own custom breathing pattern with personalized timings
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label htmlFor="inhale-duration">Inhale: {customDurations.inhale}s</Label>
                          </div>
                          <Slider
                            id="inhale-duration"
                            min={1}
                            max={10}
                            step={1}
                            value={[customDurations.inhale]}
                            onValueChange={(value) => handleCustomDurationChange("inhale", value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label htmlFor="hold1-duration">Hold after inhale: {customDurations.hold1}s</Label>
                          </div>
                          <Slider
                            id="hold1-duration"
                            min={0}
                            max={10}
                            step={1}
                            value={[customDurations.hold1]}
                            onValueChange={(value) => handleCustomDurationChange("hold1", value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label htmlFor="exhale-duration">Exhale: {customDurations.exhale}s</Label>
                          </div>
                          <Slider
                            id="exhale-duration"
                            min={1}
                            max={10}
                            step={1}
                            value={[customDurations.exhale]}
                            onValueChange={(value) => handleCustomDurationChange("exhale", value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label htmlFor="hold2-duration">Hold after exhale: {customDurations.hold2}s</Label>
                          </div>
                          <Slider
                            id="hold2-duration"
                            min={0}
                            max={10}
                            step={1}
                            value={[customDurations.hold2]}
                            onValueChange={(value) => handleCustomDurationChange("hold2", value)}
                          />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        onClick={() => {
                          const customPattern: BreathingPattern = {
                            id: "custom",
                            name: "Custom Breathing",
                            description: "Your personalized breathing pattern",
                            instructions: [
                              "Follow your custom breathing pattern",
                              `Inhale for ${customDurations.inhale} seconds`,
                              customDurations.hold1 > 0 ? `Hold for ${customDurations.hold1} seconds` : "",
                              `Exhale for ${customDurations.exhale} seconds`,
                              customDurations.hold2 > 0 ? `Hold for ${customDurations.hold2} seconds` : "",
                              "Repeat the cycle",
                            ].filter((i) => i !== ""),
                            inhale: customDurations.inhale,
                            hold1: customDurations.hold1 > 0 ? customDurations.hold1 : undefined,
                            exhale: customDurations.exhale,
                            hold2: customDurations.hold2 > 0 ? customDurations.hold2 : undefined,
                            color: "from-indigo-300 to-indigo-500",
                            benefits: [
                              "Personalized to your needs",
                              "Adaptable to your comfort level",
                              "Customizable for specific health needs",
                            ],
                            category: "beginner",
                            animationType: "circle",
                          }
                          startBreathingWithCountdown(customPattern)
                        }}
                      >
                        Start Custom Breathing
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              </motion.div>
            </>
          ) : (
            <motion.div
              className="flex flex-col items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Background gradient */}
              <AnimatePresence>
                <motion.div
                  key={phase}
                  className={`fixed top-0 left-0 w-full h-full -z-10 bg-gradient-to-br ${selectedPattern.color}`}
                  initial={{ opacity: 0.3 }}
                  animate={{
                    opacity:
                      phase === "inhale" || phase === "leftNostril" || phase === "rightNostril"
                        ? 0.5
                        : phase === "exhale"
                          ? 0.3
                          : 0.4,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: timeLeft,
                    ease: "easeInOut",
                  }}
                />
              </AnimatePresence>

              <Card className="w-full max-w-md border-blue-200 bg-white/80 backdrop-blur-sm shadow-md mb-6">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-blue-700">{selectedPattern.name}</CardTitle>
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                      {cycles}/{totalCycles} Cycles
                    </Badge>
                  </div>
                  <CardDescription className="text-blue-600">
                    {showInstructions ? (
                      <div className="text-sm space-y-1">
                        <ol className="list-decimal pl-5">
                          {selectedPattern.instructions.map((instruction, i) => (
                            <li key={i}>{instruction}</li>
                          ))}
                        </ol>
                        <Button
                          variant="link"
                          className="p-0 h-auto text-blue-600"
                          onClick={() => setShowInstructions(false)}
                        >
                          Hide instructions
                        </Button>
                      </div>
                    ) : (
                      <>
                        {selectedPattern.description}{" "}
                        <Button
                          variant="link"
                          className="p-0 h-auto text-blue-600"
                          onClick={() => setShowInstructions(true)}
                        >
                          Show instructions
                        </Button>
                      </>
                    )}
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Phase indicator */}
              <div className="w-full max-w-md mb-4">
                <Card className="border-blue-200 bg-white/80 backdrop-blur-sm shadow-sm">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <h3 className="text-xl font-medium text-blue-800">{getPhaseText()}</h3>
                      <p className="text-blue-600 text-sm">{getPhaseInstructions()}</p>
                      {counterEnabled && currentCount > 0 && (
                        <div className="mt-2 text-sm font-medium text-blue-700">Count: {currentCount}</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Breathing animation container - smaller and less intrusive */}
              <div className="relative flex justify-center items-center my-6 h-[30vh] w-full max-w-md">
                {selectedPattern.animationType === "circle" && (
                  <motion.div
                    className="rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/50 w-24 h-24"
                    animate={phase === "inhale" ? "inhale" : phase === "exhale" ? "exhale" : "hold"}
                    variants={breathingCircleVariants}
                    style={{
                      background: `radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 70%)`,
                    }}
                  />
                )}

                {selectedPattern.animationType === "wave" && (
                  <div className="relative w-full h-20 flex items-center justify-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-12 h-12 rounded-full bg-white/30 mx-1"
                        style={{ left: `${i * 20 + 10}%` }}
                        animate={phase === "inhale" ? "inhale" : phase === "exhale" ? "exhale" : "hold"}
                        variants={waveVariants}
                        custom={i * 0.2}
                        transition={{
                          delay: i * 0.1,
                          duration: timeLeft / (i + 1),
                        }}
                      />
                    ))}
                  </div>
                )}

                {selectedPattern.animationType === "nostril" && (
                  <div className="relative w-40 h-40">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      {/* Face outline */}
                      <circle cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="2" />

                      {/* Left nostril */}
                      <motion.circle
                        cx="40"
                        cy="60"
                        r="8"
                        fill="rgba(255,255,255,0.7)"
                        stroke="white"
                        strokeWidth="1"
                        animate={phase === "leftNostril" ? "active" : "inactive"}
                        variants={leftNostrilVariants}
                      />

                      {/* Right nostril */}
                      <motion.circle
                        cx="60"
                        cy="60"
                        r="8"
                        fill="rgba(255,255,255,0.7)"
                        stroke="white"
                        strokeWidth="1"
                        animate={phase === "rightNostril" ? "active" : "inactive"}
                        variants={rightNostrilVariants}
                      />

                      {/* Nose bridge */}
                      <path d="M50,40 L50,60" stroke="white" strokeWidth="2" fill="none" />
                    </svg>
                  </div>
                )}

                {/* Timer display */}
                <div className="absolute bottom-0 left-0 right-0 text-center">
                  <span className="text-white text-xl font-light bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm">
                    {Math.ceil(timeLeft)}s
                  </span>
                </div>
              </div>

              {/* Control buttons */}
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-6 w-full max-w-md">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-blue-300 text-blue-700 hover:bg-blue-100 w-full sm:w-1/3"
                  onClick={() => {
                    setSelectedPattern(null)
                    setIsActive(false)
                    setCycles(0)
                  }}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Choose Another
                </Button>

                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 w-full sm:w-1/3" onClick={toggleActive}>
                  {isActive ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                  {isActive ? "Pause" : "Resume"}
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="border-blue-300 text-blue-700 hover:bg-blue-100 w-full sm:w-1/3"
                  onClick={resetExercise}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </div>

              {/* Settings for cycles */}
              <div className="w-full max-w-md mt-6">
                <Card className="border-blue-200 bg-white/80 backdrop-blur-sm shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="cycles">Number of cycles: {totalCycles}</Label>
                      <div className="w-1/2">
                        <Slider
                          id="cycles"
                          min={1}
                          max={10}
                          step={1}
                          value={[totalCycles]}
                          onValueChange={(value) => setTotalCycles(value[0])}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Audio Counter Settings */}
              <div className="w-full max-w-md mt-4">
                <Card className="border-blue-200 bg-white/80 backdrop-blur-sm shadow-sm">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg font-medium text-blue-800">Audio Counter</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setShowCounterSettings(!showCounterSettings)}
                      >
                        <Settings size={16} />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="counter-toggle">Enable audio counter</Label>
                      <Switch id="counter-toggle" checked={counterEnabled} onCheckedChange={setCounterEnabled} />
                    </div>

                    {showCounterSettings && (
                      <div className="space-y-4 mt-4 border-t pt-4 border-blue-100">
                        <div className="space-y-2">
                          <Label>Counter Sound</Label>
                          <RadioGroup
                            value={counterSound}
                            onValueChange={(value) => setCounterSound(value as CounterSoundType)}
                            className="grid grid-cols-2 gap-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="beep" id="beep" />
                              <Label htmlFor="beep">Beep</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="tone" id="tone" />
                              <Label htmlFor="tone">Soft Tone</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="voice" id="voice" />
                              <Label htmlFor="voice">Voice Count</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="none" id="none" />
                              <Label htmlFor="none">None</Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div className="space-y-2">
                          <Label>Counter Frequency</Label>
                          <RadioGroup
                            value={counterFrequency}
                            onValueChange={(value) => setCounterFrequency(value as CounterFrequency)}
                            className="space-y-1"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="every-second" id="every-second" />
                              <Label htmlFor="every-second">Every Second</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="half-way" id="half-way" />
                              <Label htmlFor="half-way">Half-way Point</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="quarter-points" id="quarter-points" />
                              <Label htmlFor="quarter-points">Quarter Points</Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-700 border-blue-300 hover:bg-blue-50"
                            onClick={() => setShowCounterSettings(false)}
                          >
                            <Save size={14} className="mr-1" />
                            Save Settings
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Countdown component */}
        <BreathingCountdown isActive={showCountdown} onComplete={handleCountdownComplete} soundEnabled={soundEnabled} />

        {/* Session complete dialog */}
        {showSessionComplete && selectedPattern && (
          <BreathingSessionComplete
            isOpen={showSessionComplete}
            onClose={() => setShowSessionComplete(false)}
            sessionType={selectedPattern.name}
            durationSeconds={sessionDuration}
            cyclesCompleted={totalCycles}
          />
        )}
      </div>
    </PageContainer>
  )
}
