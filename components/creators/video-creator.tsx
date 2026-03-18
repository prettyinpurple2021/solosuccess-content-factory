"use client"

import { useState, useRef } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ImageIcon, XCircle } from "lucide-react"
import type { ScheduleButtonProps } from "./types"

interface VideoCreatorProps {
  ScheduleButton: React.FC<ScheduleButtonProps>
  onBodyChange: (body: string) => void
}

export default function VideoCreator({ ScheduleButton, onBodyChange }: VideoCreatorProps) {
  const [videoScript, setVideoScript] = useState("")
  const [videoCaption, setVideoCaption] = useState("")
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const thumbInputRef = useRef<HTMLInputElement>(null)

  return (
    <>
      <div className="space-y-4 mb-4">
        <div>
          <Label className="font-bold mb-2 block">Video Concept / Script</Label>
          <Textarea value={videoScript} onChange={(e) => { setVideoScript(e.target.value); onBodyChange(e.target.value) }}
            placeholder="Describe your short-form video concept or write a script outline..."
            className="min-h-[120px] border-2 border-black rounded-xl p-4 text-base" />
        </div>
        <div>
          <Label className="font-bold mb-2 block">Caption / Description</Label>
          <div className="relative">
            <Textarea value={videoCaption} onChange={(e) => setVideoCaption(e.target.value)}
              placeholder="Caption for TikTok, Reels, Shorts..." className="min-h-[80px] border-2 border-black rounded-xl p-4 pr-16" maxLength={2200} />
            <span className={`absolute bottom-3 right-4 text-xs font-bold ${videoCaption.length >= 2200 ? "text-destructive" : "text-muted-foreground"}`}>
              {videoCaption.length}/2200
            </span>
          </div>
        </div>
        <div>
          <Label className="font-bold mb-2 block">Thumbnail</Label>
          {thumbnailPreview ? (
            <div className="relative rounded-xl overflow-hidden border-2 border-black">
              <img src={thumbnailPreview} alt="Thumbnail preview" className="w-full max-h-48 object-cover" />
              <button onClick={() => { setThumbnailPreview(null); if (thumbInputRef.current) thumbInputRef.current.value = "" }}
                className="absolute top-2 right-2 bg-black text-white rounded-full p-1" aria-label="Remove thumbnail">
                <XCircle className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-black rounded-xl p-8 text-center cursor-pointer hover:bg-muted transition-colors"
              onClick={() => thumbInputRef.current?.click()}>
              <ImageIcon className="mx-auto h-8 w-8 mb-2 opacity-40" />
              <p className="text-sm font-bold">Drop thumbnail or <span className="underline">browse</span></p>
            </div>
          )}
          <input ref={thumbInputRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) setThumbnailPreview(URL.createObjectURL(f)) }} />
        </div>
      </div>
      <ScheduleButton label="Schedule Video" />
    </>
  )
}
