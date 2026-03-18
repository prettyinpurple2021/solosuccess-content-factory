"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Instagram, Linkedin, Twitter, Youtube, LayoutDashboard, CalendarDays, Repeat2, Lightbulb, CheckCircle2 } from "lucide-react"
import { useEffect, useState } from "react"
import { getConnectedPlatforms, type ConnectedPlatform } from "@/lib/storage"

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: "Content Calendar", href: "/calendar", icon: <CalendarDays className="h-5 w-5" /> },
  { label: "Repurpose", href: "/repurpose", icon: <Repeat2 className="h-5 w-5" /> },
  { label: "Ideas / Swipe File", href: "/ideas", icon: <Lightbulb className="h-5 w-5" /> },
]

const PLATFORM_DISPLAY = [
  { key: "instagram" as const, icon: <Instagram className="h-4 w-4" />, label: "Instagram" },
  { key: "twitter" as const, icon: <Twitter className="h-4 w-4" />, label: "Twitter / X" },
  { key: "linkedin" as const, icon: <Linkedin className="h-4 w-4" />, label: "LinkedIn" },
  { key: "youtube" as const, icon: <Youtube className="h-4 w-4" />, label: "YouTube" },
]

export default function MobileNavigation() {
  const pathname = usePathname()
  const [platforms, setPlatforms] = useState<ConnectedPlatform[]>([])

  useEffect(() => {
    setPlatforms(getConnectedPlatforms())
  }, [])

  return (
    <div className="h-full bg-card flex flex-col">
      {/* Brand header */}
      <div className="p-6 border-b-4 border-black">
        <span className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground block">
          SOLO SUCCESS
        </span>
        <h2 className="text-2xl font-black text-brand-gradient leading-tight">
          CONTENT FACTORY
        </h2>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {/* Nav links */}
        <nav className="space-y-1 mb-8" aria-label="Mobile navigation">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 text-base font-bold p-3 rounded-xl transition-colors ${
                  isActive
                    ? "bg-brand-gradient-metallic text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
                    : "hover:bg-black/5 text-foreground"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Platforms */}
        <div>
          <h3 className="text-xs font-black tracking-widest uppercase text-muted-foreground mb-3">Platforms</h3>
          <div className="space-y-2">
            {PLATFORM_DISPLAY.map((p) => {
              const conn = platforms.find((c) => c.key === p.key)
              return (
                <Button
                  key={p.key}
                  variant="outline"
                  className="w-full justify-start gap-2 rounded-xl border-2 border-black font-bold text-sm"
                  asChild
                >
                  <Link href="/">
                    {p.icon}
                    <span className="flex-1 text-left">{conn ? conn.username : p.label}</span>
                    {conn && <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />}
                  </Link>
                </Button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="p-4 border-t-4 border-black">
        <Button className="w-full bg-black hover:bg-black/80 text-white rounded-xl border-2 border-black font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]" asChild>
          <Link href="/">Connect Account</Link>
        </Button>
      </div>
    </div>
  )
}
