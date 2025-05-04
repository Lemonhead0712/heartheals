import type { NextPage } from "next"
import Head from "next/head"
import Link from "next/link"

const AboutPage: NextPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2 bg-gradient-to-br from-pink-50 to-blue-50">
      <Head>
        <title>About | HeartHeals</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex w-full flex-1 flex-col items-center justify-center px-4 sm:px-20 text-center">
        <h1 className="text-4xl font-bold text-pink-600 mb-6">About HeartHeals♥</h1>

        <div className="max-w-2xl text-left mb-8">
          <p className="mb-4 text-lg text-gray-700">
            HeartHeals♥ is your personal wellness companion, designed to help you manage stress, track emotions, and
            improve your overall mental wellbeing.
          </p>

          <p className="mb-4 text-lg text-gray-700">
            Our mission is to provide simple, effective tools that help you understand your emotional patterns and
            develop healthy coping mechanisms.
          </p>

          <p className="text-lg text-gray-700">
            Through breathing exercises, emotional logging, and guided reflections, HeartHeals♥ supports your journey
            toward emotional balance and self-awareness.
          </p>
        </div>

        <Link href="/">
          <a className="px-6 py-3 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors">Return Home</a>
        </Link>
      </main>

      <footer className="flex h-24 w-full items-center justify-center border-t">
        <p className="text-gray-600">HeartHeals♥ - Your Wellness Companion</p>
      </footer>
    </div>
  )
}

export default AboutPage
