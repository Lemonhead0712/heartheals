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
      "Watch the circular waves expand as you inhale slowly through your nose",
      "When the waves pause, hold your breath",
      "Watch the waves contract as you exhale slowly through your mouth",
      "When the waves pause again, hold your breath",
      "Follow this rhythm for the entire session",
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
      "Watch the waves expand as you inhale quietly through your nose for 4 seconds",
      "When the waves pause, hold your breath for 7 seconds",
      "Watch the waves contract as you exhale completely through your mouth for 8 seconds",
      "Follow this rhythm for the entire session",
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
      "Watch the waves expand as you inhale slowly through your nose for 4 seconds",
      "Watch the waves contract as you exhale slowly through your mouth for 6 seconds",
      "Focus on the sensation of your breath matching the wave animation",
      "Follow this rhythm for the entire session",
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
      "Watch the left side waves expand as you close your right nostril with your thumb",
      "Inhale slowly through your left nostril as the waves expand",
      "Close your left nostril with your ring finger",
      "Watch the right side waves expand as you exhale through your right nostril",
      "Inhale through your right nostril as the waves expand",
      "Close your right nostril and exhale through your left",
      "Follow the visual wave guidance throughout the session",
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
      "Watch the waves expand as you breathe in slowly through your nose for 6 seconds",
      "Watch the waves contract as you breathe out slowly through your nose for 6 seconds",
      "Continue this pattern without holding your breath",
      "Focus on smooth, continuous breathing matching the wave animation",
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
      "Watch the waves expand as you inhale slowly through your nose, feeling your abdomen rise",
      "Watch the waves contract as you exhale slowly through pursed lips, feeling your abdomen fall",
      "The hand on your chest should remain relatively still",
      "Follow the wave animation throughout the session",
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
    // Function kept for compatibility but sounds removed
    // No sound will be played during phase transitions
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
        return "Breathe in slowly through your nose as the waves expand"
      case "hold1":
        return "Hold your breath as the waves remain still"
      case "exhale":
        return "Breathe out slowly through your mouth as the waves contract"
      case "hold2":
        return "Hold your breath as the waves remain still"
      case "leftNostril":
        return "Close right nostril, inhale through left as the waves expand"
      case "rightNostril":
        return "Close left nostril, inhale through right as the waves expand"
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

  // Get gradient colors based on pattern and phase
  const getGradientColors = () => {
    if (!selectedPattern) return "from-blue-300 to-blue-500"

    // Base color from the pattern
    const baseColor = selectedPattern.color

    // Adjust opacity based on phase
    switch (phase) {
      case "inhale":
      case "leftNostril":
      case "rightNostril":
        return baseColor.replace("to-", "via-blue-400 to-")
      case "exhale":
        return baseColor.replace("from-", "from-purple-300 via-")
      case "hold1":
      case "hold2":
        return baseColor.replace("to-", "via-indigo-400 to-")
      default:
        return baseColor
    }
  }

  // Calculate progress percentage for the current phase
  const getProgressPercentage = () => {
    const initialTime = getInitialTimeForPhase()
    if (initialTime === 0) return 0
    return ((initialTime - timeLeft) / initialTime) * 100
  }

  // Generate wave rings based on the current phase and pattern
  const generateWaveRings = (count = 5) => {
    const rings = []
    const progress = getProgressPercentage() / 100
    const baseSize = 240 // Base size in pixels

    for (let i = 0; i < count; i++) {
      const scale = 0.4 + i * 0.15 // Scale factor for each ring
      const delay = i * 0.1 // Stagger delay for animation

      // Calculate size based on phase
      let size = baseSize * scale
      let opacity = 0.2 + i * 0.15

      if (phase === "inhale" || phase === "leftNostril" || phase === "rightNostril") {
        // Expand from small to large during inhale
        size = baseSize * (scale * (0.6 + progress * 0.6))
        opacity = 0.2 + i * 0.15 + progress * 0.2
      } else if (phase === "exhale") {
        // Contract from large to small during exhale
        size = baseSize * (scale * (1.2 - progress * 0.6))
        opacity = 0.4 + i * 0.15 - progress * 0.2
      } else {
        // Hold phases - maintain size with subtle pulsing
        size = baseSize * scale * 1.2
      }

      rings.push(
        <motion.div
          key={i}
          className="absolute rounded-full border border-white/30"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            top: `50%`,
            left: `50%`,
            marginLeft: `-${size / 2}px`,
            marginTop: `-${size / 2}px`,
            opacity: opacity,
            zIndex: count - i,
          }}
          animate={{
            scale: phase === "hold1" || phase === "hold2" ? [1, 1.05, 1] : 1,
            opacity: phase === "hold1" || phase === "hold2" ? [opacity, opacity + 0.1, opacity] : opacity,
          }}
          transition={{
            duration: phase === "hold1" || phase === "hold2" ? 2 : timeLeft,
            ease: phase === "hold1" || phase === "hold2" ? "easeInOut" : "linear",
            repeat: phase === "hold1" || phase === "hold2" ? Number.POSITIVE_INFINITY : 0,
            delay: delay,
          }}
        />,
      )
    }

    return rings
  }

  // Generate nostril-specific wave rings
  const generateNostrilWaveRings = (side: "left" | "right", count = 4) => {
    const rings = []
    const progress = getProgressPercentage() / 100
    const baseSize = 70 // Base size in pixels
    const isActive = (side === "left" && phase === "leftNostril") || (side === "right" && phase === "rightNostril")

    for (let i = 0; i < count; i++) {
      const scale = 0.6 + i * 0.2 // Scale factor for each ring
      const delay = i * 0.1 // Stagger delay for animation

      // Calculate size based on phase and active state
      let size = baseSize * scale
      let opacity = isActive ? 0.3 + i * 0.15 : 0.1

      if (isActive) {
        // Expand from small to large during active phase
        size = baseSize * (scale * (0.7 + progress * 0.5))
        opacity = 0.3 + i * 0.15 + progress * 0.2
      }

      rings.push(
        <motion.div
          key={`${side}-${i}`}
          className="absolute rounded-full border border-white/30"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            top: `50%`,
            left: `50%`,
            marginLeft: `-${size / 2}px`,
            marginTop: `-${size / 2}px`,
            opacity: opacity,
            zIndex: count - i,
          }}
          animate={{
            scale: isActive ? [1, 1.05, 1] : 1,
            opacity: isActive ? [opacity, opacity + 0.1, opacity] : opacity,
          }}
          transition={{
            duration: isActive ? 1.5 : 0.5,
            ease: "easeInOut",
            repeat: isActive ? Number.POSITIVE_INFINITY : 0,
            delay: delay,
          }}
        />,
      )
    }

    return rings
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
                              `Watch the waves expand as you inhale for ${customDurations.inhale} seconds`,
                              customDurations.hold1 > 0
                                ? `Hold your breath as the waves pause for ${customDurations.hold1} seconds`
                                : "",
                              `Watch the waves contract as you exhale for ${customDurations.exhale} seconds`,
                              customDurations.hold2 > 0
                                ? `Hold your breath as the waves pause for ${customDurations.hold2} seconds`
                                : "",
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
                  className={`fixed top-0 left-0 w-full h-full -z-10 bg-gradient-to-br ${getGradientColors()}`}
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

              {/* Enhanced Wave-based Breathing animation container */}
              <div className="relative flex justify-center items-center my-6 h-[40vh] w-full max-w-md">
                {selectedPattern.animationType === "circle" || selectedPattern.animationType === "wave" ? (
                  <div className="relative flex justify-center items-center w-full h-full">
                    {/* Wave-based circular animation */}
                    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                      {/* Background gradient for depth */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-300/10 to-transparent rounded-full" />

                      {/* Generate wave rings */}
                      {generateWaveRings(6)}

                      {/* Central text indicator */}
                      <motion.div
                        className="absolute flex items-center justify-center text-white text-2xl font-light z-10 bg-blue-500/20 px-6 py-2 rounded-full backdrop-blur-sm"
                        animate={{
                          opacity: [0.8, 1, 0.8],
                          scale: phase === "inhale" ? [0.9, 1] : phase === "exhale" ? [1, 0.9] : 1,
                        }}
                        transition={{
                          duration: timeLeft,
                          ease: "easeInOut",
                        }}
                      >
                        {getPhaseText()}
                      </motion.div>
                    </div>
                  </div>
                ) : (
                  // Nostril-specific animation
                  <div className="relative w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 200 200" className="w-full h-full max-w-xs">
                      {/* Face outline with enhanced styling */}
                      <circle cx="100" cy="100" r="80" fill="rgba(255,255,255,0.1)" stroke="white" strokeWidth="1" />

                      {/* Face features for better visualization */}
                      <ellipse
                        cx="100"
                        cy="80"
                        rx="50"
                        ry="30"
                        fill="none"
                        stroke="white"
                        strokeWidth="0.5"
                        opacity="0.5"
                      />

                      {/* Left nostril container */}
                      <g transform="translate(70, 120)">
                        {/* Left nostril waves */}
                        <foreignObject width="40" height="40" x="-20" y="-20">
                          <div className="relative w-40 h-40" style={{ transform: "translate(-50%, -50%)" }}>
                            {generateNostrilWaveRings("left")}
                          </div>
                        </foreignObject>

                        {/* Left nostril circle */}
                        <circle cx="0" cy="0" r="15" fill="none" stroke="white" strokeWidth="1" />

                        {/* Text indicator */}
                        <text x="0" y="0" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="8">
                          {phase === "leftNostril" ? "IN" : ""}
                        </text>
                      </g>

                      {/* Right nostril container */}
                      <g transform="translate(130, 120)">
                        {/* Right nostril waves */}
                        <foreignObject width="40" height="40" x="-20" y="-20">
                          <div className="relative w-40 h-40" style={{ transform: "translate(-50%, -50%)" }}>
                            {generateNostrilWaveRings("right")}
                          </div>
                        </foreignObject>

                        {/* Right nostril circle */}
                        <circle cx="0" cy="0" r="15" fill="none" stroke="white" strokeWidth="1" />

                        {/* Text indicator */}
                        <text x="0" y="0" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="8">
                          {phase === "rightNostril" ? "IN" : ""}
                        </text>
                      </g>

                      {/* Nose bridge */}
                      <path d="M100,80 L100,120" stroke="white" strokeWidth="1" fill="none" />

                      {/* Hand indicators */}
                      {phase === "leftNostril" && (
                        <motion.path
                          d="M150,100 C140,110 135,115 130,120"
                          stroke="white"
                          strokeWidth="1"
                          fill="none"
                          strokeDasharray="2,2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.7 }}
                          transition={{ duration: 0.5 }}
                        />
                      )}

                      {phase === "rightNostril" && (
                        <motion.path
                          d="M50,100 C60,110 65,115 70,120"
                          stroke="white"
                          strokeWidth="1"
                          fill="none"
                          strokeDasharray="2,2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.7 }}
                          transition={{ duration: 0.5 }}
                        />
                      )}

                      {/* Phase text */}
                      <text x="100" y="170" textAnchor="middle" fill="white" fontSize="12">
                        {getPhaseText()}
                      </text>
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
