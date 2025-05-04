import type { NextPage } from "next"
import Head from "next/head"
import Link from "next/link"

const ProfilePage: NextPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2 bg-gradient-to-br from-pink-50 to-blue-50">
      <Head>
        <title>Profile | HeartHeals</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex w-full flex-1 flex-col items-center justify-center px-4 sm:px-20 text-center">
        <h1 className="text-4xl font-bold text-pink-600 mb-6">Your Profile</h1>

        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full mb-8">
          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl text-pink-500">👤</span>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">User Profile</h2>
            <p className="text-gray-500">user@example.com</p>
          </div>

          <div className="space-y-4 text-left">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">Demo User</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Member Since</p>
              <p className="font-medium">January 2023</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Subscription</p>
              <p className="font-medium">Free Plan</p>
            </div>
          </div>
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

export default ProfilePage
