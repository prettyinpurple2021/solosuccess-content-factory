"use client"

import { useState, useEffect, useCallback } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { getDrafts, deleteDraft, type Draft } from "@/lib/storage"
import { toast } from "sonner"
import { History, Trash2, RotateCcw, FileText } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

const TYPE_COLORS: Record<Draft["type"], string> = {
  post: "bg-yellow-400 text-black border-black",
  thread: "bg-orange-400 text-black border-black",
  newsletter: "bg-amber-400 text-black border-black",
  video: "bg-red-400 text-black border-black",
  story: "bg-pink-400 text-black border-black",
  survey: "bg-purple-400 text-white border-black",
  blog: "bg-blue-400 text-black border-black",
}

interface DraftHistoryProps {
  currentType?: Draft["type"]
  onRestore: (draft: Draft) => void
}

export default function DraftHistory({ currentType, onRestore }: DraftHistoryProps) {
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [open, setOpen] = useState(false)

  const loadDrafts = useCallback(() => {
    const all = getDrafts()
    // Filter by type if provided, otherwise show all
    setDrafts(currentType ? all.filter((d) => d.type === currentType) : all)
  }, [currentType])

  useEffect(() => {
    if (open) loadDrafts()
  }, [open, loadDrafts])

  const handleRestore = (draft: Draft) => {
    onRestore(draft)
    setOpen(false)
    toast.success("Draft restored!", { description: `Loaded ${draft.type} from ${formatDistanceToNow(new Date(draft.savedAt), { addSuffix: true })}` })
  }

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    deleteDraft(id)
    setDrafts((prev) => prev.filter((d) => d.id !== id))
    toast.success("Draft deleted")
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-2 border-black rounded-xl font-bold flex gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        >
          <History className="h-4 w-4" />
          <span className="hidden sm:inline">History</span>
          {drafts.length > 0 && (
            <span className="bg-black text-white text-xs font-black rounded-full w-4 h-4 flex items-center justify-center">
              {drafts.length > 9 ? "9+" : drafts.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="border-l-4 border-black p-0 w-full sm:max-w-md">
        <SheetHeader className="p-6 border-b-4 border-black">
          <SheetTitle className="font-black text-xl flex items-center gap-2">
            <History className="h-5 w-5" />
            Draft History
          </SheetTitle>
          <p className="text-sm text-muted-foreground font-medium">
            {currentType ? `Showing ${currentType} drafts` : "All saved drafts"} — click to restore.
          </p>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-130px)]">
          {drafts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-6">
              <FileText className="h-12 w-12 opacity-20" />
              <p className="font-bold text-muted-foreground text-sm">
                No drafts saved yet. Start writing and drafts will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="divide-y-2 divide-black/10">
              {drafts.map((draft, i) => (
                <div key={draft.id}>
                  <button
                    onClick={() => handleRestore(draft)}
                    className="w-full text-left p-4 hover:bg-secondary transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={`text-xs font-black border ${TYPE_COLORS[draft.type]} px-2 py-0`}>
                          {draft.type}
                        </Badge>
                        {draft.platforms.length > 0 && (
                          <span className="text-xs text-muted-foreground font-medium">
                            {draft.platforms.join(", ")}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={(e) => handleDelete(draft.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-100 text-red-600 transition-all"
                          aria-label="Delete draft"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <RotateCcw className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <p className="text-sm font-medium line-clamp-2 text-foreground text-left">
                      {draft.body || "(empty draft)"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1.5 font-medium">
                      {formatDistanceToNow(new Date(draft.savedAt), { addSuffix: true })}
                    </p>
                  </button>
                  {i < drafts.length - 1 && <Separator className="bg-black/10" />}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
