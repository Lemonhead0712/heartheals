import type { NextPage } from "next"
import Head from "next/head"
import Link from "next/link"

const ThoughtsPage: NextPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2 bg-gradient-to-br from-pink-50 to-blue-50">
      <Head>
        <title>Thoughts Journal | HeartHeals</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex w-full flex-1 flex-col items-center justify-center px-4 sm:px-20 text-center">
        <h1 className="text-4xl font-bold text-pink-600 mb-6">Thoughts Journal</h1>

        <p className="mb-8 text-xl text-pink-500">
          Simple placeholder for thoughts journal. This page will be enhanced later.
        </p>

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

export default ThoughtsPage
