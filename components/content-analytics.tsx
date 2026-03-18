"use client"

import { useMemo } from "react"
import { Card } from "@/components/ui/card"
import { getDrafts, getScheduledItems } from "@/lib/storage"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { FileText, CalendarCheck, Zap, TrendingUp } from "lucide-react"

const TYPE_COLORS: Record<string, string> = {
  post: "#f59e0b",
  thread: "#f97316",
  newsletter: "#eab308",
  video: "#ef4444",
  story: "#ec4899",
  survey: "#8b5cf6",
  blog: "#3b82f6",
}

const CONTENT_TYPES = ["post", "thread", "newsletter", "video", "story", "survey", "blog"]

export default function ContentAnalytics() {
  const stats = useMemo(() => {
    const drafts = getDrafts()
    const scheduled = getScheduledItems()

    const byType = CONTENT_TYPES.map((type) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      count: drafts.filter((d) => d.type === type).length,
      color: TYPE_COLORS[type],
    })).filter((t) => t.count > 0)

    // Drafts in last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const recentDrafts = drafts.filter((d) => new Date(d.savedAt) > sevenDaysAgo).length

    // Streak: consecutive days with at least one draft saved
    const daySet = new Set(drafts.map((d) => d.savedAt.slice(0, 10)))
    let streak = 0
    const today = new Date()
    for (let i = 0; i < 30; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      if (daySet.has(d.toISOString().slice(0, 10))) {
        streak++
      } else {
        break
      }
    }

    return {
      total: drafts.length,
      scheduled: scheduled.length,
      recentDrafts,
      streak,
      byType,
    }
  }, [])

  const statCards = [
    {
      label: "Total Drafts",
      value: stats.total,
      icon: <FileText className="h-5 w-5" />,
      color: "bg-yellow-400",
    },
    {
      label: "Scheduled",
      value: stats.scheduled,
      icon: <CalendarCheck className="h-5 w-5" />,
      color: "bg-orange-400",
    },
    {
      label: "This Week",
      value: stats.recentDrafts,
      icon: <TrendingUp className="h-5 w-5" />,
      color: "bg-pink-400",
    },
    {
      label: "Day Streak",
      value: `${stats.streak}d`,
      icon: <Zap className="h-5 w-5" />,
      color: "bg-blue-400",
    },
  ]

  return (
    <section aria-labelledby="analytics-heading">
      <h2 id="analytics-heading" className="text-xl sm:text-2xl font-black mb-4 tracking-tight">
        YOUR STATS
      </h2>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {statCards.map((s) => (
          <Card
            key={s.label}
            className="border-4 border-black rounded-xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-1"
          >
            <div className={`w-9 h-9 rounded-lg border-2 border-black flex items-center justify-center ${s.color}`}>
              {s.icon}
            </div>
            <p className="text-3xl font-black mt-1">{s.value}</p>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Bar chart */}
      {stats.byType.length > 0 ? (
        <Card className="border-4 border-black rounded-xl p-4 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="font-black text-sm tracking-widest uppercase text-muted-foreground mb-4">
            Drafts by Content Type
          </h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={stats.byType} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="type" tick={{ fontWeight: 700, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontWeight: 700, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                cursor={{ fill: "rgba(0,0,0,0.05)" }}
                contentStyle={{ border: "2px solid black", borderRadius: "8px", fontWeight: 700 }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
                {stats.byType.map((entry) => (
                  <Cell key={entry.type} fill={entry.color} stroke="black" strokeWidth={2} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      ) : (
        <Card className="border-4 border-black rounded-xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center gap-2 text-center">
          <TrendingUp className="h-10 w-10 opacity-20" />
          <p className="font-bold text-muted-foreground text-sm">
            Create your first draft to see your stats here.
          </p>
        </Card>
      )}
    </section>
  )
}
