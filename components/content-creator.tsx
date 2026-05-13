"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { toast } from "sonner"
import {
  Instagram, Linkedin, Twitter, Youtube,
  CalendarIcon, Send, ChevronDown,
  Loader2, CheckCircle2, XCircle,
} from "lucide-react"
import { saveDraft, scheduleItem } from "@/lib/hooks/use-storage"
import type { PlatformKey } from "@/lib/storage"
import { format } from "date-fns"
import type { ScheduleButtonProps } from "@/components/creators/types"
import AiAssistButton from "@/components/ai-assist-button"
import DraftHistory from "@/components/draft-history"

const PostCreator = dynamic(() => import("@/components/creators/post-creator"), { ssr: false })
const ThreadCreator = dynamic(() => import("@/components/creators/thread-creator"), { ssr: false })
const NewsletterCreator = dynamic(() => import("@/components/creators/newsletter-creator"), { ssr: false })
const VideoCreator = dynamic(() => import("@/components/creators/video-creator"), { ssr: false })
const StoryCreator = dynamic(() => import("@/components/creators/story-creator"), { ssr: false })
const SurveyCreator = dynamic(() => import("@/components/creators/survey-creator"), { ssr: false })
const BlogCreator = dynamic(() => import("@/components/creators/blog-creator"), { ssr: false })

export type ContentType = "post" | "thread" | "newsletter" | "video" | "story" | "survey" | "blog"

interface ContentCreatorProps {
  type: ContentType
  scheduledDate?: Date
}

const PLATFORM_DEFS = [
  { key: "instagram" as PlatformKey, icon: <Instagram className="h-5 w-5" />, label: "Instagram" },
  { key: "twitter" as PlatformKey, icon: <Twitter className="h-5 w-5" />, label: "Twitter / X" },
  { key: "linkedin" as PlatformKey, icon: <Linkedin className="h-5 w-5" />, label: "LinkedIn" },
  { key: "youtube" as PlatformKey, icon: <Youtube className="h-5 w-5" />, label: "YouTube" },
]

type PublishStatus = "idle" | "confirming" | "publishing" | "done"
type PlatformResult = { key: PlatformKey; label: string; success: boolean }

export default function ContentCreator({ type, scheduledDate }: ContentCreatorProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<Record<PlatformKey, boolean>>({
    instagram: true, twitter: true, linkedin: false, youtube: false, tiktok: false, facebook: false, bluesky: false, reddit: false, blog: false, myapp: false,
  })
  const togglePlatform = (key: PlatformKey) =>
    setSelectedPlatforms((p) => ({ ...p, [key]: !p[key] }))

  const [body, setBody] = useState("")
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(scheduledDate)
  const [scheduleTime, setScheduleTime] = useState("09:00")
  const [publishStatus, setPublishStatus] = useState<PublishStatus>("idle")
  const [publishResults, setPublishResults] = useState<PlatformResult[]>([])

  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (!body.trim()) return
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    autosaveTimer.current = setTimeout(() => {
      saveDraft({
        type,
        body,
        platforms: Object.entries(selectedPlatforms).filter(([, v]) => v).map(([k]) => k as PlatformKey),
      })
      toast.success("Draft saved", { description: "Your content has been autosaved.", duration: 1500 })
    }, 1500)
    return () => { if (autosaveTimer.current) clearTimeout(autosaveTimer.current) }
  }, [body, type, selectedPlatforms])

  const handleSchedule = useCallback(async () => {
    if (!scheduleDate) return
    const [h, m] = scheduleTime.split(":").map(Number)
    const dt = new Date(scheduleDate)
    dt.setHours(h, m, 0, 0)
    if (!body.trim()) {
      toast.error("Add some content before scheduling.")
      return
    }
    const platforms = Object.entries(selectedPlatforms).filter(([, v]) => v).map(([k]) => k as PlatformKey)
    try {
      const draft = await saveDraft({ type, body, platforms })
      await scheduleItem({ draftId: draft.id, type, title: body.slice(0, 60), scheduledFor: dt.toISOString(), platforms })
      toast.success("Scheduled!", { description: `Set for ${format(dt, "MMM d, yyyy 'at' h:mm a")}` })
      setScheduleOpen(false)
    } catch (error) {
      toast.error("Failed to schedule", { description: "Please try again." })
    }
  }, [scheduleDate, scheduleTime, body, type, selectedPlatforms])

  const handlePublish = useCallback(async () => {
    if (publishStatus === "idle") { setPublishStatus("confirming"); return }
    if (publishStatus === "confirming") {
      const targets = Object.entries(selectedPlatforms).filter(([, v]) => v).map(([k]) => k as PlatformKey)
      if (targets.length === 0) {
        toast.error("Select at least one platform")
        setPublishStatus("idle")
        return
      }
      if (!body.trim()) {
        toast.error("Write some content before publishing.")
        setPublishStatus("idle")
        return
      }
      setPublishStatus("publishing")

      try {
        const res = await fetch("/api/publish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ platforms: targets, body, contentType: type }),
        })
        const data = await res.json()
        const apiResults: PlatformResult[] = (data.results ?? []).map(
          (r: { platform: PlatformKey; success: boolean; error?: string }) => ({
            key: r.platform,
            label: PLATFORM_DEFS.find((p) => p.key === r.platform)?.label ?? r.platform,
            success: r.success,
            error: r.error,
          })
        )
        // Fill in any platforms not returned (e.g. not supported yet)
        for (const t of targets) {
          if (!apiResults.find((r) => r.key === t)) {
            apiResults.push({ key: t, label: PLATFORM_DEFS.find((p) => p.key === t)?.label ?? t, success: false })
          }
        }
        setPublishResults(apiResults)
        setPublishStatus("done")
        const successes = apiResults.filter((r) => r.success).length
        if (successes > 0) toast.success(`Published to ${successes} platform${successes > 1 ? "s" : ""}!`)
        else toast.error("Publishing failed", { description: "Make sure your platforms are connected." })
      } catch {
        toast.error("Network error — could not reach publish API")
        setPublishStatus("done")
      }
    }
  }, [publishStatus, selectedPlatforms, body, type])

  const ScheduleButton = useCallback(({ label }: ScheduleButtonProps) => (
    <Popover open={scheduleOpen} onOpenChange={setScheduleOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="border-2 border-black rounded-xl font-bold flex gap-2 h-12">
          <CalendarIcon className="h-5 w-5" />
          {scheduleDate ? format(scheduleDate, "MMM d") : label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 border-4 border-black rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]" align="start">
        <Calendar mode="single" selected={scheduleDate} onSelect={setScheduleDate} disabled={(d) => d < new Date()} initialFocus />
        <div className="p-4 border-t-2 border-black flex gap-3 items-center">
          <Label className="font-bold whitespace-nowrap">Time</Label>
          <Input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} className="border-2 border-black rounded-lg h-9 flex-1" />
          <Button onClick={handleSchedule} disabled={!scheduleDate} className="bg-black text-white border-2 border-black rounded-lg font-bold h-9 px-4">Confirm</Button>
        </div>
      </PopoverContent>
    </Popover>
  ), [scheduleOpen, scheduleDate, scheduleTime, handleSchedule])

  return (
    <div className="grid lg:grid-cols-[1fr_280px] gap-6">
      <Card className="border-4 border-black rounded-xl p-4 sm:p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-card">
        {type === "post" && <PostCreator selectedPlatforms={selectedPlatforms} ScheduleButton={ScheduleButton} onBodyChange={setBody} />}
        {type === "thread" && <ThreadCreator ScheduleButton={ScheduleButton} onBodyChange={setBody} />}
        {type === "newsletter" && <NewsletterCreator ScheduleButton={ScheduleButton} onBodyChange={setBody} />}
        {type === "video" && <VideoCreator ScheduleButton={ScheduleButton} onBodyChange={setBody} />}
        {type === "story" && <StoryCreator ScheduleButton={ScheduleButton} onBodyChange={setBody} />}
        {type === "survey" && <SurveyCreator ScheduleButton={ScheduleButton} onBodyChange={setBody} />}
        {type === "blog" && <BlogCreator ScheduleButton={ScheduleButton} onBodyChange={setBody} />}

        <div className="mt-6 lg:hidden">
          <Collapsible>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-black text-white rounded-xl font-bold">
              <span>Platforms</span>
              <ChevronDown className="h-5 w-5" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-3 p-3 border-2 border-black rounded-xl">
              {PLATFORM_DEFS.map((p) => (
                <div key={p.key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">{p.icon}<Label className="font-bold">{p.label}</Label></div>
                  <Switch checked={selectedPlatforms[p.key]} onCheckedChange={() => togglePlatform(p.key)} />
                </div>
              ))}
              <Button onClick={handlePublish} className="w-full mt-2 h-12 bg-brand-gradient-metallic text-white rounded-xl border-2 border-black font-bold text-base shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2">
                <Send className="h-5 w-5" /> Publish Now
              </Button>
              <AiAssistButton contentType={type} existingContent={body} onResult={setBody} className="w-full" />
            </CollapsibleContent>
          </Collapsible>
        </div>
      </Card>

      <div className="hidden lg:flex flex-col gap-6">
        <Card className="border-4 border-black rounded-xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-card">
          <h3 className="font-black text-sm tracking-widest uppercase text-muted-foreground mb-4">Platforms</h3>
          <div className="space-y-4">
            {PLATFORM_DEFS.map((p) => (
              <div key={p.key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">{p.icon}<Label className="font-bold">{p.label}</Label></div>
                <Switch checked={selectedPlatforms[p.key]} onCheckedChange={() => togglePlatform(p.key)} />
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground font-medium mt-4">Autosaving draft as you type.</p>
          <AiAssistButton
            contentType={type}
            existingContent={body}
            onResult={setBody}
            className="w-full mt-3"
          />
        </Card>

        <DraftHistory currentType={type} onRestore={(draft) => { setBody(draft.body); toast.success("Draft restored") }} />

        <Button onClick={handlePublish}
          className="w-full h-14 bg-brand-gradient-metallic text-white rounded-xl border-2 border-black font-bold text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2">
          <Send className="h-5 w-5" />
          {publishStatus === "idle" ? "Publish Now" : publishStatus === "confirming" ? "Confirm Publish?" : publishStatus === "publishing" ? "Publishing..." : "Published!"}
        </Button>
      </div>

      <Dialog open={publishStatus === "confirming" || publishStatus === "publishing" || publishStatus === "done"}
        onOpenChange={(o) => { if (!o) { setPublishStatus("idle"); setPublishResults([]) } }}>
        <DialogContent className="border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-black text-xl">
              {publishStatus === "confirming" ? "Ready to publish?" : publishStatus === "publishing" ? "Publishing..." : "Publish complete"}
            </DialogTitle>
          </DialogHeader>

          {publishStatus === "confirming" && (
            <div className="space-y-4">
              <p className="text-sm font-medium text-muted-foreground">This will publish to all selected platforms immediately.</p>
              <div className="space-y-2">
                {PLATFORM_DEFS.filter((p) => selectedPlatforms[p.key]).map((p) => (
                  <div key={p.key} className="flex items-center gap-2 p-2 border-2 border-black rounded-xl bg-secondary">
                    {p.icon}<span className="font-bold text-sm">{p.label}</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="border-2 border-black rounded-xl font-bold" onClick={() => setPublishStatus("idle")}>Cancel</Button>
                <Button onClick={handlePublish} className="bg-black text-white border-2 border-black rounded-xl font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">Publish</Button>
              </div>
            </div>
          )}

          {(publishStatus === "publishing" || publishStatus === "done") && (
            <div className="space-y-3">
              {PLATFORM_DEFS.filter((p) => selectedPlatforms[p.key]).map((p) => {
                const result = publishResults.find((r) => r.key === p.key)
                return (
                  <div key={p.key} className="flex items-center gap-3 p-3 border-2 border-black rounded-xl">
                    {p.icon}
                    <span className="font-bold text-sm flex-1">{p.label}</span>
                    {!result ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : result.success ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-bold text-orange-600">
                        <XCircle className="h-4 w-4" /> Not connected
                      </span>
                    )}
                  </div>
                )
              })}
              {publishStatus === "done" && (
                <div className="pt-2">
                  {publishResults.some((r) => !r.success) && (
                    <p className="text-xs font-medium text-muted-foreground mb-3">Connect accounts from the dashboard to enable publishing.</p>
                  )}
                  <Button className="w-full bg-black text-white border-2 border-black rounded-xl font-bold"
                    onClick={() => { setPublishStatus("idle"); setPublishResults([]) }}>
                    Done
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
