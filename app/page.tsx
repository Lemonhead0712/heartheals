import { Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { WelcomeBanner } from "@/components/welcome-banner"
import { InspirationalQuote } from "@/components/inspirational-quote"
import { SelfCompassionPractice } from "@/components/self-compassion-practice"
import { QuickEmotionalLog } from "@/components/quick-emotional-log"
import { ErrorBoundary } from "@/components/error-boundary"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Hero Section */}
      <section className="text-center py-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Welcome to <span className="text-pink-600">HeartHeals♥</span>
        </h1>
        <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-muted-foreground">
          Your companion for emotional wellness and mindful living
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/breathe">
            <Button size="lg" className="bg-pink-600 hover:bg-pink-700">
              Start Breathing Exercise
            </Button>
          </Link>
          <Link href="/emotional-log">
            <Button size="lg" variant="outline">
              Log Your Emotions
            </Button>
          </Link>
        </div>
      </section>

      {/* Welcome Banner */}
      <ErrorBoundary fallback={<div>Something went wrong with the welcome banner</div>}>
        <Suspense fallback={<LoadingSpinner />}>
          <WelcomeBanner />
        </Suspense>
      </ErrorBoundary>

      {/* Features Section */}
      <section className="py-12">
        <h2 className="text-3xl font-bold mb-8 text-center">Our Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Breathing Exercises */}
          <Card>
            <CardHeader>
              <CardTitle>Breathing Exercises</CardTitle>
              <CardDescription>Calm your mind and reduce stress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative h-48 w-full mb-4 rounded-md overflow-hidden">
                <Image
                  src="/placeholder.svg?key=a3j6b"
                  alt="Breathing exercise illustration"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                  priority
                />
              </div>
              <p>Practice guided breathing techniques to help manage stress and anxiety.</p>
            </CardContent>
            <CardFooter>
              <Link href="/breathe" className="w-full">
                <Button className="w-full">Try Now</Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Emotional Logging */}
          <Card>
            <CardHeader>
              <CardTitle>Emotional Logging</CardTitle>
              <CardDescription>Track and understand your feelings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative h-48 w-full mb-4 rounded-md overflow-hidden">
                <Image
                  src="/placeholder.svg?key=cm6dt"
                  alt="Emotional logging illustration"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
              <p>Record and reflect on your emotions to gain insights into patterns and triggers.</p>
            </CardContent>
            <CardFooter>
              <Link href="/emotional-log" className="w-full">
                <Button className="w-full">Log Emotions</Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Thought Patterns */}
          <Card>
            <CardHeader>
              <CardTitle>Thought Patterns</CardTitle>
              <CardDescription>Identify and reshape thinking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative h-48 w-full mb-4 rounded-md overflow-hidden">
                <Image
                  src="/placeholder.svg?key=i0bd7"
                  alt="Thought patterns illustration"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
              <p>Learn to recognize unhelpful thought patterns and develop healthier perspectives.</p>
            </CardContent>
            <CardFooter>
              <Link href="/thoughts" className="w-full">
                <Button className="w-full">Explore Thoughts</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="py-12 bg-muted rounded-lg p-6">
        <h2 className="text-3xl font-bold mb-8 text-center">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Inspirational Quote */}
          <ErrorBoundary fallback={<div>Unable to load inspirational quote</div>}>
            <Suspense
              fallback={
                <div className="h-40 flex items-center justify-center">
                  <LoadingSpinner />
                </div>
              }
            >
              <InspirationalQuote />
            </Suspense>
          </ErrorBoundary>

          {/* Quick Emotional Log */}
          <ErrorBoundary fallback={<div>Unable to load emotional log</div>}>
            <Suspense
              fallback={
                <div className="h-40 flex items-center justify-center">
                  <LoadingSpinner />
                </div>
              }
            >
              <QuickEmotionalLog />
            </Suspense>
          </ErrorBoundary>
        </div>
      </section>

      {/* Self-Compassion Practice */}
      <section className="py-12">
        <h2 className="text-3xl font-bold mb-8 text-center">Daily Practice</h2>
        <ErrorBoundary fallback={<div>Unable to load self-compassion practice</div>}>
          <Suspense
            fallback={
              <div className="h-40 flex items-center justify-center">
                <LoadingSpinner />
              </div>
            }
          >
            {/* Fixed: Added the required practiceType prop */}
            <SelfCompassionPractice practiceType="general" />
          </Suspense>
        </ErrorBoundary>
      </section>
    </div>
  )
}
