"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import {
  Instagram, Linkedin, Twitter, Youtube, ImageIcon, CalendarIcon, Send,
  ChevronDown, Plus, Trash2, Mail, BarChart2, BookOpen, Tag,
  Loader2, CheckCircle2, XCircle, Clock,
} from "lucide-react"
import { saveDraft, scheduleItem, getConnectedPlatforms, type PlatformKey } from "@/lib/storage"
import { format } from "date-fns"

type ContentType = "post" | "thread" | "newsletter" | "video" | "story" | "survey" | "blog"

interface ContentCreatorProps {
  type: ContentType
  scheduledDate?: Date
}

const CHAR_LIMITS: Record<string, number> = {
  twitter: 280,
  instagram: 2200,
}

const HASHTAG_SUGGESTIONS = [
  "#solofounder", "#buildinpublic", "#contentmarketing", "#solobusiness",
  "#entrepreneurlife", "#smallbusiness", "#creatoreconomy", "#startuplife",
  "#personalbrand", "#marketingtips", "#growthhacking", "#hustle",
]

const PLATFORM_DEFS = [
  { key: "instagram" as PlatformKey, icon: <Instagram className="h-5 w-5" />, label: "Instagram" },
  { key: "twitter" as PlatformKey, icon: <Twitter className="h-5 w-5" />, label: "Twitter / X" },
  { key: "linkedin" as PlatformKey, icon: <Linkedin className="h-5 w-5" />, label: "LinkedIn" },
  { key: "youtube" as PlatformKey, icon: <Youtube className="h-5 w-5" />, label: "YouTube" },
]

type PublishStatus = "idle" | "confirming" | "publishing" | "done"
type PlatformResult = { key: PlatformKey; label: string; success: boolean }

export default function ContentCreator({ type, scheduledDate }: ContentCreatorProps) {
  // ─── Platform selection ──────────────────────────────────────────────────
  const [selectedPlatforms, setSelectedPlatforms] = useState<Record<PlatformKey, boolean>>({
    instagram: true, twitter: true, linkedin: false, youtube: false, tiktok: false, facebook: false,
  })
  const togglePlatform = (key: PlatformKey) =>
    setSelectedPlatforms((p) => ({ ...p, [key]: !p[key] }))

  // ─── Post state ──────────────────────────────────────────────────────────
  const [postBody, setPostBody] = useState("")
  const [postHashtags, setPostHashtags] = useState("")
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const mediaInputRef = useRef<HTMLInputElement>(null)

  // ─── Thread state ────────────────────────────────────────────────────────
  const [threadPosts, setThreadPosts] = useState(["", ""])
  const addThreadPost = () => setThreadPosts((p) => [...p, ""])
  const removeThreadPost = (i: number) => {
    if (threadPosts.length > 2) setThreadPosts((p) => p.filter((_, idx) => idx !== i))
  }
  const updateThreadPost = (i: number, val: string) =>
    setThreadPosts((p) => p.map((v, idx) => (idx === i ? val : v)))

  // ─── Newsletter state ────────────────────────────────────────────────────
  const [nlSubject, setNlSubject] = useState("")
  const [nlPreview, setNlPreview] = useState("")
  const [nlBody, setNlBody] = useState("")

  // ─── Video state ─────────────────────────────────────────────────────────
  const [videoScript, setVideoScript] = useState("")
  const [videoCaption, setVideoCaption] = useState("")
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const thumbInputRef = useRef<HTMLInputElement>(null)

  // ─── Story state ─────────────────────────────────────────────────────────
  const [storyCaption, setStoryCaption] = useState("")

  // ─── Survey state ────────────────────────────────────────────────────────
  const [surveyQuestion, setSurveyQuestion] = useState("")
  const [surveyOptions, setSurveyOptions] = useState(["", ""])
  const [surveyMultiple, setSurveyMultiple] = useState(false)
  const addSurveyOption = () => { if (surveyOptions.length < 6) setSurveyOptions((o) => [...o, ""]) }
  const removeSurveyOption = (i: number) => { if (surveyOptions.length > 2) setSurveyOptions((o) => o.filter((_, idx) => idx !== i)) }
  const updateSurveyOption = (i: number, val: string) => setSurveyOptions((o) => o.map((v, idx) => (idx === i ? val : v)))

  // ─── Blog state ──────────────────────────────────────────────────────────
  const [blogTitle, setBlogTitle] = useState("")
  const [blogMeta, setBlogMeta] = useState("")
  const [blogBody, setBlogBody] = useState("")
  const [blogTags, setBlogTags] = useState<string[]>([])
  const [blogTagInput, setBlogTagInput] = useState("")
  const [blogCoverPreview, setBlogCoverPreview] = useState<string | null>(null)
  const blogCoverInputRef = useRef<HTMLInputElement>(null)
  const [blogAllowComments, setBlogAllowComments] = useState(true)
  const [blogFeatured, setBlogFeatured] = useState(false)

  const addBlogTag = () => {
    const trimmed = blogTagInput.trim()
    if (trimmed && !blogTags.includes(trimmed) && blogTags.length < 10) {
      setBlogTags((t) => [...t, trimmed])
      setBlogTagInput("")
    }
  }
  const removeBlogTag = (tag: string) => setBlogTags((t) => t.filter((v) => v !== tag))

  // ─── Schedule state ──────────────────────────────────────────────────────
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(scheduledDate)
  const [scheduleTime, setScheduleTime] = useState("09:00")

  // ─── Publish flow ────────────────────────────────────────────────────────
  const [publishStatus, setPublishStatus] = useState<PublishStatus>("idle")
  const [publishResults, setPublishResults] = useState<PlatformResult[]>([])

  const getMainBody = useCallback((): string => {
    if (type === "post") return postBody
    if (type === "thread") return threadPosts.join("\n---\n")
    if (type === "newsletter") return nlBody
    if (type === "video") return videoScript
    if (type === "story") return storyCaption
    if (type === "survey") return surveyQuestion
    if (type === "blog") return blogBody
    return ""
  }, [type, postBody, threadPosts, nlBody, videoScript, storyCaption, surveyQuestion, blogBody])

  // ─── Autosave ────────────────────────────────────────────────────────────
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const body = getMainBody()
    if (!body.trim()) return
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    autosaveTimer.current = setTimeout(() => {
      saveDraft({
        type,
        body,
        title: type === "blog" ? blogTitle : type === "newsletter" ? nlSubject : undefined,
        platforms: Object.entries(selectedPlatforms)
          .filter(([, v]) => v)
          .map(([k]) => k as PlatformKey),
      })
    }, 1500)
    return () => { if (autosaveTimer.current) clearTimeout(autosaveTimer.current) }
  }, [getMainBody, type, blogTitle, nlSubject, selectedPlatforms])

  // ─── File handling ───────────────────────────────────────────────────────
  const handleMediaFile = (file: File, setter: (url: string) => void) => {
    const url = URL.createObjectURL(file)
    setter(url)
  }

  // ─── Publish now ─────────────────────────────────────────────────────────
  const handlePublish = async () => {
    if (publishStatus === "idle") {
      setPublishStatus("confirming")
      return
    }
    if (publishStatus === "confirming") {
      const targets = Object.entries(selectedPlatforms)
        .filter(([, v]) => v)
        .map(([k]) => k as PlatformKey)
      if (targets.length === 0) {
        toast({ title: "Select at least one platform", variant: "destructive" })
        setPublishStatus("idle")
        return
      }
      setPublishStatus("publishing")
      const connected = getConnectedPlatforms().map((p) => p.key)
      // Simulate per-platform publish with staggered delays
      const results: PlatformResult[] = []
      for (const key of targets) {
        await new Promise((r) => setTimeout(r, 700))
        const isConnected = connected.includes(key)
        results.push({
          key,
          label: PLATFORM_DEFS.find((p) => p.key === key)?.label ?? key,
          success: isConnected,
        })
        setPublishResults([...results])
      }
      setPublishStatus("done")
    }
  }

  const handleSchedule = () => {
    if (!scheduleDate) return
    const [h, m] = scheduleTime.split(":").map(Number)
    const dt = new Date(scheduleDate)
    dt.setHours(h, m, 0, 0)
    const body = getMainBody()
    if (!body.trim()) {
      toast({ title: "Add some content before scheduling.", variant: "destructive" })
      return
    }
    const platforms = Object.entries(selectedPlatforms)
      .filter(([, v]) => v)
      .map(([k]) => k as PlatformKey)
    const draft = saveDraft({ type, body, platforms })
    scheduleItem({
      draftId: draft.id,
      type,
      title: type === "blog" ? blogTitle || "Untitled blog" : type === "newsletter" ? nlSubject || "Untitled newsletter" : body.slice(0, 60),
      scheduledFor: dt.toISOString(),
      platforms,
    })
    toast({ title: "Scheduled!", description: `Set for ${format(dt, "MMM d, yyyy 'at' h:mm a")}` })
    setScheduleOpen(false)
  }

  // ─── Char counter ────────────────────────────────────────────────────────
  const charLimit = selectedPlatforms.twitter ? CHAR_LIMITS.twitter : CHAR_LIMITS.instagram
  const charCount = postBody.length
  const charPct = charCount / charLimit
  const charColor = charPct >= 1 ? "text-destructive" : charPct >= 0.85 ? "text-orange-500" : "text-muted-foreground"

  // ─── Schedule popover ────────────────────────────────────────────────────
  const ScheduleButton = ({ label }: { label: string }) => (
    <Popover open={scheduleOpen} onOpenChange={setScheduleOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="border-2 border-black rounded-xl font-bold flex gap-2 h-12">
          <CalendarIcon className="h-5 w-5" />
          {scheduleDate ? format(scheduleDate, "MMM d") : label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 border-4 border-black rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]" align="start">
        <Calendar
          mode="single"
          selected={scheduleDate}
          onSelect={setScheduleDate}
          disabled={(d) => d < new Date()}
          initialFocus
        />
        <div className="p-4 border-t-2 border-black flex gap-3 items-center">
          <Label className="font-bold whitespace-nowrap">Time</Label>
          <Input
            type="time"
            value={scheduleTime}
            onChange={(e) => setScheduleTime(e.target.value)}
            className="border-2 border-black rounded-lg h-9 flex-1"
          />
          <Button
            onClick={handleSchedule}
            disabled={!scheduleDate}
            className="bg-black text-white border-2 border-black rounded-lg font-bold h-9 px-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            Confirm
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )

  return (
    <div className="grid lg:grid-cols-[1fr_280px] gap-6">
      <Toaster />
      <Card className="border-4 border-black rounded-xl p-4 sm:p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-card">

        {/* ── POST ── */}
        {type === "post" && (
          <>
            <div className="relative mb-2">
              <Textarea
                value={postBody}
                onChange={(e) => setPostBody(e.target.value)}
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
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleMediaFile(f, setMediaPreview) }}
            />

            <div className="grid grid-cols-2 gap-4 mb-6">
              <Button
                variant="outline"
                className="border-2 border-black rounded-xl font-bold flex gap-2 h-12"
                onClick={() => mediaInputRef.current?.click()}
              >
                <ImageIcon className="h-5 w-5" /> Add Media
              </Button>
              <ScheduleButton label="Schedule" />
            </div>

            <Tabs defaultValue="hashtags">
              <TabsList className="bg-secondary border-2 border-black rounded-xl p-1 mb-4 w-full">
                {["hashtags", "filters", "advanced"].map((t) => (
                  <TabsTrigger key={t} value={t} className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white font-bold flex-1 capitalize">
                    {t}
                  </TabsTrigger>
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
                    <button
                      key={h}
                      onClick={() => setPostHashtags((prev) => prev ? `${prev} ${h}` : h)}
                      className="text-xs font-bold bg-secondary border-2 border-black rounded-full px-3 py-1 hover:bg-black hover:text-white transition-colors"
                    >
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
        )}

        {/* ── THREAD ── */}
        {type === "thread" && (
          <>
            <p className="text-sm font-bold text-muted-foreground mb-4">
              Write each post in your thread. Hook them with #1.
            </p>
            <div className="space-y-3 mb-4">
              {threadPosts.map((post, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <span className="mt-3 text-xs font-black text-muted-foreground w-5 shrink-0">{i + 1}.</span>
                  <div className="flex-1 relative">
                    <Textarea
                      value={post}
                      onChange={(e) => updateThreadPost(i, e.target.value)}
                      placeholder={i === 0 ? "Hook: start with a bold claim or question..." : `Post ${i + 1}...`}
                      className="min-h-[80px] border-2 border-black rounded-xl p-3 text-sm pr-16"
                      maxLength={280}
                    />
                    <span className={`absolute bottom-3 right-3 text-xs font-bold ${post.length >= 280 ? "text-destructive" : post.length >= 240 ? "text-orange-500" : "text-muted-foreground"}`}>
                      {post.length}/280
                    </span>
                  </div>
                  {threadPosts.length > 2 && (
                    <Button variant="outline" size="icon" className="mt-1 border-2 border-black rounded-xl" onClick={() => removeThreadPost(i)} aria-label={`Remove post ${i + 1}`}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full border-2 border-dashed border-black rounded-xl font-bold flex gap-2 mb-4" onClick={addThreadPost}>
              <Plus className="h-4 w-4" /> Add Post to Thread
            </Button>
            <ScheduleButton label="Schedule Thread" />
          </>
        )}

        {/* ── NEWSLETTER ── */}
        {type === "newsletter" && (
          <>
            <div className="space-y-4 mb-4">
              <div>
                <Label className="font-bold mb-2 block flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Subject Line
                </Label>
                <Input value={nlSubject} onChange={(e) => setNlSubject(e.target.value)} placeholder="The subject line that gets opens..." className="border-2 border-black rounded-xl h-11" />
              </div>
              <div>
                <Label className="font-bold mb-2 block">Preview Text</Label>
                <Input value={nlPreview} onChange={(e) => setNlPreview(e.target.value)} placeholder="One line preview shown in inbox..." className="border-2 border-black rounded-xl h-11" />
              </div>
              <div>
                <Label className="font-bold mb-2 block">Body</Label>
                <Textarea value={nlBody} onChange={(e) => setNlBody(e.target.value)} placeholder="Start with a hook. Your subscribers opened this for a reason." className="min-h-[180px] border-2 border-black rounded-xl p-4 text-base" />
                <p className="text-xs text-muted-foreground mt-1 font-medium">{nlBody.split(/\s+/).filter(Boolean).length} words</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <ScheduleButton label="Schedule Send" />
              <Button
                variant="outline"
                className="border-2 border-black rounded-xl font-bold flex gap-2 h-12"
                onClick={() => {
                  if (!nlSubject.trim()) { toast({ title: "Add a subject line first.", variant: "destructive" }); return }
                  toast({ title: "Test email queued", description: "A preview has been sent to your account email." })
                }}
              >
                <Send className="h-5 w-5" /> Send Test
              </Button>
            </div>
          </>
        )}

        {/* ── SHORT VIDEO ── */}
        {type === "video" && (
          <>
            <div className="space-y-4 mb-4">
              <div>
                <Label className="font-bold mb-2 block">Video Concept / Script</Label>
                <Textarea value={videoScript} onChange={(e) => setVideoScript(e.target.value)} placeholder="Describe your short-form video concept or write a script outline..." className="min-h-[120px] border-2 border-black rounded-xl p-4 text-base" />
              </div>
              <div>
                <Label className="font-bold mb-2 block">Caption / Description</Label>
                <div className="relative">
                  <Textarea value={videoCaption} onChange={(e) => setVideoCaption(e.target.value)} placeholder="Caption for TikTok, Reels, Shorts..." className="min-h-[80px] border-2 border-black rounded-xl p-4 pr-16" maxLength={2200} />
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
                    <button onClick={() => { setThumbnailPreview(null); if (thumbInputRef.current) thumbInputRef.current.value = "" }} className="absolute top-2 right-2 bg-black text-white rounded-full p-1" aria-label="Remove thumbnail"><XCircle className="h-4 w-4" /></button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-black rounded-xl p-8 text-center cursor-pointer hover:bg-muted transition-colors" onClick={() => thumbInputRef.current?.click()}>
                    <ImageIcon className="mx-auto h-8 w-8 mb-2 opacity-40" />
                    <p className="text-sm font-bold">Drop thumbnail or <span className="underline">browse</span></p>
                  </div>
                )}
                <input ref={thumbInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleMediaFile(f, setThumbnailPreview) }} />
              </div>
            </div>
            <ScheduleButton label="Schedule Video" />
          </>
        )}

        {/* ── STORY ── */}
        {type === "story" && (
          <>
            <Textarea value={storyCaption} onChange={(e) => setStoryCaption(e.target.value)} placeholder="What story moment are you sharing today?" className="min-h-[120px] border-2 border-black rounded-xl p-4 text-base mb-4" />
            <div className="grid grid-cols-2 gap-3 mb-4">
              {["Add Sticker", "Add Text Overlay", "Add Music", "Add Poll", "Add Link", "Add Countdown"].map((action) => (
                <Button key={action} variant="outline" onClick={() => toast({ title: `${action} added` })} className="border-2 border-black rounded-xl font-bold text-sm h-11">{action}</Button>
              ))}
            </div>
            <ScheduleButton label="Schedule Story" />
          </>
        )}

        {/* ── SURVEY ── */}
        {type === "survey" && (
          <>
            <div className="space-y-4 mb-4">
              <div>
                <Label className="font-bold mb-2 block flex items-center gap-2">
                  <BarChart2 className="h-4 w-4" /> Survey Question
                </Label>
                <Textarea value={surveyQuestion} onChange={(e) => setSurveyQuestion(e.target.value)} placeholder="What's your biggest content challenge as a solo founder?" className="min-h-[80px] border-2 border-black rounded-xl p-4 text-base" />
              </div>
              <div>
                <Label className="font-bold mb-2 block">Answer Options <span className="text-muted-foreground font-normal text-xs">(2–6)</span></Label>
                <div className="space-y-2">
                  {surveyOptions.map((opt, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="mt-2.5 text-xs font-black text-muted-foreground w-4 shrink-0">{String.fromCharCode(65 + i)}.</span>
                      <Input value={opt} onChange={(e) => updateSurveyOption(i, e.target.value)} placeholder={`Option ${String.fromCharCode(65 + i)}`} className="border-2 border-black rounded-xl h-10 flex-1" />
                      {surveyOptions.length > 2 && (
                        <Button variant="outline" size="icon" className="border-2 border-black rounded-xl" onClick={() => removeSurveyOption(i)} aria-label={`Remove option ${String.fromCharCode(65 + i)}`}><Trash2 className="h-4 w-4" /></Button>
                      )}
                    </div>
                  ))}
                </div>
                {surveyOptions.length < 6 && (
                  <Button variant="outline" className="mt-2 border-2 border-dashed border-black rounded-xl font-bold flex gap-2 w-full" onClick={addSurveyOption}>
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
        )}

        {/* ── BLOG ── */}
        {type === "blog" && (
          <>
            <div className="space-y-4 mb-4">
              <div>
                <Label className="font-bold mb-2 block flex items-center gap-2"><BookOpen className="h-4 w-4" /> Blog Title</Label>
                <Input value={blogTitle} onChange={(e) => setBlogTitle(e.target.value)} placeholder="Write a title that makes people stop scrolling..." className="border-2 border-black rounded-xl h-11 text-base" />
              </div>
              <div>
                <Label className="font-bold mb-2 block">Meta Description <span className="text-muted-foreground font-normal text-xs">({blogMeta.length}/150 chars, SEO)</span></Label>
                <Input value={blogMeta} onChange={(e) => setBlogMeta(e.target.value)} placeholder="One-line summary shown in search results..." className="border-2 border-black rounded-xl h-11" maxLength={150} />
              </div>
              <div>
                <Label className="font-bold mb-2 block">Cover Image</Label>
                {blogCoverPreview ? (
                  <div className="relative rounded-xl overflow-hidden border-2 border-black">
                    <img src={blogCoverPreview} alt="Blog cover preview" className="w-full max-h-56 object-cover" />
                    <button onClick={() => { setBlogCoverPreview(null); if (blogCoverInputRef.current) blogCoverInputRef.current.value = "" }} className="absolute top-2 right-2 bg-black text-white rounded-full p-1" aria-label="Remove cover image"><XCircle className="h-4 w-4" /></button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-black rounded-xl p-8 text-center cursor-pointer hover:bg-muted transition-colors" onClick={() => blogCoverInputRef.current?.click()}>
                    <ImageIcon className="mx-auto h-8 w-8 mb-2 opacity-40" />
                    <p className="text-sm font-bold">Drop cover image or <span className="underline">browse</span></p>
                    <p className="text-xs text-muted-foreground mt-1">Recommended: 1200 x 630px</p>
                  </div>
                )}
                <input ref={blogCoverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleMediaFile(f, setBlogCoverPreview) }} />
              </div>
              <div>
                <Label className="font-bold mb-2 block">Body</Label>
                <Textarea value={blogBody} onChange={(e) => setBlogBody(e.target.value)} placeholder="Start writing your blog post here..." className="min-h-[200px] border-2 border-black rounded-xl p-4 text-base" />
                <p className="text-xs text-muted-foreground mt-1 font-medium">{blogBody.split(/\s+/).filter(Boolean).length} words</p>
              </div>
              <div>
                <Label className="font-bold mb-2 block flex items-center gap-2"><Tag className="h-4 w-4" /> Tags <span className="text-muted-foreground font-normal text-xs">({blogTags.length}/10)</span></Label>
                <div className="flex gap-2 mb-2">
                  <Input value={blogTagInput} onChange={(e) => setBlogTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addBlogTag() } }} placeholder="e.g. solofounder, marketing..." className="border-2 border-black rounded-xl h-10 flex-1" />
                  <Button variant="outline" className="border-2 border-black rounded-xl font-bold px-4" onClick={addBlogTag} type="button"><Plus className="h-4 w-4" /></Button>
                </div>
                {blogTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {blogTags.map((tag) => (
                      <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-black text-white text-xs font-bold rounded-full">
                        {tag}
                        <button onClick={() => removeBlogTag(tag)} aria-label={`Remove tag ${tag}`} className="ml-1 hover:opacity-70"><Trash2 className="h-3 w-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-3 p-4 border-2 border-black rounded-xl bg-secondary">
                <div className="flex items-center justify-between">
                  <Label className="font-bold">Allow Comments</Label>
                  <Switch checked={blogAllowComments} onCheckedChange={setBlogAllowComments} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="font-bold">Mark as Featured Post</Label>
                  <Switch checked={blogFeatured} onCheckedChange={setBlogFeatured} />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <ScheduleButton label="Schedule Post" />
              <Button
                variant="outline"
                className="border-2 border-black rounded-xl font-bold flex gap-2 h-12"
                onClick={() => {
                  saveDraft({ type: "blog", body: blogBody, title: blogTitle, platforms: [] })
                  toast({ title: "Draft saved" })
                }}
              >
                <Send className="h-5 w-5" /> Save Draft
              </Button>
            </div>
          </>
        )}

        {/* Mobile platform toggle */}
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
            </CollapsibleContent>
          </Collapsible>
        </div>
      </Card>

      {/* Desktop sidebar */}
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
          <p className="text-xs text-muted-foreground font-medium mt-4">
            Autosaving draft as you type.
          </p>
        </Card>

        <Button
          onClick={handlePublish}
          className="w-full h-14 bg-brand-gradient-metallic text-white rounded-xl border-2 border-black font-bold text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2"
        >
          <Send className="h-5 w-5" />
          {publishStatus === "idle" ? "Publish Now" : publishStatus === "confirming" ? "Confirm Publish?" : publishStatus === "publishing" ? "Publishing..." : "Published!"}
        </Button>
      </div>

      {/* Publish flow dialog */}
      <Dialog open={publishStatus === "confirming" || publishStatus === "publishing" || publishStatus === "done"} onOpenChange={(o) => { if (!o) setPublishStatus("idle"); setPublishResults([]) }}>
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
                    <p className="text-xs font-medium text-muted-foreground mb-3">
                      Connect accounts from the dashboard to enable publishing.
                    </p>
                  )}
                  <Button className="w-full bg-black text-white border-2 border-black rounded-xl font-bold" onClick={() => { setPublishStatus("idle"); setPublishResults([]) }}>
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
