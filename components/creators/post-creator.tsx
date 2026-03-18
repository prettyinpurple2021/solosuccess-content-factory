"use client"

import { useState, useRef } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ImageIcon, XCircle } from "lucide-react"
import type { ScheduleButtonProps } from "./types"

const HASHTAG_SUGGESTIONS = [
  "#solofounder", "#buildinpublic", "#contentmarketing", "#solobusiness",
  "#entrepreneurlife", "#smallbusiness", "#creatoreconomy", "#startuplife",
  "#personalbrand", "#marketingtips", "#growthhacking", "#hustle",
]

const CHAR_LIMITS: Record<string, number> = { twitter: 280, instagram: 2200 }

interface PostCreatorProps {
  selectedPlatforms: Record<string, boolean>
  ScheduleButton: React.FC<ScheduleButtonProps>
  onBodyChange: (body: string) => void
}

export default function PostCreator({ selectedPlatforms, ScheduleButton, onBodyChange }: PostCreatorProps) {
  const [postBody, setPostBody] = useState("")
  const [postHashtags, setPostHashtags] = useState("")
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const mediaInputRef = useRef<HTMLInputElement>(null)

  const charLimit = selectedPlatforms.twitter ? CHAR_LIMITS.twitter : CHAR_LIMITS.instagram
  const charCount = postBody.length
  const charPct = charCount / charLimit
  const charColor = charPct >= 1 ? "text-destructive" : charPct >= 0.85 ? "text-orange-500" : "text-muted-foreground"

  const handleChange = (val: string) => {
    setPostBody(val)
    onBodyChange(val)
  }

  return (
    <>
      <div className="relative mb-2">
        <Textarea
          value={postBody}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Write your post here. Keep it punchy — solo founders who ship fast win."
          className={`min-h-[150px] border-2 border-black rounded-xl p-4 text-base resize-none ${charPct >= 1 ? "border-destructive" : ""}`}
          maxLength={charLimit}
        />
        <span className={`absolute bottom-3 right-4 text-xs font-bold ${charColor}`}>
          {charCount}/{charLimit}
        </span>
      </div>

      {mediaPreview && (
        <div className="relative mb-4 rounded-xl overflow-hidden border-2 border-black">
          <img src={mediaPreview} alt="Media preview" className="w-full max-h-64 object-cover" />
          <button
            onClick={() => { setMediaPreview(null); if (mediaInputRef.current) mediaInputRef.current.value = "" }}
            className="absolute top-2 right-2 bg-black text-white rounded-full p-1 hover:opacity-80"
            aria-label="Remove media"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      )}

      <input
        ref={mediaInputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) setMediaPreview(URL.createObjectURL(f))
        }}
      />

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Button variant="outline" className="border-2 border-black rounded-xl font-bold flex gap-2 h-12" onClick={() => mediaInputRef.current?.click()}>
          <ImageIcon className="h-5 w-5" /> Add Media
        </Button>
        <ScheduleButton label="Schedule" />
      </div>

      <Tabs defaultValue="hashtags">
        <TabsList className="bg-secondary border-2 border-black rounded-xl p-1 mb-4 w-full">
          {["hashtags", "filters", "advanced"].map((t) => (
            <TabsTrigger key={t} value={t} className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white font-bold flex-1 capitalize">{t}</TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="hashtags">
          <Textarea
            value={postHashtags}
            onChange={(e) => setPostHashtags(e.target.value)}
            placeholder="#solofounder #buildinpublic #contentmarketing"
            className="min-h-[80px] border-2 border-black rounded-xl p-4"
          />
          <div className="flex flex-wrap gap-2 mt-3">
            {HASHTAG_SUGGESTIONS.map((h) => (
              <button key={h} onClick={() => setPostHashtags((prev) => prev ? `${prev} ${h}` : h)}
                className="text-xs font-bold bg-secondary border-2 border-black rounded-full px-3 py-1 hover:bg-black hover:text-white transition-colors">
                {h}
              </button>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="filters">
          <div className="space-y-4">
            {["Brightness", "Contrast", "Saturation"].map((f) => (
              <div key={f}>
                <Label className="font-bold mb-2 block">{f}</Label>
                <Slider defaultValue={[50]} max={100} step={1} className="py-4" />
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="advanced">
          <div className="space-y-4">
            {["Hide Likes", "Turn Off Comments", "Add Alt Text"].map((s) => (
              <div key={s} className="flex items-center justify-between">
                <Label className="font-bold">{s}</Label>
                <Switch />
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </>
  )
}
