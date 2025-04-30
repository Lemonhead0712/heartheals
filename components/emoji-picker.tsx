"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"

type EmojiPickerProps = {
  selectedEmoji: string
  onEmojiSelect: (emoji: string) => void
}

export function EmojiPicker({ selectedEmoji, onEmojiSelect }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Emoji categories
  const happyEmojis = ["😊", "😃", "😄", "😁", "🥰", "😍", "🤗", "😌", "😇", "🥳"]
  const sadEmojis = ["😔", "😢", "😭", "😞", "😟", "🥺", "😥", "😓", "😪", "😩"]
  const angryEmojis = ["😠", "😡", "🤬", "😤", "😒", "😑", "🙄", "😬", "😕", "😖"]
  const fearEmojis = ["😨", "😰", "😱", "😳", "😬", "🤯", "😵", "🥶", "😧", "😮"]
  const otherEmojis = ["😐", "🤔", "🤨", "😴", "😷", "🤒", "🤕", "🤢", "🤮", "🥴"]

  const handleEmojiSelect = (emoji: string) => {
    onEmojiSelect(emoji)
    setIsOpen(false)
  }

  return (
    <div className="flex flex-col items-center">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="h-20 w-20 rounded-full border-2 border-pink-200 bg-white hover:bg-pink-50 hover:border-pink-300 transition-all"
          >
            <motion.span
              className="text-4xl"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {selectedEmoji}
            </motion.span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="center">
          <Tabs defaultValue="happy">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="happy" className="text-lg">
                😊
              </TabsTrigger>
              <TabsTrigger value="sad" className="text-lg">
                😢
              </TabsTrigger>
              <TabsTrigger value="angry" className="text-lg">
                😠
              </TabsTrigger>
              <TabsTrigger value="fear" className="text-lg">
                😨
              </TabsTrigger>
              <TabsTrigger value="other" className="text-lg">
                🤔
              </TabsTrigger>
            </TabsList>
            <TabsContent value="happy" className="p-4">
              <div className="grid grid-cols-5 gap-2">
                {happyEmojis.map((emoji) => (
                  <Button
                    key={emoji}
                    variant="ghost"
                    className="text-2xl h-10 hover:bg-pink-50"
                    onClick={() => handleEmojiSelect(emoji)}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="sad" className="p-4">
              <div className="grid grid-cols-5 gap-2">
                {sadEmojis.map((emoji) => (
                  <Button
                    key={emoji}
                    variant="ghost"
                    className="text-2xl h-10 hover:bg-pink-50"
                    onClick={() => handleEmojiSelect(emoji)}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="angry" className="p-4">
              <div className="grid grid-cols-5 gap-2">
                {angryEmojis.map((emoji) => (
                  <Button
                    key={emoji}
                    variant="ghost"
                    className="text-2xl h-10 hover:bg-pink-50"
                    onClick={() => handleEmojiSelect(emoji)}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="fear" className="p-4">
              <div className="grid grid-cols-5 gap-2">
                {fearEmojis.map((emoji) => (
                  <Button
                    key={emoji}
                    variant="ghost"
                    className="text-2xl h-10 hover:bg-pink-50"
                    onClick={() => handleEmojiSelect(emoji)}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="other" className="p-4">
              <div className="grid grid-cols-5 gap-2">
                {otherEmojis.map((emoji) => (
                  <Button
                    key={emoji}
                    variant="ghost"
                    className="text-2xl h-10 hover:bg-pink-50"
                    onClick={() => handleEmojiSelect(emoji)}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </PopoverContent>
      </Popover>
      <p className="text-sm text-pink-600 mt-2">Click to select an emoji</p>
    </div>
  )
}
