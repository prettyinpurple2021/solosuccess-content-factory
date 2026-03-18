"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Wand2, Loader2, Sparkles } from "lucide-react"
import { toast } from "sonner"

interface AiAssistButtonProps {
  contentType: string
  existingContent?: string
  onResult: (text: string) => void
  className?: string
}

export default function AiAssistButton({ contentType, existingContent, onResult, className }: AiAssistButtonProps) {
  const [open, setOpen] = useState(false)
  const [topic, setTopic] = useState("")
  const [streaming, setStreaming] = useState(false)
  const [preview, setPreview] = useState("")

  const handleGenerate = async () => {
    if (streaming) return
    setStreaming(true)
    setPreview("")

    try {
      const res = await fetch("/api/ai-write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: contentType, topic, existingContent }),
      })

      if (!res.ok || !res.body) {
        throw new Error("AI generation failed")
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""
      let full = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          const trimmed = line.trim()
          if (trimmed.startsWith("0:")) {
            try {
              const text = JSON.parse(trimmed.slice(2))
              full += text
              setPreview(full)
            } catch {
              // skip malformed chunks
            }
          }
        }
      }

      if (full) {
        setPreview(full)
      }
    } catch (err) {
      toast.error("AI generation failed. Please try again.")
      setStreaming(false)
      return
    }

    setStreaming(false)
  }

  const handleUse = () => {
    onResult(preview)
    setOpen(false)
    setPreview("")
    setTopic("")
    toast.success("AI content applied!")
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className={`border-2 border-black rounded-xl font-bold flex gap-2 bg-brand-gradient-metallic text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:opacity-90 ${className ?? ""}`}
      >
        <Sparkles className="h-4 w-4" />
        Write with AI
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-black text-xl flex items-center gap-2">
              <Wand2 className="h-5 w-5" /> AI Writing Assistant
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="font-bold mb-2 block">
                Topic or angle <span className="text-muted-foreground font-normal text-xs">(optional)</span>
              </Label>
              <Input
                placeholder={`e.g. "How I got my first 100 customers without ads"`}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleGenerate() }}
                className="border-2 border-black rounded-xl h-11"
                disabled={streaming}
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={streaming}
              className="w-full h-12 bg-black text-white border-2 border-black rounded-xl font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex gap-2"
            >
              {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {streaming ? "Generating..." : preview ? "Regenerate" : `Generate ${contentType}`}
            </Button>

            {(preview || streaming) && (
              <div className="border-2 border-black rounded-xl p-4 bg-secondary min-h-[120px] max-h-[300px] overflow-auto">
                <pre className="text-sm font-sans whitespace-pre-wrap leading-relaxed">
                  {preview}
                  {streaming && <span className="inline-block w-2 h-4 bg-foreground animate-pulse ml-0.5 align-middle" />}
                </pre>
              </div>
            )}

            {preview && !streaming && (
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="border-2 border-black rounded-xl font-bold"
                  onClick={() => { setPreview(""); setTopic("") }}
                >
                  Clear
                </Button>
                <Button
                  onClick={handleUse}
                  className="bg-black text-white border-2 border-black rounded-xl font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                >
                  Use This
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
