"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import type { ScheduleButtonProps } from "./types"

const STORY_ACTIONS = ["Add Sticker", "Add Text Overlay", "Add Music", "Add Poll", "Add Link", "Add Countdown"]

interface StoryCreatorProps {
  ScheduleButton: React.FC<ScheduleButtonProps>
  onBodyChange: (body: string) => void
}

export default function StoryCreator({ ScheduleButton, onBodyChange }: StoryCreatorProps) {
  const [storyCaption, setStoryCaption] = useState("")

  return (
    <>
      <Textarea value={storyCaption}
        onChange={(e) => { setStoryCaption(e.target.value); onBodyChange(e.target.value) }}
        placeholder="What story moment are you sharing today?"
        className="min-h-[120px] border-2 border-black rounded-xl p-4 text-base mb-4" />
      <div className="grid grid-cols-2 gap-3 mb-4">
        {STORY_ACTIONS.map((action) => (
          <Button key={action} variant="outline" onClick={() => toast({ title: `${action} added` })}
            className="border-2 border-black rounded-xl font-bold text-sm h-11">{action}</Button>
        ))}
      </div>
      <ScheduleButton label="Schedule Story" />
    </>
  )
}
