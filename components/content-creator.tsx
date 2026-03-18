"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  ImageIcon,
  Calendar,
  Send,
  ChevronDown,
  Plus,
  Trash2,
  Mail,
  BarChart2,
  BookOpen,
  Tag,
} from "lucide-react"

type ContentType = "post" | "thread" | "newsletter" | "video" | "story" | "survey" | "blog"

interface ContentCreatorProps {
  type: ContentType
}

const placeholders: Record<ContentType, string> = {
  post: "Write your post here. Keep it punchy — solo founders who ship fast win.",
  thread: "Write your first tweet / thread opener here...",
  newsletter: "Start with a hook. Your subscribers opened this for a reason.",
  video: "Describe your short-form video concept or write a script outline...",
  story: "What story moment are you sharing today?",
  survey: "Describe what you want to learn from your audience...",
  blog: "Start writing your blog post here...",
}

export default function ContentCreator({ type }: ContentCreatorProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState({
    instagram: true,
    twitter: true,
    linkedin: false,
    youtube: false,
  })

  const [threadPosts, setThreadPosts] = useState(["", ""])
  const [surveyQuestion, setSurveyQuestion] = useState("")
  const [surveyOptions, setSurveyOptions] = useState(["", ""])
  const [blogTags, setBlogTags] = useState<string[]>([])
  const [blogTagInput, setBlogTagInput] = useState("")

  const togglePlatform = (platform: keyof typeof selectedPlatforms) => {
    setSelectedPlatforms((prev) => ({ ...prev, [platform]: !prev[platform] }))
  }

  const addThreadPost = () => setThreadPosts((p) => [...p, ""])
  const removeThreadPost = (i: number) => setThreadPosts((p) => p.filter((_, idx) => idx !== i))
  const updateThreadPost = (i: number, val: string) =>
    setThreadPosts((p) => p.map((v, idx) => (idx === i ? val : v)))

  const addSurveyOption = () => {
    if (surveyOptions.length < 6) setSurveyOptions((o) => [...o, ""])
  }
  const removeSurveyOption = (i: number) => {
    if (surveyOptions.length > 2) setSurveyOptions((o) => o.filter((_, idx) => idx !== i))
  }
  const updateSurveyOption = (i: number, val: string) =>
    setSurveyOptions((o) => o.map((v, idx) => (idx === i ? val : v)))

  const addBlogTag = () => {
    const trimmed = blogTagInput.trim()
    if (trimmed && !blogTags.includes(trimmed) && blogTags.length < 10) {
      setBlogTags((t) => [...t, trimmed])
      setBlogTagInput("")
    }
  }
  const removeBlogTag = (tag: string) => setBlogTags((t) => t.filter((v) => v !== tag))

  const platformsList = [
    { key: "instagram" as const, icon: <Instagram className="h-5 w-5" />, label: "Instagram" },
    { key: "twitter" as const, icon: <Twitter className="h-5 w-5" />, label: "Twitter / X" },
    { key: "linkedin" as const, icon: <Linkedin className="h-5 w-5" />, label: "LinkedIn" },
    { key: "youtube" as const, icon: <Youtube className="h-5 w-5" />, label: "YouTube" },
  ]

  return (
    <div className="grid lg:grid-cols-[1fr_280px] gap-6">
      <Card className="border-4 border-black rounded-xl p-4 sm:p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-card">

        {/* --- POST --- */}
        {type === "post" && (
          <>
            <Textarea
              placeholder={placeholders.post}
              className="min-h-[150px] border-2 border-black rounded-xl p-4 text-base mb-4"
            />
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Button variant="outline" className="border-2 border-black rounded-xl font-bold flex gap-2 h-12">
                <ImageIcon className="h-5 w-5" /> Add Media
              </Button>
              <Button variant="outline" className="border-2 border-black rounded-xl font-bold flex gap-2 h-12">
                <Calendar className="h-5 w-5" /> Schedule
              </Button>
            </div>
            <Tabs defaultValue="hashtags">
              <TabsList className="bg-secondary border-2 border-black rounded-xl p-1 mb-4 w-full">
                {["hashtags", "filters", "advanced"].map((t) => (
                  <TabsTrigger
                    key={t}
                    value={t}
                    className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white font-bold flex-1 capitalize"
                  >
                    {t}
                  </TabsTrigger>
                ))}
              </TabsList>
              <TabsContent value="hashtags">
                <Textarea
                  placeholder="#solofounder #buildinpublic #contentmarketing"
                  className="min-h-[80px] border-2 border-black rounded-xl p-4"
                />
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

        {/* --- THREAD --- */}
        {type === "thread" && (
          <>
            <p className="text-sm font-bold text-muted-foreground mb-4">
              Write each post in your thread. Hook them with #1.
            </p>
            <div className="space-y-3 mb-4">
              {threadPosts.map((post, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <span className="mt-3 text-xs font-black text-muted-foreground w-5 shrink-0">{i + 1}.</span>
                  <Textarea
                    value={post}
                    onChange={(e) => updateThreadPost(i, e.target.value)}
                    placeholder={i === 0 ? "Hook: start with a bold claim or question..." : `Post ${i + 1}...`}
                    className="min-h-[80px] border-2 border-black rounded-xl p-3 text-sm flex-1"
                  />
                  {threadPosts.length > 2 && (
                    <Button
                      variant="outline"
                      size="icon"
                      className="mt-1 border-2 border-black rounded-xl"
                      onClick={() => removeThreadPost(i)}
                      aria-label={`Remove post ${i + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              className="w-full border-2 border-dashed border-black rounded-xl font-bold flex gap-2 mb-4"
              onClick={addThreadPost}
            >
              <Plus className="h-4 w-4" /> Add Post to Thread
            </Button>
            <Button variant="outline" className="border-2 border-black rounded-xl font-bold flex gap-2 h-10">
              <Calendar className="h-4 w-4" /> Schedule Thread
            </Button>
          </>
        )}

        {/* --- NEWSLETTER --- */}
        {type === "newsletter" && (
          <>
            <div className="space-y-4 mb-4">
              <div>
                <Label className="font-bold mb-2 block flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Subject Line
                </Label>
                <Input
                  placeholder="The subject line that gets opens..."
                  className="border-2 border-black rounded-xl h-11"
                />
              </div>
              <div>
                <Label className="font-bold mb-2 block">Preview Text</Label>
                <Input
                  placeholder="One line preview shown in inbox..."
                  className="border-2 border-black rounded-xl h-11"
                />
              </div>
              <div>
                <Label className="font-bold mb-2 block">Body</Label>
                <Textarea
                  placeholder={placeholders.newsletter}
                  className="min-h-[180px] border-2 border-black rounded-xl p-4 text-base"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="border-2 border-black rounded-xl font-bold flex gap-2 h-12">
                <Calendar className="h-5 w-5" /> Schedule Send
              </Button>
              <Button variant="outline" className="border-2 border-black rounded-xl font-bold flex gap-2 h-12">
                <Send className="h-5 w-5" /> Send Test
              </Button>
            </div>
          </>
        )}

        {/* --- SHORT VIDEO --- */}
        {type === "video" && (
          <>
            <div className="space-y-4 mb-4">
              <div>
                <Label className="font-bold mb-2 block">Video Concept / Script</Label>
                <Textarea
                  placeholder={placeholders.video}
                  className="min-h-[120px] border-2 border-black rounded-xl p-4 text-base"
                />
              </div>
              <div>
                <Label className="font-bold mb-2 block">Caption / Description</Label>
                <Textarea
                  placeholder="Caption for TikTok, Reels, Shorts..."
                  className="min-h-[80px] border-2 border-black rounded-xl p-4"
                />
              </div>
              <div>
                <Label className="font-bold mb-2 block">Thumbnail</Label>
                <div className="border-2 border-dashed border-black rounded-xl p-8 text-center">
                  <ImageIcon className="mx-auto h-8 w-8 mb-2 opacity-40" />
                  <p className="text-sm font-bold">Drop thumbnail or <span className="underline cursor-pointer">browse</span></p>
                </div>
              </div>
            </div>
            <Button variant="outline" className="border-2 border-black rounded-xl font-bold flex gap-2 h-12">
              <Calendar className="h-5 w-5" /> Schedule Video
            </Button>
          </>
        )}

        {/* --- STORY --- */}
        {type === "story" && (
          <>
            <Textarea
              placeholder={placeholders.story}
              className="min-h-[120px] border-2 border-black rounded-xl p-4 text-base mb-4"
            />
            <div className="grid grid-cols-2 gap-3 mb-4">
              {["Add Sticker", "Add Text Overlay", "Add Music", "Add Poll", "Add Link", "Add Countdown"].map((action) => (
                <Button key={action} variant="outline" className="border-2 border-black rounded-xl font-bold text-sm h-11">
                  {action}
                </Button>
              ))}
            </div>
            <Button variant="outline" className="border-2 border-black rounded-xl font-bold flex gap-2 h-12 w-full">
              <Calendar className="h-5 w-5" /> Schedule Story
            </Button>
          </>
        )}

        {/* --- SURVEY --- */}
        {type === "survey" && (
          <>
            <div className="space-y-4 mb-4">
              <div>
                <Label className="font-bold mb-2 block flex items-center gap-2">
                  <BarChart2 className="h-4 w-4" /> Survey Question
                </Label>
                <Textarea
                  value={surveyQuestion}
                  onChange={(e) => setSurveyQuestion(e.target.value)}
                  placeholder="What's your biggest content challenge as a solo founder?"
                  className="min-h-[80px] border-2 border-black rounded-xl p-4 text-base"
                />
              </div>
              <div>
                <Label className="font-bold mb-2 block">Answer Options <span className="text-muted-foreground font-normal text-xs">(2–6)</span></Label>
                <div className="space-y-2">
                  {surveyOptions.map((opt, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="mt-2.5 text-xs font-black text-muted-foreground w-4 shrink-0">{String.fromCharCode(65 + i)}.</span>
                      <Input
                        value={opt}
                        onChange={(e) => updateSurveyOption(i, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + i)}`}
                        className="border-2 border-black rounded-xl h-10 flex-1"
                      />
                      {surveyOptions.length > 2 && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="border-2 border-black rounded-xl"
                          onClick={() => removeSurveyOption(i)}
                          aria-label={`Remove option ${String.fromCharCode(65 + i)}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                {surveyOptions.length < 6 && (
                  <Button
                    variant="outline"
                    className="mt-2 border-2 border-dashed border-black rounded-xl font-bold flex gap-2 w-full"
                    onClick={addSurveyOption}
                  >
                    <Plus className="h-4 w-4" /> Add Option
                  </Button>
                )}
              </div>
              <div className="flex items-center justify-between p-3 border-2 border-black rounded-xl">
                <Label className="font-bold">Allow multiple answers</Label>
                <Switch />
              </div>
            </div>
            <Button variant="outline" className="border-2 border-black rounded-xl font-bold flex gap-2 h-12 w-full">
              <Calendar className="h-5 w-5" /> Schedule Survey
            </Button>
          </>
        )}

        {/* --- BLOG --- */}
        {type === "blog" && (
          <>
            <div className="space-y-4 mb-4">
              <div>
                <Label className="font-bold mb-2 block flex items-center gap-2">
                  <BookOpen className="h-4 w-4" /> Blog Title
                </Label>
                <Input
                  placeholder="Write a title that makes people stop scrolling..."
                  className="border-2 border-black rounded-xl h-11 text-base"
                />
              </div>
              <div>
                <Label className="font-bold mb-2 block">Meta Description <span className="text-muted-foreground font-normal text-xs">(SEO — 150 chars)</span></Label>
                <Input
                  placeholder="One-line summary shown in search results..."
                  className="border-2 border-black rounded-xl h-11"
                  maxLength={150}
                />
              </div>
              <div>
                <Label className="font-bold mb-2 block">Cover Image</Label>
                <div className="border-2 border-dashed border-black rounded-xl p-8 text-center cursor-pointer hover:bg-muted transition-colors">
                  <ImageIcon className="mx-auto h-8 w-8 mb-2 opacity-40" />
                  <p className="text-sm font-bold">Drop cover image or <span className="underline">browse</span></p>
                  <p className="text-xs text-muted-foreground mt-1">Recommended: 1200 x 630px</p>
                </div>
              </div>
              <div>
                <Label className="font-bold mb-2 block">Body</Label>
                <Textarea
                  placeholder={placeholders.blog}
                  className="min-h-[200px] border-2 border-black rounded-xl p-4 text-base"
                />
              </div>
              <div>
                <Label className="font-bold mb-2 block flex items-center gap-2">
                  <Tag className="h-4 w-4" /> Tags <span className="text-muted-foreground font-normal text-xs">(up to 10)</span>
                </Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={blogTagInput}
                    onChange={(e) => setBlogTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addBlogTag() } }}
                    placeholder="e.g. solofounder, marketing..."
                    className="border-2 border-black rounded-xl h-10 flex-1"
                  />
                  <Button
                    variant="outline"
                    className="border-2 border-black rounded-xl font-bold px-4"
                    onClick={addBlogTag}
                    type="button"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {blogTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {blogTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-black text-white text-xs font-bold rounded-full"
                      >
                        {tag}
                        <button
                          onClick={() => removeBlogTag(tag)}
                          aria-label={`Remove tag ${tag}`}
                          className="ml-1 hover:opacity-70"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 p-4 border-2 border-black rounded-xl bg-secondary">
                <div className="flex items-center justify-between col-span-2">
                  <Label className="font-bold">Allow Comments</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between col-span-2">
                  <Label className="font-bold">Mark as Featured Post</Label>
                  <Switch />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="border-2 border-black rounded-xl font-bold flex gap-2 h-12">
                <Calendar className="h-5 w-5" /> Schedule Post
              </Button>
              <Button variant="outline" className="border-2 border-black rounded-xl font-bold flex gap-2 h-12">
                <Send className="h-5 w-5" /> Save Draft
              </Button>
            </div>
          </>
        )}

        {/* Mobile platforms collapsible */}
        <div className="mt-6 lg:hidden">
          <Collapsible>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-black text-white rounded-xl font-bold">
              <span>Platforms</span>
              <ChevronDown className="h-5 w-5" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-3 p-3 border-2 border-black rounded-xl">
              {platformsList.map((p) => (
                <div key={p.key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {p.icon}
                    <Label className="font-bold">{p.label}</Label>
                  </div>
                  <Switch
                    checked={selectedPlatforms[p.key]}
                    onCheckedChange={() => togglePlatform(p.key)}
                  />
                </div>
              ))}
              <Button className="w-full mt-2 h-12 bg-brand-gradient-metallic text-white rounded-xl border-2 border-black font-bold text-base shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2">
                <Send className="h-5 w-5" /> Publish Now
              </Button>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </Card>

      {/* Desktop platforms sidebar */}
      <div className="hidden lg:flex flex-col gap-6">
        <Card className="border-4 border-black rounded-xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-card">
          <h3 className="font-black text-sm tracking-widest uppercase text-muted-foreground mb-4">Platforms</h3>
          <div className="space-y-4">
            {platformsList.map((p) => (
              <div key={p.key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {p.icon}
                  <Label className="font-bold">{p.label}</Label>
                </div>
                <Switch
                  checked={selectedPlatforms[p.key]}
                  onCheckedChange={() => togglePlatform(p.key)}
                />
              </div>
            ))}
          </div>
        </Card>

        <Button className="w-full h-14 bg-brand-gradient-metallic text-white rounded-xl border-2 border-black font-bold text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2">
          <Send className="h-5 w-5" /> Publish Now
        </Button>
      </div>
    </div>
  )
}
