"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Mail, Send } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import type { ScheduleButtonProps } from "./types"

interface NewsletterCreatorProps {
  ScheduleButton: React.FC<ScheduleButtonProps>
  onBodyChange: (body: string) => void
}

export default function NewsletterCreator({ ScheduleButton, onBodyChange }: NewsletterCreatorProps) {
  const [nlSubject, setNlSubject] = useState("")
  const [nlPreview, setNlPreview] = useState("")
  const [nlBody, setNlBody] = useState("")

  return (
    <>
      <div className="space-y-4 mb-4">
        <div>
          <Label className="font-bold mb-2 block flex items-center gap-2"><Mail className="h-4 w-4" /> Subject Line</Label>
          <Input value={nlSubject} onChange={(e) => setNlSubject(e.target.value)} placeholder="The subject line that gets opens..." className="border-2 border-black rounded-xl h-11" />
        </div>
        <div>
          <Label className="font-bold mb-2 block">Preview Text</Label>
          <Input value={nlPreview} onChange={(e) => setNlPreview(e.target.value)} placeholder="One line preview shown in inbox..." className="border-2 border-black rounded-xl h-11" />
        </div>
        <div>
          <Label className="font-bold mb-2 block">Body</Label>
          <Textarea value={nlBody} onChange={(e) => { setNlBody(e.target.value); onBodyChange(e.target.value) }}
            placeholder="Start with a hook. Your subscribers opened this for a reason."
            className="min-h-[180px] border-2 border-black rounded-xl p-4 text-base" />
          <p className="text-xs text-muted-foreground mt-1 font-medium">{nlBody.split(/\s+/).filter(Boolean).length} words</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <ScheduleButton label="Schedule Send" />
        <Button variant="outline" className="border-2 border-black rounded-xl font-bold flex gap-2 h-12"
          onClick={() => {
            if (!nlSubject.trim()) { toast({ title: "Add a subject line first.", variant: "destructive" }); return }
            toast({ title: "Test email queued", description: "A preview has been sent to your account email." })
          }}>
          <Send className="h-5 w-5" /> Send Test
        </Button>
      </div>
    </>
  )
}
