import type { NextPage } from "next"
import Head from "next/head"
import Link from "next/link"

const Home: NextPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2 bg-gradient-to-br from-pink-50 to-blue-50">
      <Head>
        <title>HeartHeals♥ - Your Wellness Companion</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex w-full flex-1 flex-col items-center justify-center px-4 sm:px-20 text-center">
        <h1 className="text-4xl sm:text-6xl font-bold text-pink-600 mb-6">
          HeartHeals<span className="text-pink-500">♥</span>
        </h1>
        <p className="mt-3 text-xl sm:text-2xl text-pink-500 mb-10">Your personal wellness companion</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl w-full">
          <Link href="/breathe">
            <a className="p-6 border border-pink-200 rounded-xl hover:border-pink-400 transition-colors bg-white shadow-sm hover:shadow-md">
              <h3 className="text-2xl font-bold text-pink-600">Breathing Exercises &rarr;</h3>
              <p className="mt-4 text-lg text-gray-600">Follow guided breathing patterns to find calm and balance.</p>
            </a>
          </Link>

          <Link href="/emotional-log">
            <a className="p-6 border border-pink-200 rounded-xl hover:border-pink-400 transition-colors bg-white shadow-sm hover:shadow-md">
              <h3 className="text-2xl font-bold text-pink-600">Emotional Log &rarr;</h3>
              <p className="mt-4 text-lg text-gray-600">Track your emotions and reflect on your emotional patterns.</p>
            </a>
          </Link>
        </div>
      </main>

      <footer className="flex h-24 w-full items-center justify-center border-t">
        <p className="text-gray-600">HeartHeals♥ - Your Wellness Companion</p>
      </footer>
    </div>
  )
}

export default Home
