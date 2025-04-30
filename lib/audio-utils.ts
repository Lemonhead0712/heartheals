// Audio utility functions for the breathing tool

// Create audio elements with proper error handling
export function createAudio(src: string): HTMLAudioElement | null {
  if (typeof window === "undefined") return null

  try {
    const audio = new Audio(src)
    audio.preload = "auto"
    return audio
  } catch (error) {
    console.error(`Error creating audio for ${src}:`, error)
    return null
  }
}

// Play audio with error handling
export function playAudio(audio: HTMLAudioElement | null): void {
  if (!audio) return

  try {
    // Reset the audio to the beginning
    audio.currentTime = 0

    // Create a promise to play the audio
    const playPromise = audio.play()

    // Handle potential play() promise rejection
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.error("Audio playback failed:", error)
      })
    }
  } catch (error) {
    console.error("Error playing audio:", error)
  }
}

// Create a beep sound using the Web Audio API (works without external files)
export function createBeepSound(frequency = 800, duration = 200, volume = 0.5): () => void {
  return () => {
    if (typeof window === "undefined") return

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.type = "sine"
      oscillator.frequency.value = frequency
      gainNode.gain.value = volume

      oscillator.start()

      // Stop the beep after the specified duration
      setTimeout(() => {
        oscillator.stop()
        // Clean up
        setTimeout(() => {
          oscillator.disconnect()
          gainNode.disconnect()
        }, 100)
      }, duration)
    } catch (error) {
      console.error("Error creating beep sound:", error)
    }
  }
}

// Create a soft tone using the Web Audio API
export function createSoftTone(frequency = 400, duration = 300, volume = 0.3): () => void {
  return () => {
    if (typeof window === "undefined") return

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.type = "sine"
      oscillator.frequency.value = frequency

      // Create a gentle fade in and out
      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.1)
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration / 1000)

      oscillator.start()

      // Stop the tone after the specified duration
      setTimeout(() => {
        oscillator.stop()
        // Clean up
        setTimeout(() => {
          oscillator.disconnect()
          gainNode.disconnect()
        }, 100)
      }, duration)
    } catch (error) {
      console.error("Error creating soft tone:", error)
    }
  }
}

// Speak a number using the Web Speech API (works without external files)
export function speakNumber(number: number): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return

  try {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(number.toString())
    utterance.rate = 0.8 // Slightly slower
    utterance.pitch = 1
    utterance.volume = 0.8

    window.speechSynthesis.speak(utterance)
  } catch (error) {
    console.error("Error speaking number:", error)
  }
}
