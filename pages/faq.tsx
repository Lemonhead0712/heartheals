import type { NextPage } from "next"
import Head from "next/head"
import Link from "next/link"

const FAQPage: NextPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2 bg-gradient-to-br from-pink-50 to-blue-50">
      <Head>
        <title>FAQ | HeartHeals</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex w-full flex-1 flex-col items-center justify-center px-4 sm:px-20">
        <h1 className="text-4xl font-bold text-pink-600 mb-6">Frequently Asked Questions</h1>

        <div className="max-w-2xl w-full">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-pink-600 mb-2">What is HeartHeals♥?</h3>
            <p className="text-gray-700">
              HeartHeals♥ is a wellness application designed to help you track emotions, practice breathing exercises,
              and improve your mental wellbeing.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-pink-600 mb-2">How do breathing exercises help?</h3>
            <p className="text-gray-700">
              Breathing exercises activate your parasympathetic nervous system, which helps reduce stress, lower blood
              pressure, and promote a sense of calm and relaxation.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-pink-600 mb-2">How often should I log my emotions?</h3>
            <p className="text-gray-700">
              For best results, try to log your emotions at least once daily. Regular tracking helps you identify
              patterns and triggers in your emotional responses.
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold text-pink-600 mb-2">Is my data private?</h3>
            <p className="text-gray-700">
              Yes, your privacy is important to us. All your emotional logs and personal data are securely stored and
              not shared with third parties.
            </p>
          </div>

          <div className="text-center">
            <Link href="/">
              <a className="px-6 py-3 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors">
                Return Home
              </a>
            </Link>
          </div>
        </div>
      </main>

      <footer className="flex h-24 w-full items-center justify-center border-t">
        <p className="text-gray-600">HeartHeals♥ - Your Wellness Companion</p>
      </footer>
    </div>
  )
}

export default FAQPage
