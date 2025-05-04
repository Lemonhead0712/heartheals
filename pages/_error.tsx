import type { NextPageContext } from "next"
import Link from "next/link"

function Error({ statusCode }: { statusCode: number }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-4xl font-bold mb-4">
        {statusCode ? `An error ${statusCode} occurred on server` : "An error occurred on client"}
      </h1>
      <p className="mb-6">We apologize for the inconvenience.</p>
      <Link href="/">
        <a className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors">Return Home</a>
      </Link>
    </div>
  )
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default Error
