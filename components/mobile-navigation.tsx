import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Instagram, Linkedin, Twitter, Youtube, LayoutDashboard, CalendarDays, Repeat2, Lightbulb } from "lucide-react"

const navItems = [
  { label: "Dashboard", href: "#", icon: <LayoutDashboard className="h-5 w-5" />, active: true },
  { label: "Content Calendar", href: "#", icon: <CalendarDays className="h-5 w-5" /> },
  { label: "Repurpose", href: "#", icon: <Repeat2 className="h-5 w-5" /> },
  { label: "Ideas / Swipe File", href: "#", icon: <Lightbulb className="h-5 w-5" /> },
]

export default function MobileNavigation() {
  return (
    <div className="h-full bg-card flex flex-col">
      {/* Brand header */}
      <div className="p-6 border-b-4 border-black">
        <span className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground block">
          SOLO SUCCESS
        </span>
        <h2 className="text-2xl font-black bg-brand-gradient-metallic bg-clip-text text-transparent leading-tight">
          CONTENT FACTORY
        </h2>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {/* Nav links */}
        <nav className="space-y-1 mb-8" aria-label="Mobile navigation">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 text-base font-bold p-3 rounded-xl transition-colors ${
                item.active
                  ? "bg-brand-gradient-metallic text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
                  : "hover:bg-black/8 text-foreground"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Platforms */}
        <div>
          <h3 className="text-xs font-black tracking-widest uppercase text-muted-foreground mb-3">Platforms</h3>
          <div className="space-y-2">
            {[
              { icon: <Instagram className="h-4 w-4" />, label: "Instagram" },
              { icon: <Twitter className="h-4 w-4" />, label: "Twitter / X" },
              { icon: <Linkedin className="h-4 w-4" />, label: "LinkedIn" },
              { icon: <Youtube className="h-4 w-4" />, label: "YouTube" },
            ].map((p) => (
              <Button
                key={p.label}
                variant="outline"
                className="w-full justify-start gap-2 rounded-xl border-2 border-black font-bold text-sm"
              >
                {p.icon} {p.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="p-4 border-t-4 border-black">
        <div className="grid grid-cols-2 gap-2">
          <Button className="bg-black hover:bg-black/80 text-white rounded-xl border-2 border-black font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            Connect
          </Button>
          <Button
            variant="outline"
            className="rounded-xl border-2 border-black font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
          >
            Settings
          </Button>
        </div>
      </div>
    </div>
  )
}
