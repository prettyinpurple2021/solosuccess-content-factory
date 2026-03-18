"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { BarChart2, Plus, Trash2 } from "lucide-react"
import type { ScheduleButtonProps } from "./types"

interface SurveyCreatorProps {
  ScheduleButton: React.FC<ScheduleButtonProps>
  onBodyChange: (body: string) => void
}

export default function SurveyCreator({ ScheduleButton, onBodyChange }: SurveyCreatorProps) {
  const [surveyQuestion, setSurveyQuestion] = useState("")
  const [surveyOptions, setSurveyOptions] = useState(["", ""])
  const [surveyMultiple, setSurveyMultiple] = useState(false)

  return (
    <>
      <div className="space-y-4 mb-4">
        <div>
          <Label className="font-bold mb-2 block flex items-center gap-2"><BarChart2 className="h-4 w-4" /> Survey Question</Label>
          <Textarea value={surveyQuestion}
            onChange={(e) => { setSurveyQuestion(e.target.value); onBodyChange(e.target.value) }}
            placeholder="What's your biggest content challenge as a solo founder?"
            className="min-h-[80px] border-2 border-black rounded-xl p-4 text-base" />
        </div>
        <div>
          <Label className="font-bold mb-2 block">Answer Options <span className="text-muted-foreground font-normal text-xs">(2–6)</span></Label>
          <div className="space-y-2">
            {surveyOptions.map((opt, i) => (
              <div key={i} className="flex gap-2">
                <span className="mt-2.5 text-xs font-black text-muted-foreground w-4 shrink-0">{String.fromCharCode(65 + i)}.</span>
                <Input value={opt} onChange={(e) => setSurveyOptions((o) => o.map((v, idx) => (idx === i ? e.target.value : v)))}
                  placeholder={`Option ${String.fromCharCode(65 + i)}`} className="border-2 border-black rounded-xl h-10 flex-1" />
                {surveyOptions.length > 2 && (
                  <Button variant="outline" size="icon" className="border-2 border-black rounded-xl"
                    onClick={() => setSurveyOptions((o) => o.filter((_, idx) => idx !== i))}
                    aria-label={`Remove option ${String.fromCharCode(65 + i)}`}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          {surveyOptions.length < 6 && (
            <Button variant="outline" className="mt-2 border-2 border-dashed border-black rounded-xl font-bold flex gap-2 w-full"
              onClick={() => setSurveyOptions((o) => [...o, ""])}>
              <Plus className="h-4 w-4" /> Add Option
            </Button>
          )}
        </div>
        <div className="flex items-center justify-between p-3 border-2 border-black rounded-xl">
          <Label className="font-bold">Allow multiple answers</Label>
          <Switch checked={surveyMultiple} onCheckedChange={setSurveyMultiple} />
        </div>
      </div>
      <ScheduleButton label="Schedule Survey" />
    </>
  )
}
