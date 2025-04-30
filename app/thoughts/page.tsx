"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, Save, AlertCircle, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { Logo } from "@/components/logo"
import { EmotionalAwarenessMeter } from "@/components/emotional-awareness-meter"
import { SelfCompassionPractice } from "@/components/self-compassion-practice"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { EmotionalThoughtsSpinner } from "@/components/emotional-thoughts-spinner"
import { useQuizRotation } from "@/hooks/use-quiz-rotation"
import { QuizProgressIndicator } from "@/components/quiz-progress-indicator"
import { BottomNav } from "@/components/bottom-nav"
import { PageContainer } from "@/components/page-container"

type JournalPrompt = {
  id: string
  prompt: string
  category: string
}

type QuizQuestion = {
  id: string
  question: string
  options: string[]
  scores?: number[] // Score value for each option
  category?: string
}

export default function ThoughtsPage() {
  const [journalEntry, setJournalEntry] = useState("")
  const [selectedPrompt, setSelectedPrompt] = useState<JournalPrompt | null>(null)
  const [journalEntries, setJournalEntries] = useState<{ prompt: string; entry: string; date: Date }[]>([])
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion[]>([])
  const [quizType, setQuizType] = useState<"emotional-awareness" | "self-compassion">("emotional-awareness")
  const [quizAnswers, setQuizAnswers] = useState<{ [key: string]: string }>({})
  const [quizScores, setQuizScores] = useState<{ [key: string]: number }>({})
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [awarenessScore, setAwarenessScore] = useState(0)
  const [categoryScores, setCategoryScores] = useState<{ [key: string]: number }>({})
  const [recommendedPractice, setRecommendedPractice] = useState<
    "self-kindness" | "common-humanity" | "mindfulness" | "general" | null
  >(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("journal")

  const { shownQuestionIds, saveQuizSession } = useQuizRotation("self-compassion")

  const journalPrompts: JournalPrompt[] = [
    {
      id: "gratitude1",
      prompt: "List three things you're grateful for today and why they bring you joy.",
      category: "Gratitude",
    },
    {
      id: "reflection1",
      prompt: "Describe a moment when you felt truly at peace. What elements contributed to that feeling?",
      category: "Reflection",
    },
    {
      id: "growth1",
      prompt: "What's one emotional challenge you're facing right now? How might you approach it with self-compassion?",
      category: "Growth",
    },
    {
      id: "awareness1",
      prompt:
        "Notice your body right now. Where do you feel tension? Where do you feel ease? Describe these sensations.",
      category: "Awareness",
    },
  ]

  // Load journal entries from localStorage on mount
  useEffect(() => {
    try {
      const savedEntries = localStorage.getItem("heartsHeal_journalEntries")
      if (savedEntries) {
        const parsed = JSON.parse(savedEntries)
        // Convert string dates back to Date objects
        const entries = parsed.map((entry: any) => ({
          ...entry,
          date: new Date(entry.date),
        }))
        setJournalEntries(entries)
      }
    } catch (error) {
      console.error("Error loading journal entries:", error)
    }
  }, [])

  // Store self-compassion questions for progress tracking
  useEffect(() => {
    try {
      const selfCompassionQuestions = questionPools["self-compassion"]
      localStorage.setItem("heartsHeal_selfCompassionQuestions", JSON.stringify(selfCompassionQuestions))
    } catch (error) {
      console.error("Error storing self-compassion questions:", error)
    }
  }, [])

  // Expanded pool of 20 questions for each quiz type
  const questionPools = {
    "emotional-awareness": [
      {
        id: "ea1",
        question: "When you feel upset, how quickly do you typically recognize the specific emotion?",
        options: [
          "Immediately - I always know exactly what I'm feeling",
          "Within a few minutes - I need a moment to identify it",
          "It takes me some time - I often feel 'bad' before I can name it",
          "I struggle to identify specific emotions beyond 'good' or 'bad'",
        ],
        scores: [100, 75, 50, 25],
      },
      {
        id: "ea2",
        question: "How comfortable are you expressing your emotions to others?",
        options: [
          "Very comfortable - I share openly with most people",
          "Somewhat comfortable - I share with close friends/family",
          "Somewhat uncomfortable - I rarely express my true feelings",
          "Very uncomfortable - I prefer to keep emotions private",
        ],
        scores: [100, 75, 50, 25],
      },
      {
        id: "ea3",
        question: "When faced with a difficult emotion, what's your typical response?",
        options: [
          "I sit with it and explore what it's trying to tell me",
          "I acknowledge it but try to move on quickly",
          "I distract myself until it passes",
          "I try to suppress or ignore it",
        ],
        scores: [100, 75, 50, 25],
      },
      {
        id: "ea4",
        question: "How well can you distinguish between similar emotions (e.g., disappointment vs. sadness)?",
        options: [
          "Very well - I can identify subtle differences between emotions",
          "Fairly well - I can usually tell the difference between similar emotions",
          "Somewhat - I sometimes confuse similar emotions",
          "Not well - Many emotions feel the same to me",
        ],
        scores: [100, 75, 50, 25],
      },
      {
        id: "ea5",
        question: "How aware are you of how your emotions affect your body?",
        options: [
          "Very aware - I notice physical sensations tied to specific emotions",
          "Somewhat aware - I notice major physical changes with strong emotions",
          "Occasionally aware - I sometimes notice physical symptoms after they're intense",
          "Rarely aware - I don't typically connect physical sensations to emotions",
        ],
        scores: [100, 75, 50, 25],
      },
      // More emotional awareness questions...
    ],
    "self-compassion": [
      // Self-Kindness vs. Self-Judgment (7 questions)
      {
        id: "sc1",
        question: "When you make a mistake, what's your typical self-talk?",
        options: [
          "Kind and understanding - 'Everyone makes mistakes'",
          "Balanced - 'I messed up, but I'll learn from this'",
          "Somewhat critical - 'I should have known better'",
          "Harsh - 'I'm such a failure'",
        ],
        scores: [100, 75, 50, 25],
        category: "self-kindness",
      },
      {
        id: "sc2",
        question: "How do you typically respond to your own suffering or difficulties?",
        options: [
          "With warmth and care, like I would treat a good friend",
          "With patience and understanding most of the time",
          "With some frustration that I'm struggling",
          "With judgment that I should be stronger or better",
        ],
        scores: [100, 75, 50, 25],
        category: "self-kindness",
      },
      {
        id: "sc3",
        question: "When you're going through a very hard time, how do you typically treat yourself?",
        options: [
          "I give myself the caring I need",
          "I try to be understanding toward myself",
          "I'm somewhat tough on myself",
          "I'm disapproving and judgmental about my flaws",
        ],
        scores: [100, 75, 50, 25],
        category: "self-kindness",
      },
      {
        id: "sc4",
        question: "When something painful happens, how do you typically react?",
        options: [
          "I try to be loving toward myself",
          "I try to take a balanced view of the situation",
          "I tend to fixate on everything that's wrong",
          "I tend to be cold and harsh with myself",
        ],
        scores: [100, 75, 50, 25],
        category: "self-kindness",
      },
      {
        id: "sc5",
        question: "When you notice aspects of yourself that you don't like, how do you respond?",
        options: [
          "I'm kind and patient with those parts of myself",
          "I try to be accepting of those parts of myself",
          "I get down on myself and feel disappointed",
          "I'm intolerant and harsh with those parts of myself",
        ],
        scores: [100, 75, 50, 25],
        category: "self-kindness",
      },
      {
        id: "sc6",
        question: "When you fail at something important to you, how do you feel?",
        options: [
          "I try to be understanding and patient with myself",
          "I remind myself that failure is part of being human",
          "I feel inadequate and tend to be hard on myself",
          "I feel worthless and like a complete failure",
        ],
        scores: [100, 75, 50, 25],
        category: "self-kindness",
      },
      {
        id: "sc7",
        question: "When you're feeling down, how likely are you to nurture yourself with kindness?",
        options: [
          "Very likely - I actively practice self-kindness",
          "Somewhat likely - I try to be kind to myself",
          "Not very likely - I rarely think to be kind to myself",
          "Not at all likely - I tend to criticize myself instead",
        ],
        scores: [100, 75, 50, 25],
        category: "self-kindness",
      },

      // Common Humanity vs. Isolation (7 questions)
      {
        id: "sc8",
        question: "When you're feeling inadequate, how do you view your experience in relation to others?",
        options: [
          "I remember most people have similar feelings sometimes",
          "I try to remind myself I'm not alone in my struggles",
          "I tend to feel like others are probably having an easier time",
          "I feel isolated and alone in my failures",
        ],
        scores: [100, 75, 50, 25],
        category: "common-humanity",
      },
      {
        id: "sc9",
        question: "When you're going through a hard time, how do you view your struggles?",
        options: [
          "As part of the larger human experience that everyone shares",
          "As something many people go through, though it feels personal",
          "As something that happens to me more than to others",
          "As something that separates me from others",
        ],
        scores: [100, 75, 50, 25],
        category: "common-humanity",
      },
      {
        id: "sc10",
        question: "When you think about your inadequacies, how do they make you feel about your place in the world?",
        options: [
          "Connected to others who also have weaknesses",
          "Reminded that everyone has challenges",
          "Somewhat isolated from others",
          "Like I'm separate from the rest of the world",
        ],
        scores: [100, 75, 50, 25],
        category: "common-humanity",
      },
      {
        id: "sc11",
        question: "When you're really struggling, what thoughts tend to come up?",
        options: [
          "This is a common human experience that many people face",
          "Other people probably feel this way sometimes too",
          "Other people probably have it easier than I do",
          "No one else feels as bad as I do right now",
        ],
        scores: [100, 75, 50, 25],
        category: "common-humanity",
      },
      {
        id: "sc12",
        question: "When you make a mistake, how do you view it in relation to others?",
        options: [
          "As a normal part of human experience that everyone shares",
          "As something that happens to most people sometimes",
          "As something that makes me feel different from others",
          "As proof that I'm uniquely flawed compared to others",
        ],
        scores: [100, 75, 50, 25],
        category: "common-humanity",
      },
      {
        id: "sc13",
        question: "When you're feeling down, how connected do you feel to others?",
        options: [
          "I remind myself that many people feel this way sometimes",
          "I try to remember I'm not alone in my feelings",
          "I tend to feel somewhat isolated from others",
          "I feel completely alone in my experience",
        ],
        scores: [100, 75, 50, 25],
        category: "common-humanity",
      },
      {
        id: "sc14",
        question: "When you reflect on your flaws, how do you view them?",
        options: [
          "As part of being human that everyone shares",
          "As normal imperfections that most people have",
          "As things that make me different from others",
          "As unique defects that separate me from 'normal' people",
        ],
        scores: [100, 75, 50, 25],
        category: "common-humanity",
      },

      // Mindfulness vs. Over-identification (6 questions)
      {
        id: "sc15",
        question: "When something upsets you, how do you typically process your emotions?",
        options: [
          "I observe my feelings with openness and balance",
          "I try to keep a balanced perspective on the situation",
          "I tend to fixate on everything that's wrong",
          "I get carried away with my feelings and can't let go",
        ],
        scores: [100, 75, 50, 25],
        category: "mindfulness",
      },
      {
        id: "sc16",
        question: "When you're feeling down, how do you relate to your negative emotions?",
        options: [
          "I approach them with curious awareness and balance",
          "I try to keep them in perspective",
          "I tend to obsess and fixate on everything wrong",
          "I get completely consumed by them",
        ],
        scores: [100, 75, 50, 25],
        category: "mindfulness",
      },
      {
        id: "sc17",
        question: "When something painful happens, how do you typically handle your emotions?",
        options: [
          "I try to take a balanced view of the situation",
          "I try to keep things in perspective",
          "I tend to blow the incident out of proportion",
          "I get carried away with my feelings",
        ],
        scores: [100, 75, 50, 25],
        category: "mindfulness",
      },
      {
        id: "sc18",
        question: "When you fail at something important, how do you process that experience?",
        options: [
          "I try to keep a balanced perspective on what happened",
          "I try to see both the positive and negative aspects",
          "I tend to focus exclusively on the negative aspects",
          "I become completely consumed by feelings of inadequacy",
        ],
        scores: [100, 75, 50, 25],
        category: "mindfulness",
      },
      {
        id: "sc19",
        question: "When you notice aspects of yourself you don't like, what's your typical response?",
        options: [
          "I observe them with balanced awareness",
          "I try not to fixate on them too much",
          "I tend to obsess about my flaws",
          "I become completely consumed by my perceived inadequacies",
        ],
        scores: [100, 75, 50, 25],
        category: "mindfulness",
      },
      {
        id: "sc20",
        question: "When you're going through a very difficult time, how do you relate to your thoughts?",
        options: [
          "I notice them with balanced awareness without getting caught up in them",
          "I try to keep some perspective on my thoughts",
          "I tend to get caught up in my negative thoughts",
          "I become completely consumed by my negative thinking",
        ],
        scores: [100, 75, 50, 25],
        category: "mindfulness",
      },
    ],
  }

  // Function to randomly select questions from the pool
  const getRandomQuestions = (quizName: "emotional-awareness" | "self-compassion", count: number) => {
    const pool = questionPools[quizName]
    const shuffled = [...pool].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, Math.min(count, shuffled.length))
  }

  const handleJournalSubmit = () => {
    if (journalEntry.trim() && selectedPrompt) {
      const newEntry = {
        prompt: selectedPrompt.prompt,
        entry: journalEntry,
        date: new Date(),
      }

      const updatedEntries = [newEntry, ...journalEntries]
      setJournalEntries(updatedEntries)

      // Save to localStorage
      try {
        localStorage.setItem("heartsHeal_journalEntries", JSON.stringify(updatedEntries))
      } catch (error) {
        console.error("Error saving journal entry:", error)
        setError("Failed to save your journal entry. Please try again.")
      }

      setJournalEntry("")
      setSelectedPrompt(null)
    }
  }

  // Get recently shown question IDs

  const startQuiz = (quizName: "emotional-awareness" | "self-compassion") => {
    setIsLoading(true)
    setError(null)

    try {
      if (quizName === "self-compassion") {
        // For self-compassion, select questions from each category
        const pool = questionPools[quizName]
        const categorizedQuestions = {
          "self-kindness": pool.filter((q) => q.category === "self-kindness"),
          "common-humanity": pool.filter((q) => q.category === "common-humanity"),
          mindfulness: pool.filter((q) => q.category === "mindfulness"),
        }

        // Select questions from each category, prioritizing those not recently shown
        // We want exactly 5 questions total with balanced category representation
        const selectedQuestions = [
          ...selectQuestionsWithRotation(categorizedQuestions["self-kindness"] || [], 2, shownQuestionIds),
          ...selectQuestionsWithRotation(categorizedQuestions["common-humanity"] || [], 2, shownQuestionIds),
          ...selectQuestionsWithRotation(categorizedQuestions["mindfulness"] || [], 1, shownQuestionIds),
        ]

        // Save the selected question IDs for future rotation
        saveQuizSession(selectedQuestions.map((q) => q.id))

        setCurrentQuiz(selectedQuestions)
      } else {
        // For emotional awareness, select random questions
        const randomQuestions = getRandomQuestions(quizName, 6)
        setCurrentQuiz(randomQuestions)
      }

      setQuizType(quizName)
      setQuizAnswers({})
      setQuizScores({})
      setCategoryScores({})
      setQuizCompleted(false)
      setAwarenessScore(0)
      setRecommendedPractice(null)

      // Simulate loading for better UX
      setTimeout(() => {
        setIsLoading(false)
      }, 800)
    } catch (error) {
      console.error("Error starting quiz:", error)
      setError("Failed to start the quiz. Please try again.")
      setIsLoading(false)
    }
  }

  // Helper function for selecting questions with rotation
  const selectQuestionsWithRotation = (questions: QuizQuestion[], count: number, shownQuestionIds: string[]) => {
    // First, separate questions into those shown recently and those not shown recently
    const notRecentlyShown = questions.filter((q) => !shownQuestionIds.includes(q.id))
    const recentlyShown = questions.filter((q) => shownQuestionIds.includes(q.id))

    // Shuffle both arrays
    const shuffledNotShown = [...notRecentlyShown].sort(() => 0.5 - Math.random())
    const shuffledShown = [...recentlyShown].sort(() => 0.5 - Math.random())

    // Prioritize questions not shown recently
    const selected = [...shuffledNotShown, ...shuffledShown].slice(0, count)

    // If we don't have enough questions, just return what we have
    return selected.length < count ? selected : selected.slice(0, count)
  }

  const handleQuizAnswer = (questionId: string, answer: string, index: number) => {
    const question = currentQuiz.find((q) => q.id === questionId)
    const score = question?.scores?.[index] || 0

    setQuizAnswers({
      ...quizAnswers,
      [questionId]: answer,
    })

    setQuizScores({
      ...quizScores,
      [questionId]: score,
    })
  }

  const submitQuiz = () => {
    setIsLoading(true)

    try {
      // Calculate the average score
      const totalScore = Object.values(quizScores).reduce((sum, score) => sum + score, 0)
      const averageScore = Math.round(totalScore / Object.values(quizScores).length)

      // Calculate category scores
      if (quizType === "self-compassion") {
        const categories = {
          "self-kindness": { total: 0, count: 0 },
          "common-humanity": { total: 0, count: 0 },
          mindfulness: { total: 0, count: 0 },
        }

        currentQuiz.forEach((question) => {
          const category = question.category as keyof typeof categories
          if (category && quizScores[question.id]) {
            categories[category].total += quizScores[question.id]
            categories[category].count += 1
          }
        })

        const categoryScoresResult = Object.entries(categories).reduce(
          (result, [category, data]) => {
            result[category] = data.count > 0 ? Math.round(data.total / data.count) : 0
            return result
          },
          {} as { [key: string]: number },
        )

        setCategoryScores(categoryScoresResult)

        // Recommend practice based on lowest score
        if (Object.keys(categoryScoresResult).length > 0) {
          const lowestCategory = Object.entries(categoryScoresResult).sort(
            ([, scoreA], [, scoreB]) => scoreA - scoreB,
          )[0][0] as "self-kindness" | "common-humanity" | "mindfulness"

          setRecommendedPractice(lowestCategory)
        } else {
          setRecommendedPractice("general")
        }
      }

      setAwarenessScore(averageScore)

      // Save quiz results to localStorage
      try {
        const savedQuizzes = JSON.parse(localStorage.getItem("heartsHeal_quizResults") || "[]")
        savedQuizzes.push({
          type: quizType,
          score: averageScore,
          categoryScores: quizType === "self-compassion" ? categoryScores : undefined,
          date: new Date().toISOString(),
        })
        localStorage.setItem("heartsHeal_quizResults", JSON.stringify(savedQuizzes))
      } catch (error) {
        console.error("Error saving quiz results:", error)
      }

      // Simulate processing for better UX
      setTimeout(() => {
        setQuizCompleted(true)
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      console.error("Error submitting quiz:", error)
      setError("Failed to process quiz results. Please try again.")
      setIsLoading(false)
    }
  }

  const isQuizComplete = currentQuiz.length > 0 && currentQuiz.every((q) => quizAnswers[q.id])

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

  const formatCategory = (category: string): string => {
    switch (category) {
      case "self-kindness":
        return "Self-Kindness"
      case "common-humanity":
        return "Common Humanity"
      case "mindfulness":
        return "Mindfulness"
      default:
        return category.charAt(0).toUpperCase() + category.slice(1)
    }
  }

  // Helper function to get random questions from an array
  const getRandomQuestionsFromArray = (questions: QuizQuestion[], count: number) => {
    const shuffled = [...questions].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, Math.min(count, shuffled.length))
  }

  return (
    <PageContainer>
      <div className="min-h-screen bg-gradient-to-br from-[#fce4ec] via-[#e0f7fa] to-[#ede7f6] pb-20">
        <motion.div
          className="container mx-auto px-4 py-8 max-w-4xl"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div className="flex flex-col items-center mb-6" variants={item}>
            <Logo size="small" />
          </motion.div>

          <motion.div className="mb-8" variants={item}>
            <Link href="/" className="inline-flex items-center text-purple-700 hover:text-purple-900 transition-colors">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-purple-800 mt-4 mb-2">Emotional Thoughts</h1>
            <p className="text-purple-600">
              Explore your emotional landscape through journaling and reflective exercises
            </p>
          </motion.div>

          {error && (
            <motion.div className="mb-4" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          <motion.div variants={item}>
            <Tabs defaultValue="journal" className="w-full" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="journal" className="text-purple-700 data-[state=active]:bg-purple-100">
                  Journal
                </TabsTrigger>
                <TabsTrigger value="quizzes" className="text-purple-700 data-[state=active]:bg-purple-100">
                  Reflective Quizzes
                </TabsTrigger>
              </TabsList>

              <TabsContent value="journal" className="space-y-6">
                <Card className="border-purple-200 bg-white/90 backdrop-blur-sm shadow-md">
                  <CardHeader>
                    <CardTitle className="text-purple-700">Emotional Journaling</CardTitle>
                    <CardDescription className="text-purple-600">
                      Select a prompt and write freely about your thoughts and feelings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {!selectedPrompt ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {journalPrompts.map((prompt) => (
                          <Card
                            key={prompt.id}
                            className="border-purple-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all cursor-pointer hover:scale-105 duration-300"
                            onClick={() => setSelectedPrompt(prompt)}
                          >
                            <CardContent className="p-4">
                              <div className="text-xs font-medium text-purple-500 mb-2">{prompt.category}</div>
                              <p className="text-purple-700">{prompt.prompt}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-purple-50 p-4 rounded-md text-purple-700">
                          <div className="text-xs font-medium text-purple-500 mb-2">{selectedPrompt.category}</div>
                          <p>{selectedPrompt.prompt}</p>
                        </div>
                        <Textarea
                          placeholder="Write your thoughts here..."
                          className="min-h-[200px] border-purple-200 focus-visible:ring-purple-500"
                          value={journalEntry}
                          onChange={(e) => setJournalEntry(e.target.value)}
                        />
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            className="border-purple-200 text-purple-700 hover:bg-purple-100"
                            onClick={() => setSelectedPrompt(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                            onClick={handleJournalSubmit}
                            disabled={!journalEntry.trim()}
                          >
                            <Save className="mr-2 h-4 w-4" />
                            Save Entry
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {journalEntries.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-semibold text-purple-800">Your Journal Entries</h2>

                    <div className="space-y-4">
                      {journalEntries.map((entry, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5 }}
                        >
                          <Card className="border-purple-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="pt-6">
                              <div className="text-sm text-purple-600 mb-2">
                                {entry.date.toLocaleDateString()} at{" "}
                                {entry.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </div>
                              <div className="bg-purple-50 p-4 rounded-md text-purple-700 mb-4">
                                <p className="italic">{entry.prompt}</p>
                              </div>
                              <p className="text-purple-800 whitespace-pre-line">{entry.entry}</p>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="quizzes" className="space-y-6">
                {quizType === "self-compassion" && <QuizProgressIndicator />}
                {isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <EmotionalThoughtsSpinner size="md" />
                  </div>
                ) : currentQuiz.length === 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card
                      className="border-purple-200 bg-white/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-all cursor-pointer hover:scale-105 duration-300"
                      onClick={() => startQuiz("emotional-awareness")}
                    >
                      <CardHeader>
                        <CardTitle className="text-purple-700">Emotional Awareness Quiz</CardTitle>
                        <CardDescription className="text-purple-600">
                          Explore how you recognize and process your emotions
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-purple-600">
                          This quiz helps you understand your relationship with emotions and how you experience them.
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Button
                          className="w-full bg-purple-600 hover:bg-purple-700"
                          onClick={(e) => {
                            e.stopPropagation()
                            startQuiz("emotional-awareness")
                          }}
                        >
                          Start Quiz
                        </Button>
                      </CardFooter>
                    </Card>
                    <Card
                      className="border-purple-200 bg-white/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-all cursor-pointer hover:scale-105 duration-300"
                      onClick={() => startQuiz("self-compassion")}
                    >
                      <CardHeader>
                        <CardTitle className="text-purple-700">Self-Compassion Check</CardTitle>
                        <CardDescription className="text-purple-600">
                          Explore how you treat yourself during difficult times and discover ways to nurture
                          self-kindness
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-purple-600">
                          This assessment helps you understand your self-compassion practices and offers personalized
                          guidance for growth.
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Button
                          className="w-full bg-purple-600 hover:bg-purple-700"
                          onClick={(e) => {
                            e.stopPropagation()
                            startQuiz("self-compassion")
                          }}
                        >
                          Start Quiz
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                ) : (
                  <Card className="border-purple-200 bg-white/90 backdrop-blur-sm shadow-md">
                    <CardHeader>
                      <CardTitle className="text-purple-700">
                        {quizType === "emotional-awareness" ? "Emotional Awareness Quiz" : "Self-Compassion Check"}
                      </CardTitle>
                      <CardDescription className="text-purple-600">
                        {quizCompleted ? "Your quiz results" : "Select the answer that best describes you"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {quizCompleted ? (
                        <div className="space-y-6">
                          <EmotionalAwarenessMeter
                            score={awarenessScore}
                            quizType={quizType}
                            categoryScores={quizType === "self-compassion" ? categoryScores : undefined}
                          />

                          <div className="mt-8 space-y-4">
                            <h3 className="text-lg font-medium text-purple-800">Your Responses</h3>

                            {quizType === "self-compassion" && (
                              <div className="bg-purple-50 p-4 rounded-md mb-4">
                                <h4 className="text-sm font-medium text-purple-700 mb-2">Categories Assessed</h4>
                                <div className="flex flex-wrap gap-2">
                                  {Object.keys(categoryScores).length > 0 ? (
                                    Object.keys(categoryScores).map((category) => (
                                      <span
                                        key={category}
                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                                      >
                                        {formatCategory(category)}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-sm text-purple-600">No category data available</span>
                                  )}
                                </div>
                                <p className="text-xs text-purple-600 mt-2">
                                  Each quiz assesses different aspects of self-compassion. Take the quiz regularly to
                                  get a comprehensive assessment over time.
                                </p>
                              </div>
                            )}

                            {currentQuiz.map((question) => (
                              <div key={question.id} className="bg-purple-50 p-4 rounded-md">
                                <p className="font-medium text-purple-800 mb-2">{question.question}</p>
                                <p className="text-purple-700">{quizAnswers[question.id]}</p>
                                {quizType === "self-compassion" && question.category && (
                                  <p className="text-xs text-purple-500 mt-1 italic">
                                    Category: {formatCategory(question.category as string)}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>

                          <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                              className="flex-1 bg-purple-600 hover:bg-purple-700"
                              onClick={() => startQuiz(quizType)}
                            >
                              Take Another Quiz
                            </Button>

                            <Button
                              variant="outline"
                              className="flex-1 border-purple-200 text-purple-700 hover:bg-purple-100"
                              onClick={() => setCurrentQuiz([])}
                            >
                              Return to Quiz Selection
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-8">
                          {currentQuiz.map((question, index) => (
                            <div key={question.id} className="space-y-4">
                              <h3 className="text-lg font-medium text-purple-800">
                                {index + 1}. {question.question}
                              </h3>
                              <div className="space-y-2">
                                {question.options.map((option, optionIndex) => (
                                  <div
                                    key={option}
                                    className={`p-3 rounded-md cursor-pointer transition-colors ${
                                      quizAnswers[question.id] === option
                                        ? "bg-purple-100 border-2 border-purple-300"
                                        : "bg-white border border-purple-200 hover:bg-purple-50"
                                    }`}
                                    onClick={() => handleQuizAnswer(question.id, option, optionIndex)}
                                    role="button"
                                    tabIndex={0}
                                    aria-checked={quizAnswers[question.id] === option}
                                    aria-label={option}
                                  >
                                    <p className="text-purple-700">{option}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}

                          <div className="flex justify-end space-x-2 pt-4">
                            <Button
                              variant="outline"
                              className="border-purple-200 text-purple-700 hover:bg-purple-100"
                              onClick={() => setCurrentQuiz([])}
                            >
                              Cancel
                            </Button>
                            <Button
                              className="bg-purple-600 hover:bg-purple-700 text-white"
                              onClick={submitQuiz}
                              disabled={!isQuizComplete || isLoading}
                            >
                              {isLoading ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                "Complete Quiz"
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                      {quizCompleted && quizType === "self-compassion" && recommendedPractice && (
                        <div className="mt-8 space-y-4">
                          <h3 className="text-lg font-medium text-purple-800">Recommended Practice</h3>
                          <p className="text-purple-600 mb-4">
                            Based on your quiz results, we've identified an area where self-compassion practice could be
                            most beneficial for you.
                          </p>
                          <SelfCompassionPractice practiceType={recommendedPractice} />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>

        <BottomNav />
      </div>
    </PageContainer>
  )
}
