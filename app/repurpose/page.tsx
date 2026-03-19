"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { toast } from "sonner"
import { LayoutDashboard, CalendarDays, Repeat2, Lightbulb, Menu, Copy, Loader2, Wand2, Check, Sparkles } from "lucide-react"
import MobileNavigation from "@/components/mobile-navigation"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: "Content Calendar", href: "/calendar", icon: <CalendarDays className="h-5 w-5" /> },
  { label: "Repurpose", href: "/repurpose", icon: <Repeat2 className="h-5 w-5" /> },
  { label: "Ideas / Swipe File", href: "/ideas", icon: <Lightbulb className="h-5 w-5" /> },
]

interface Format {
  id: string
  label: string
  description: string
  color: string
  transform: (input: string) => string
}

// Pure-JS text reformatters — no API needed
const FORMATS: Format[] = [
  {
    id: "twitter",
    label: "Twitter / X Post",
    description: "Punchy, under 280 chars, with a hook",
    color: "border-pink-400",
    transform: (text) => {
      const sentences = text.replace(/\n+/g, " ").split(/(?<=[.!?])\s+/)
      const hook = sentences[0] ?? text
      const trimmed = hook.length > 230 ? hook.slice(0, 227) + "..." : hook
      return `${trimmed}\n\n#solofounder #buildinpublic`
    },
  },
  {
    id: "thread",
    label: "Twitter Thread",
    description: "Breaks content into numbered thread posts",
    color: "border-orange-400",
    transform: (text) => {
      const sentences = text.replace(/\n+/g, " ").split(/(?<=[.!?])\s+/).filter(Boolean)
      const chunks: string[] = []
      let current = ""
      for (const s of sentences) {
        if ((current + " " + s).trim().length > 250) {
          if (current) chunks.push(current.trim())
          current = s
        } else {
          current = current ? `${current} ${s}` : s
        }
      }
      if (current) chunks.push(current.trim())
      return chunks.map((c, i) => `${i + 1}/${chunks.length} ${c}`).join("\n\n")
    },
  },
  {
    id: "linkedin",
    label: "LinkedIn Post",
    description: "Professional tone, line breaks, CTA",
    color: "border-blue-400",
    transform: (text) => {
      const lines = text.replace(/\n+/g, " ").split(/(?<=[.!?])\s+/).filter(Boolean)
      const body = lines.map((l) => l.trim()).join("\n\n")
      return `${body}\n\n---\nAre you building something similar? Drop a comment — I'd love to connect.\n\n#solobusiness #entrepreneurship #buildinpublic`
    },
  },
  {
    id: "newsletter",
    label: "Newsletter Intro",
    description: "Opening hook and first paragraph for email",
    color: "border-yellow-400",
    transform: (text) => {
      const firstSentence = text.split(/[.!?]/)[0] ?? text
      return `Subject: ${firstSentence.trim().slice(0, 60)}\n\nHey [First Name],\n\n${text.trim()}\n\nMore on this next week — stay tuned.\n\n— [Your Name]`
    },
  },
  {
    id: "video_script",
    label: "Short Video Script",
    description: "Hook + key points + CTA for Reels/TikTok/Shorts",
    color: "border-red-400",
    transform: (text) => {
      const sentences = text.replace(/\n+/g, " ").split(/(?<=[.!?])\s+/).filter(Boolean)
      const points = sentences.slice(0, 4).map((s, i) => `${i + 1}. ${s.trim()}`)
      return `[HOOK - 0:00]\n"${sentences[0] ?? text}"\n\n[MAIN POINTS]\n${points.join("\n")}\n\n[CTA - end]\n"Follow for more solo founder tips. Comment your biggest challenge below."`
    },
  },
  {
    id: "blog_outline",
    label: "Blog Post Outline",
    description: "H2 sections and bullet points from your content",
    color: "border-purple-400",
    transform: (text) => {
      const sentences = text.replace(/\n+/g, " ").split(/(?<=[.!?])\s+/).filter(Boolean)
      const title = (sentences[0] ?? text).slice(0, 70)
      const points = sentences.slice(1, 6).map((s) => `- ${s.trim()}`)
      return `# ${title}\n\n## Introduction\n(Hook based on your opening)\n\n## Key Points\n${points.join("\n")}\n\n## Takeaways\n- [Summarize main lesson]\n- [Action item for reader]\n\n## Conclusion\n(Tie back to the hook, add a CTA)`
    },
  },
]

export default function RepurposePage() {
  const pathname = usePathname()
  const [input, setInput] = useState("")
  const [results, setResults] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [useAI, setUseAI] = useState(false)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleRepurpose = async () => {
    if (!input.trim()) {
      toast.error("Paste your content first.")
      return
    }
    setLoading(true)
    const newResults: Record<string, string> = {}

    if (useAI) {
      // Call AI API for each format in parallel
      const promises = FORMATS.map(async (fmt) => {
        setLoadingId(fmt.id)
        try {
          const res = await fetch("/api/ai-repurpose", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ formatId: fmt.id, input }),
          })
          const data = await res.json()
          newResults[fmt.id] = data.text ?? fmt.transform(input)
        } catch {
          newResults[fmt.id] = fmt.transform(input)
        }
        setResults({ ...newResults })
      })
      await Promise.all(promises)
    } else {
      for (const fmt of FORMATS) {
        await new Promise((r) => setTimeout(r, 250))
        newResults[fmt.id] = fmt.transform(input)
        setResults({ ...newResults })
      }
    }

    setLoadingId(null)
    setLoading(false)
  }

  const handleCopy = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    toast.success("Copied to clipboard")
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4 md:p-8 font-sans">
      <div className="w-full max-w-7xl mx-auto bg-card border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">

        {/* Header */}
        <header className="border-b-4 border-black p-4 sm:p-6 bg-card">
          <div className="flex justify-between items-center gap-4">
            <div className="flex flex-col leading-none">
              <span className="text-xs font-black tracking-[0.2em] uppercase text-muted-foreground">SOLOSUCCESS</span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-brand-gradient">CONTENT FACTORY</h1>
            </div>
            <div className="flex md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                    <Menu className="h-5 w-5" /><span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="border-r-4 border-black p-0 w-72">
                  <MobileNavigation />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>

        <div className="grid md:grid-cols-[260px_1fr] min-h-[calc(100vh-6rem)]">
          {/* Sidebar */}
          <aside className="hidden md:flex flex-col border-r-4 border-black bg-secondary p-4 gap-8">
            <nav className="space-y-1" aria-label="Main navigation">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link key={item.label} href={item.href}
                    className={`flex items-center gap-3 text-base font-bold p-3 rounded-xl transition-colors ${isActive ? "bg-brand-gradient-metallic text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] border-2 border-black" : "hover:bg-black/5 text-foreground"}`}
                  >
                    {item.icon}{item.label}
                  </Link>
                )
              })}
            </nav>
            <div className="mt-auto border-2 border-black rounded-xl p-3 bg-card">
              <p className="text-xs font-bold text-muted-foreground leading-relaxed">
                Paste any content and instantly get 6 platform-ready formats.
              </p>
            </div>
          </aside>

          {/* Main */}
          <main className="p-4 sm:p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-black tracking-tight mb-1">REPURPOSE CONTENT</h2>
              <p className="text-sm text-muted-foreground font-medium">
                Paste a blog post, idea, or any text — get 6 formats ready to publish.
              </p>
            </div>

            {/* Input */}
            <Card className="border-4 border-black rounded-xl p-4 sm:p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-6">
              <label className="font-black text-sm tracking-widest uppercase text-muted-foreground block mb-3">
                Your Original Content
              </label>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste a blog post, lesson, idea, insight, or any long-form content here..."
                className="min-h-[160px] border-2 border-black rounded-xl p-4 text-base resize-none"
              />
              <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
                <span className="text-xs font-medium text-muted-foreground">
                  {input.split(/\s+/).filter(Boolean).length} words
                </span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="ai-toggle"
                      checked={useAI}
                      onCheckedChange={setUseAI}
                    />
                    <Label htmlFor="ai-toggle" className="font-bold text-sm flex items-center gap-1 cursor-pointer">
                      <Sparkles className="h-3.5 w-3.5" />
                      AI Rewrite
                    </Label>
                  </div>
                  <Button
                    onClick={handleRepurpose}
                    disabled={loading || !input.trim()}
                    className="bg-brand-gradient-metallic text-white border-2 border-black rounded-xl font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex gap-2 h-11 px-6"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : useAI ? <Sparkles className="h-4 w-4" /> : <Wand2 className="h-4 w-4" />}
                    {loading ? "Repurposing..." : useAI ? "Repurpose with AI" : "Repurpose Now"}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Results */}
            {Object.keys(results).length > 0 && (
              <div className="grid sm:grid-cols-2 gap-4">
                {FORMATS.map((fmt) => {
                  const text = results[fmt.id]
                  const isLoading = useAI && loading && !text
                  if (!text && !isLoading) return null
                  return (
                    <Card key={fmt.id} className={`border-4 ${fmt.color} rounded-xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="font-black text-sm">{fmt.label}</h3>
                          <p className="text-xs text-muted-foreground font-medium">{fmt.description}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          className="border-2 border-black rounded-lg h-8 w-8 shrink-0"
                          onClick={() => handleCopy(fmt.id, text)}
                          aria-label={`Copy ${fmt.label}`}
                        >
                          {copiedId === fmt.id ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                      <pre className="text-xs font-mono bg-background border-2 border-black rounded-lg p-3 whitespace-pre-wrap max-h-52 overflow-auto leading-relaxed">
                        {isLoading ? (
                          <span className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-3 w-3 animate-spin" /> Rewriting with AI...
                          </span>
                        ) : text}
                      </pre>
                    </Card>
                  )
                })}
              </div>
            )}

            {Object.keys(results).length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
                <Repeat2 className="h-12 w-12 opacity-20" />
                <p className="font-bold text-muted-foreground">Paste your content above and hit "Repurpose Now".</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
