"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Toaster } from "@/components/ui/toaster"
import { toast } from "@/components/ui/use-toast"
import {
  LayoutDashboard, CalendarDays, Repeat2, Lightbulb, ChevronLeft,
  ChevronRight, Plus, Trash2, Menu, FileText, Mail, Video, Image, BarChart2, BookOpen,
} from "lucide-react"
import MobileNavigation from "@/components/mobile-navigation"
import {
  getScheduledItems, deleteScheduledItem, type ScheduledItem,
} from "@/lib/storage"
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay,
  addMonths, subMonths, getDay, isBefore, startOfDay,
} from "date-fns"

const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: "Content Calendar", href: "/calendar", icon: <CalendarDays className="h-5 w-5" /> },
  { label: "Repurpose", href: "/repurpose", icon: <Repeat2 className="h-5 w-5" /> },
  { label: "Ideas / Swipe File", href: "/ideas", icon: <Lightbulb className="h-5 w-5" /> },
]

const TYPE_ICONS: Record<string, React.ReactNode> = {
  post: <FileText className="h-3 w-3" />,
  thread: <FileText className="h-3 w-3" />,
  newsletter: <Mail className="h-3 w-3" />,
  video: <Video className="h-3 w-3" />,
  story: <Image className="h-3 w-3" />,
  survey: <BarChart2 className="h-3 w-3" />,
  blog: <BookOpen className="h-3 w-3" />,
}

const TYPE_COLORS: Record<string, string> = {
  post: "bg-yellow-400 text-black border-black",
  thread: "bg-orange-400 text-black border-black",
  newsletter: "bg-blue-400 text-white border-black",
  video: "bg-red-400 text-white border-black",
  story: "bg-pink-400 text-white border-black",
  survey: "bg-green-400 text-black border-black",
  blog: "bg-purple-400 text-white border-black",
}

export default function CalendarPage() {
  const pathname = usePathname()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [items, setItems] = useState<ScheduledItem[]>([])
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [dayItems, setDayItems] = useState<ScheduledItem[]>([])
  const [dayDialogOpen, setDayDialogOpen] = useState(false)

  const reload = useCallback(() => setItems(getScheduledItems()), [])

  useEffect(() => { reload() }, [reload])

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Leading blank cells so week starts on Sunday
  const leadingBlanks = getDay(monthStart)

  const itemsForDay = (day: Date) =>
    items.filter((item) => isSameDay(new Date(item.scheduledFor), day))

  const openDay = (day: Date) => {
    setSelectedDay(day)
    setDayItems(itemsForDay(day))
    setDayDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    deleteScheduledItem(id)
    reload()
    setDayItems((prev) => prev.filter((i) => i.id !== id))
    toast({ title: "Scheduled item removed" })
  }

  const today = startOfDay(new Date())

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4 md:p-8 font-sans">
      <Toaster />
      <div className="w-full max-w-7xl mx-auto bg-card border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">

        {/* Header */}
        <header className="border-b-4 border-black p-4 sm:p-6 bg-card">
          <div className="flex justify-between items-center gap-4">
            <div className="flex flex-col leading-none">
              <span className="text-xs font-black tracking-[0.2em] uppercase text-muted-foreground">SOLO SUCCESS</span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-brand-gradient">CONTENT FACTORY</h1>
            </div>
            <div className="flex md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="border-r-4 border-black p-0 w-72">
                  <MobileNavigation />
                </SheetContent>
              </Sheet>
            </div>
            <Button className="hidden sm:flex bg-black hover:bg-black/80 text-white rounded-xl border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] gap-2" asChild>
              <Link href="/"><Plus className="h-4 w-4" /> Create Content</Link>
            </Button>
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

            {/* Legend */}
            <div>
              <h3 className="text-xs font-black tracking-widest uppercase text-muted-foreground mb-3">Content Types</h3>
              <div className="space-y-2">
                {Object.entries(TYPE_COLORS).map(([type, cls]) => (
                  <div key={type} className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-bold ${cls}`}>
                      {TYPE_ICONS[type]} {type}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-auto border-2 border-black rounded-xl p-3 bg-card">
              <p className="text-xs font-bold text-muted-foreground leading-relaxed">
                {items.length} item{items.length !== 1 ? "s" : ""} scheduled this month.
              </p>
            </div>
          </aside>

          {/* Calendar main */}
          <main className="p-4 sm:p-6">
            {/* Month nav */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black tracking-tight">
                {format(currentMonth, "MMMM yyyy").toUpperCase()}
              </h2>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} aria-label="Previous month">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button variant="outline" className="border-2 border-black rounded-xl font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] px-4" onClick={() => setCurrentMonth(new Date())}>
                  Today
                </Button>
                <Button variant="outline" size="icon" className="border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} aria-label="Next month">
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Day-of-week headers */}
            <div className="grid grid-cols-7 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="text-center text-xs font-black tracking-widest uppercase text-muted-foreground py-2">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 border-t-2 border-l-2 border-black">
              {/* Leading blanks */}
              {Array.from({ length: leadingBlanks }).map((_, i) => (
                <div key={`blank-${i}`} className="border-b-2 border-r-2 border-black min-h-[80px] bg-muted/30" />
              ))}

              {days.map((day) => {
                const dayScheduled = itemsForDay(day)
                const isPast = isBefore(startOfDay(day), today)
                const isToday = isSameDay(day, today)

                return (
                  <div
                    key={day.toISOString()}
                    onClick={() => openDay(day)}
                    className={`border-b-2 border-r-2 border-black min-h-[80px] p-1 cursor-pointer transition-colors ${isPast ? "bg-muted/20" : "hover:bg-secondary"} ${isToday ? "bg-yellow-50" : ""}`}
                  >
                    <div className={`text-xs font-black mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? "bg-black text-white" : "text-foreground"}`}>
                      {format(day, "d")}
                    </div>
                    <div className="space-y-0.5">
                      {dayScheduled.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-0.5 truncate ${TYPE_COLORS[item.type] ?? "bg-secondary text-foreground border-black"}`}
                        >
                          {TYPE_ICONS[item.type]}
                          <span className="truncate">{item.title}</span>
                        </div>
                      ))}
                      {dayScheduled.length > 3 && (
                        <div className="text-[10px] font-bold text-muted-foreground px-1">
                          +{dayScheduled.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </main>
        </div>
      </div>

      {/* Day detail dialog */}
      <Dialog open={dayDialogOpen} onOpenChange={setDayDialogOpen}>
        <DialogContent className="border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md">
          <DialogHeader>
            <DialogTitle className="font-black text-xl">
              {selectedDay ? format(selectedDay, "EEEE, MMMM d, yyyy") : ""}
            </DialogTitle>
          </DialogHeader>
          {dayItems.length === 0 ? (
            <div className="py-8 flex flex-col items-center gap-3">
              <p className="text-muted-foreground font-medium text-sm">Nothing scheduled for this day.</p>
              <Button className="bg-black text-white border-2 border-black rounded-xl font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]" asChild>
                <Link href="/" onClick={() => setDayDialogOpen(false)}><Plus className="h-4 w-4 mr-2" /> Create Content</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {dayItems.map((item) => (
                <div key={item.id} className="flex items-start gap-3 p-3 border-2 border-black rounded-xl bg-secondary">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={`text-xs font-bold border ${TYPE_COLORS[item.type] ?? ""}`}>
                        {item.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground font-medium">
                        {format(new Date(item.scheduledFor), "h:mm a")}
                      </span>
                    </div>
                    <p className="text-sm font-bold truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.platforms.join(", ") || "No platforms"}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-2 border-black rounded-lg h-8 w-8 shrink-0 hover:bg-destructive hover:text-white hover:border-destructive transition-colors"
                    onClick={() => handleDelete(item.id)}
                    aria-label="Delete scheduled item"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              <Button className="w-full bg-black text-white border-2 border-black rounded-xl font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]" asChild>
                <Link href="/" onClick={() => setDayDialogOpen(false)}><Plus className="h-4 w-4 mr-2" /> Add to This Day</Link>
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
