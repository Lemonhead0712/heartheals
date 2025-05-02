"use client"

import { PageContainer } from "@/components/page-container"
import { HapticDebug } from "@/components/haptic-debug"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export default function HapticDebugPage() {
  const router = useRouter()

  return (
    <PageContainer>
      <div className="max-w-md mx-auto py-8 px-4">
        <Button variant="outline" className="mb-6" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <h1 className="text-2xl font-bold mb-6">Haptic Feedback Debug</h1>
        <HapticDebug />
      </div>
    </PageContainer>
  )
}
