"use client"

import { useState, useRef } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ImageIcon, Plus, Send, Trash2, XCircle, BookOpen, Tag } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { saveDraft } from "@/lib/storage"
import type { ScheduleButtonProps } from "./types"

interface BlogCreatorProps {
  ScheduleButton: React.FC<ScheduleButtonProps>
  onBodyChange: (body: string) => void
}

export default function BlogCreator({ ScheduleButton, onBodyChange }: BlogCreatorProps) {
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

  return (
    <>
      <div className="space-y-4 mb-4">
        <div>
          <Label className="font-bold mb-2 block flex items-center gap-2"><BookOpen className="h-4 w-4" /> Blog Title</Label>
          <Input value={blogTitle} onChange={(e) => setBlogTitle(e.target.value)}
            placeholder="Write a title that makes people stop scrolling..." className="border-2 border-black rounded-xl h-11 text-base" />
        </div>
        <div>
          <Label className="font-bold mb-2 block">Meta Description <span className="text-muted-foreground font-normal text-xs">({blogMeta.length}/150 chars, SEO)</span></Label>
          <Input value={blogMeta} onChange={(e) => setBlogMeta(e.target.value)}
            placeholder="One-line summary shown in search results..." className="border-2 border-black rounded-xl h-11" maxLength={150} />
        </div>
        <div>
          <Label className="font-bold mb-2 block">Cover Image</Label>
          {blogCoverPreview ? (
            <div className="relative rounded-xl overflow-hidden border-2 border-black">
              <img src={blogCoverPreview} alt="Blog cover preview" className="w-full max-h-56 object-cover" />
              <button onClick={() => { setBlogCoverPreview(null); if (blogCoverInputRef.current) blogCoverInputRef.current.value = "" }}
                className="absolute top-2 right-2 bg-black text-white rounded-full p-1" aria-label="Remove cover image">
                <XCircle className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-black rounded-xl p-8 text-center cursor-pointer hover:bg-muted transition-colors"
              onClick={() => blogCoverInputRef.current?.click()}>
              <ImageIcon className="mx-auto h-8 w-8 mb-2 opacity-40" />
              <p className="text-sm font-bold">Drop cover image or <span className="underline">browse</span></p>
              <p className="text-xs text-muted-foreground mt-1">Recommended: 1200 x 630px</p>
            </div>
          )}
          <input ref={blogCoverInputRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) setBlogCoverPreview(URL.createObjectURL(f)) }} />
        </div>
        <div>
          <Label className="font-bold mb-2 block">Body</Label>
          <Textarea value={blogBody} onChange={(e) => { setBlogBody(e.target.value); onBodyChange(e.target.value) }}
            placeholder="Start writing your blog post here..." className="min-h-[200px] border-2 border-black rounded-xl p-4 text-base" />
          <p className="text-xs text-muted-foreground mt-1 font-medium">{blogBody.split(/\s+/).filter(Boolean).length} words</p>
        </div>
        <div>
          <Label className="font-bold mb-2 block flex items-center gap-2"><Tag className="h-4 w-4" /> Tags <span className="text-muted-foreground font-normal text-xs">({blogTags.length}/10)</span></Label>
          <div className="flex gap-2 mb-2">
            <Input value={blogTagInput} onChange={(e) => setBlogTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addBlogTag() } }}
              placeholder="e.g. solofounder, marketing..." className="border-2 border-black rounded-xl h-10 flex-1" />
            <Button variant="outline" className="border-2 border-black rounded-xl font-bold px-4" onClick={addBlogTag} type="button">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {blogTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {blogTags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-black text-white text-xs font-bold rounded-full">
                  {tag}
                  <button onClick={() => setBlogTags((t) => t.filter((v) => v !== tag))} aria-label={`Remove tag ${tag}`} className="ml-1 hover:opacity-70">
                    <Trash2 className="h-3 w-3" />
                  </button>
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
        <Button variant="outline" className="border-2 border-black rounded-xl font-bold flex gap-2 h-12"
          onClick={() => { saveDraft({ type: "blog", body: blogBody, title: blogTitle, platforms: [] }); toast({ title: "Draft saved" }) }}>
          <Send className="h-5 w-5" /> Save Draft
        </Button>
      </div>
    </>
  )
}
