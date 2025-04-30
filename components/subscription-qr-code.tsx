"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Download, Share2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type SubscriptionQRCodeProps = {
  imageUrl: string
  title?: string
  description?: string
}

export function SubscriptionQRCode({
  imageUrl,
  title = "Scan to subscribe",
  description = "Scan this QR code with your phone camera to subscribe to HeartHeals Premium",
}: SubscriptionQRCodeProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleDownload = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "heartheals-subscription-qr.png"
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "QR Code Downloaded",
        description: "The QR code has been downloaded successfully.",
        variant: "default",
      })
    } catch (error) {
      console.error("Error downloading QR code:", error)
      toast({
        title: "Download Failed",
        description: "Failed to download the QR code. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        setIsLoading(true)
        const response = await fetch(imageUrl)
        const blob = await response.blob()
        const file = new File([blob], "heartheals-subscription-qr.png", { type: "image/png" })

        await navigator.share({
          title: "HeartHeals Premium Subscription",
          text: "Scan this QR code to subscribe to HeartHeals Premium",
          files: [file],
        })

        toast({
          title: "QR Code Shared",
          description: "The QR code has been shared successfully.",
          variant: "default",
        })
      } catch (error) {
        console.error("Error sharing QR code:", error)
        if (error.name !== "AbortError") {
          toast({
            title: "Share Failed",
            description: "Failed to share the QR code. Please try again.",
            variant: "destructive",
          })
        }
      } finally {
        setIsLoading(false)
      }
    } else {
      toast({
        title: "Sharing Not Supported",
        description: "Your browser doesn't support sharing. Please download the QR code instead.",
        variant: "default",
      })
    }
  }

  return (
    <Card className="border-purple-200 bg-white/90 backdrop-blur-sm shadow-md overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-purple-800">{title}</CardTitle>
        <CardDescription className="text-purple-600">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center p-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt="Subscription QR Code"
            width={250}
            height={250}
            className="rounded-md"
            priority
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-center gap-4 pt-0 pb-4">
        <Button
          variant="outline"
          className="border-purple-200 text-purple-700 hover:bg-purple-50"
          onClick={handleDownload}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
          Download
        </Button>
        {navigator.share && (
          <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleShare} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Share2 className="h-4 w-4 mr-2" />}
            Share
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
