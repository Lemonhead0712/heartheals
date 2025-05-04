import type { NextPage } from "next"
import Head from "next/head"
import Link from "next/link"

const Home: NextPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <Head>
        <title>HeartHeals</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex w-full flex-1 flex-col items-center justify-center px-20 text-center">
        <h1 className="text-6xl font-bold text-pink-500">Welcome to HeartHeals</h1>

        <p className="mt-3 text-2xl">Your wellness journey starts here</p>

        <div className="mt-6 flex max-w-4xl flex-wrap items-center justify-around sm:w-full">
          <Link href="/breathe">
            <a className="mt-6 w-96 rounded-xl border p-6 text-left hover:text-pink-500 focus:text-pink-500">
              <h3 className="text-2xl font-bold">Breathing &rarr;</h3>
              <p className="mt-4 text-xl">Practice mindful breathing exercises.</p>
            </a>
          </Link>

          <Link href="/emotional-log">
            <a className="mt-6 w-96 rounded-xl border p-6 text-left hover:text-pink-500 focus:text-pink-500">
              <h3 className="text-2xl font-bold">Emotional Log &rarr;</h3>
              <p className="mt-4 text-xl">Track and understand your emotions.</p>
            </a>
          </Link>
        </div>
      </main>

      <footer className="flex h-24 w-full items-center justify-center border-t">
        <p>HeartHeals &hearts; - Your Wellness Companion</p>
      </footer>
    </div>
  )
}

export default Home
