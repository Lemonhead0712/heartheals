import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 text-center">
      <h2 className="text-3xl font-bold mb-4 font-playfair">Page Not Found</h2>
      <p className="text-lg mb-8 max-w-md">Sorry, the page you are looking for doesn't exist or has been moved.</p>
      <Link href="/">
        <Button size="lg" className="bg-pink-600 hover:bg-pink-700">
          Return to Home
        </Button>
      </Link>
    </div>
  )
}
