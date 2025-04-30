"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMobile } from "@/hooks/use-mobile"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

export function AppInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const { isIOS, isAndroid } = useMobile()

  useEffect(() => {
    // Check if the app is already installed
    const isAppInstalled = window.matchMedia("(display-mode: standalone)").matches

    if (isAppInstalled) {
      return // Don't show install prompt if already installed
    }

    // For Android/Chrome: Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 76+ from automatically showing the prompt
      e.preventDefault()
      // Stash the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Show our custom install prompt after a delay
      setTimeout(() => setShowPrompt(true), 3000)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // For iOS Safari: Check if it's iOS and not in standalone mode
    if (isIOS && !isAppInstalled) {
      // Show iOS-specific install instructions after a delay
      const hasShownIOSPrompt = localStorage.getItem("hasShownIOSPrompt")

      if (!hasShownIOSPrompt) {
        setTimeout(() => setShowPrompt(true), 3000)
      }
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [isIOS, isAndroid])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // For iOS, we just show instructions
      if (isIOS) {
        // Mark that we've shown the iOS prompt
        localStorage.setItem("hasShownIOSPrompt", "true")
      }
      return
    }

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice

    // We've used the prompt, and can't use it again, so clear it
    setDeferredPrompt(null)

    // Hide our custom prompt regardless of outcome
    setShowPrompt(false)

    // Optionally log the outcome
    console.log(`User ${outcome} the A2HS prompt`)
  }

  const handleDismiss = () => {
    setShowPrompt(false)

    // For iOS, remember that we've shown the prompt
    if (isIOS) {
      localStorage.setItem("hasShownIOSPrompt", "true")
    }
  }

  if (!showPrompt) return null

  return (
    <div className="app-install-banner visible">
      <div className="flex items-center">
        <img src="/icons/icon-72x72.png" alt="HeartHeals App" className="w-10 h-10 mr-3" />
        <div>
          <h3 className="font-medium text-sm">Install HeartHeals App</h3>
          <p className="text-xs text-gray-600">
            {isIOS ? "Tap 'Share' then 'Add to Home Screen'" : "Install for the best experience"}
          </p>
        </div>
      </div>

      <div className="flex items-center">
        {!isIOS && (
          <Button
            variant="default"
            size="sm"
            onClick={handleInstallClick}
            className="mr-2 bg-purple-600 hover:bg-purple-700"
          >
            Install
          </Button>
        )}

        <Button variant="ghost" size="sm" onClick={handleDismiss}>
          <X size={18} />
        </Button>
      </div>
    </div>
  )
}
