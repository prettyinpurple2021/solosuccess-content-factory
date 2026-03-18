"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"
import type { ScheduleButtonProps } from "./types"

interface ThreadCreatorProps {
  ScheduleButton: React.FC<ScheduleButtonProps>
  onBodyChange: (body: string) => void
}

export default function ThreadCreator({ ScheduleButton, onBodyChange }: ThreadCreatorProps) {
  const [threadPosts, setThreadPosts] = useState(["", ""])

  const update = (i: number, val: string) => {
    const updated = threadPosts.map((v, idx) => (idx === i ? val : v))
    setThreadPosts(updated)
    onBodyChange(updated.join("\n---\n"))
  }

  return (
    <>
      <p className="text-sm font-bold text-muted-foreground mb-4">Write each post in your thread. Hook them with #1.</p>
      <div className="space-y-3 mb-4">
        {threadPosts.map((post, i) => (
          <div key={i} className="flex gap-2 items-start">
            <span className="mt-3 text-xs font-black text-muted-foreground w-5 shrink-0">{i + 1}.</span>
            <div className="flex-1 relative">
              <Textarea
                value={post}
                onChange={(e) => update(i, e.target.value)}
                placeholder={i === 0 ? "Hook: start with a bold claim or question..." : `Post ${i + 1}...`}
                className="min-h-[80px] border-2 border-black rounded-xl p-3 text-sm pr-16"
                maxLength={280}
              />
              <span className={`absolute bottom-3 right-3 text-xs font-bold ${post.length >= 280 ? "text-destructive" : post.length >= 240 ? "text-orange-500" : "text-muted-foreground"}`}>
                {post.length}/280
              </span>
            </div>
            {threadPosts.length > 2 && (
              <Button variant="outline" size="icon" className="mt-1 border-2 border-black rounded-xl"
                onClick={() => { const n = threadPosts.filter((_, idx) => idx !== i); setThreadPosts(n); onBodyChange(n.join("\n---\n")) }}
                aria-label={`Remove post ${i + 1}`}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
      <Button variant="outline" className="w-full border-2 border-dashed border-black rounded-xl font-bold flex gap-2 mb-4"
        onClick={() => setThreadPosts((p) => [...p, ""])}>
        <Plus className="h-4 w-4" /> Add Post to Thread
      </Button>
      <ScheduleButton label="Schedule Thread" />
    </>
  )
}
