import type { NextPage } from "next"
import Head from "next/head"
import Link from "next/link"

const BreathePage: NextPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <Head>
        <title>Breathing Exercises | HeartHeals</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex w-full flex-1 flex-col items-center justify-center px-20 text-center">
        <h1 className="text-4xl font-bold text-pink-500 mb-6">Breathing Exercises</h1>

        <p className="mb-8 text-xl">Simple placeholder for breathing exercises. This page will be enhanced later.</p>

        <Link href="/">
          <a className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors">Return Home</a>
        </Link>
      </main>

      <footer className="flex h-24 w-full items-center justify-center border-t">
        <p>HeartHeals &hearts; - Your Wellness Companion</p>
      </footer>
    </div>
  )
}

export default BreathePage
