"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Toaster } from "@/components/ui/toaster"
import { toast } from "@/components/ui/use-toast"
import {
  LayoutDashboard, CalendarDays, Repeat2, Lightbulb, Menu, Plus,
  Trash2, Pin, PinOff, Search, ExternalLink, Download,
} from "lucide-react"
import MobileNavigation from "@/components/mobile-navigation"
import { getIdeas, saveIdea, deleteIdea, pinIdea, type Idea } from "@/lib/storage"
import { format } from "date-fns"

const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: "Content Calendar", href: "/calendar", icon: <CalendarDays className="h-5 w-5" /> },
  { label: "Repurpose", href: "/repurpose", icon: <Repeat2 className="h-5 w-5" /> },
  { label: "Ideas / Swipe File", href: "/ideas", icon: <Lightbulb className="h-5 w-5" /> },
]

const SUGGESTED_TAGS = ["content", "strategy", "marketing", "product", "growth", "design", "mindset", "copy", "video", "newsletter"]

export default function IdeasPage() {
  const pathname = usePathname()
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [search, setSearch] = useState("")
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)

  // Form state
  const [newTitle, setNewTitle] = useState("")
  const [newBody, setNewBody] = useState("")
  const [newSourceUrl, setNewSourceUrl] = useState("")
  const [newTags, setNewTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")

  const reload = useCallback(() => setIdeas(getIdeas()), [])
  useEffect(() => { reload() }, [reload])

  const filtered = ideas.filter((idea) => {
    const matchSearch =
      !search ||
      idea.title.toLowerCase().includes(search.toLowerCase()) ||
      idea.body.toLowerCase().includes(search.toLowerCase())
    const matchTag = !activeTag || idea.tags.includes(activeTag)
    return matchSearch && matchTag
  })

  const pinned = filtered.filter((i) => i.pinned)
  const unpinned = filtered.filter((i) => !i.pinned)

  const allTags = Array.from(new Set(ideas.flatMap((i) => i.tags))).sort()

  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase()
    if (trimmed && !newTags.includes(trimmed) && newTags.length < 10) {
      setNewTags((t) => [...t, trimmed])
      setTagInput("")
    }
  }

  const handleSave = () => {
    if (!newTitle.trim()) { toast({ title: "Add a title for your idea.", variant: "destructive" }); return }
    saveIdea({ title: newTitle.trim(), body: newBody.trim(), tags: newTags, sourceUrl: newSourceUrl.trim() || undefined, pinned: false })
    reload()
    toast({ title: "Idea saved to your Swipe File" })
    setNewTitle(""); setNewBody(""); setNewSourceUrl(""); setNewTags([]); setTagInput("")
    setAddOpen(false)
  }

  const handleDelete = (id: string) => {
    deleteIdea(id)
    reload()
    toast({ title: "Idea removed" })
  }

  const handlePin = (id: string, pinned: boolean) => {
    pinIdea(id, !pinned)
    reload()
  }

  const handleExport = () => {
    const text = ideas
      .map((i) => `# ${i.title}\n${i.body}\n${i.sourceUrl ? `Source: ${i.sourceUrl}` : ""}\nTags: ${i.tags.join(", ")}\n---`)
      .join("\n\n")
    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "solosuccess-swipefile.txt"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4 md:p-8 font-sans">
      <Toaster />
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
            <div className="hidden sm:flex gap-3">
              <Button variant="outline" onClick={handleExport} className="border-2 border-black rounded-xl font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex gap-2">
                <Download className="h-4 w-4" /> Export
              </Button>
              <Button onClick={() => setAddOpen(true)} className="bg-black hover:bg-black/80 text-white rounded-xl border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex gap-2">
                <Plus className="h-4 w-4" /> Add Idea
              </Button>
            </div>
          </div>
        </header>

        <div className="grid md:grid-cols-[260px_1fr] min-h-[calc(100vh-6rem)]">
          {/* Sidebar */}
          <aside className="hidden md:flex flex-col border-r-4 border-black bg-secondary p-4 gap-6">
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

            {/* Tag filter */}
            <div>
              <h3 className="text-xs font-black tracking-widest uppercase text-muted-foreground mb-3">Filter by Tag</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveTag(null)}
                  className={`text-xs font-bold px-3 py-1 rounded-full border-2 border-black transition-colors ${!activeTag ? "bg-black text-white" : "bg-card hover:bg-secondary"}`}
                >
                  All
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                    className={`text-xs font-bold px-3 py-1 rounded-full border-2 border-black transition-colors ${activeTag === tag ? "bg-black text-white" : "bg-card hover:bg-secondary"}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-auto border-2 border-black rounded-xl p-3 bg-card">
              <p className="text-xs font-bold text-muted-foreground leading-relaxed">
                {ideas.length} idea{ideas.length !== 1 ? "s" : ""} saved. {pinned.length} pinned.
              </p>
            </div>
          </aside>

          {/* Main */}
          <main className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 gap-3">
              <h2 className="text-2xl font-black tracking-tight">IDEAS / SWIPE FILE</h2>
              <Button onClick={() => setAddOpen(true)} className="sm:hidden bg-black text-white border-2 border-black rounded-xl font-bold" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search your ideas..."
                className="border-2 border-black rounded-xl h-11 pl-10 font-medium"
              />
            </div>

            {/* Mobile tag filter */}
            <div className="flex flex-wrap gap-2 mb-6 md:hidden">
              {allTags.map((tag) => (
                <button key={tag} onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  className={`text-xs font-bold px-3 py-1 rounded-full border-2 border-black transition-colors ${activeTag === tag ? "bg-black text-white" : "bg-card hover:bg-secondary"}`}
                >
                  {tag}
                </button>
              ))}
            </div>

            {ideas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                <Lightbulb className="h-14 w-14 opacity-20" />
                <p className="font-black text-lg">Your Swipe File is empty.</p>
                <p className="text-sm text-muted-foreground font-medium">Save ideas, inspiration, and content you want to come back to.</p>
                <Button onClick={() => setAddOpen(true)} className="bg-black text-white border-2 border-black rounded-xl font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex gap-2">
                  <Plus className="h-4 w-4" /> Add Your First Idea
                </Button>
              </div>
            ) : (
              <>
                {pinned.length > 0 && (
                  <section className="mb-8">
                    <h3 className="text-sm font-black tracking-widest uppercase text-muted-foreground mb-3">Pinned</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {pinned.map((idea) => <IdeaCard key={idea.id} idea={idea} onDelete={handleDelete} onPin={handlePin} />)}
                    </div>
                  </section>
                )}
                {unpinned.length > 0 && (
                  <section>
                    {pinned.length > 0 && <h3 className="text-sm font-black tracking-widest uppercase text-muted-foreground mb-3">All Ideas</h3>}
                    <div className="grid sm:grid-cols-2 gap-4">
                      {unpinned.map((idea) => <IdeaCard key={idea.id} idea={idea} onDelete={handleDelete} onPin={handlePin} />)}
                    </div>
                  </section>
                )}
                {filtered.length === 0 && (
                  <p className="text-center text-muted-foreground font-medium py-10">No ideas match your search.</p>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Add Idea Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-black text-xl">Add to Swipe File</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="font-bold mb-2 block">Title <span className="text-destructive">*</span></Label>
              <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="What's this idea about?" className="border-2 border-black rounded-xl h-11" autoFocus />
            </div>
            <div>
              <Label className="font-bold mb-2 block">Notes / Body</Label>
              <Textarea value={newBody} onChange={(e) => setNewBody(e.target.value)} placeholder="Describe the idea, copy the content, write your thoughts..." className="min-h-[120px] border-2 border-black rounded-xl p-4" />
            </div>
            <div>
              <Label className="font-bold mb-2 block">Source URL <span className="text-muted-foreground font-normal text-xs">(optional)</span></Label>
              <Input value={newSourceUrl} onChange={(e) => setNewSourceUrl(e.target.value)} placeholder="https://..." className="border-2 border-black rounded-xl h-10" type="url" />
            </div>
            <div>
              <Label className="font-bold mb-2 block">Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddTag() } }} placeholder="Add a tag..." className="border-2 border-black rounded-xl h-9 flex-1" />
                <Button variant="outline" onClick={handleAddTag} className="border-2 border-black rounded-xl font-bold px-3 h-9"><Plus className="h-4 w-4" /></Button>
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                {SUGGESTED_TAGS.filter((t) => !newTags.includes(t)).map((t) => (
                  <button key={t} onClick={() => setNewTags((prev) => [...prev, t])}
                    className="text-xs font-bold px-2 py-0.5 rounded-full border border-black bg-secondary hover:bg-black hover:text-white transition-colors">
                    + {t}
                  </button>
                ))}
              </div>
              {newTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {newTags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-black text-white text-xs font-bold rounded-full">
                      {tag}
                      <button onClick={() => setNewTags((t) => t.filter((v) => v !== tag))} aria-label={`Remove ${tag}`} className="hover:opacity-70"><Trash2 className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1 border-2 border-black rounded-xl font-bold" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} className="flex-1 bg-black text-white border-2 border-black rounded-xl font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">Save Idea</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function IdeaCard({ idea, onDelete, onPin }: { idea: Idea; onDelete: (id: string) => void; onPin: (id: string, pinned: boolean) => void }) {
  return (
    <Card className="border-4 border-black rounded-xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-black text-base leading-tight flex-1">{idea.title}</h3>
        <div className="flex gap-1 shrink-0">
          <Button variant="outline" size="icon" onClick={() => onPin(idea.id, idea.pinned)} className="border-2 border-black rounded-lg h-7 w-7" aria-label={idea.pinned ? "Unpin" : "Pin"}>
            {idea.pinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
          </Button>
          <Button variant="outline" size="icon" onClick={() => onDelete(idea.id)} className="border-2 border-black rounded-lg h-7 w-7 hover:bg-destructive hover:text-white hover:border-destructive transition-colors" aria-label="Delete idea">
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
      {idea.body && <p className="text-sm text-muted-foreground font-medium line-clamp-3 leading-relaxed">{idea.body}</p>}
      {idea.sourceUrl && (
        <a href={idea.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline truncate">
          <ExternalLink className="h-3 w-3 shrink-0" />{idea.sourceUrl}
        </a>
      )}
      {idea.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {idea.tags.map((tag) => (
            <Badge key={tag} className="text-xs font-bold bg-secondary text-foreground border border-black rounded-full px-2 py-0">{tag}</Badge>
          ))}
        </div>
      )}
      <p className="text-xs text-muted-foreground font-medium mt-auto">{format(new Date(idea.createdAt), "MMM d, yyyy")}</p>
    </Card>
  )
}
