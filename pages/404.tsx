import Link from "next/link"

export default function Custom404() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="mb-6">Sorry, the page you are looking for does not exist.</p>
      <Link href="/">
        <a className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors">Return Home</a>
      </Link>
    </div>
  )
}
