import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Home } from "lucide-react"

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background p-2 sm:p-4 md:p-8 font-sans">
      <div className="w-full max-w-7xl mx-auto bg-card border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        <header className="border-b-4 border-black p-4 sm:p-6 bg-card">
          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                  aria-label="Go back"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                  aria-label="Go home"
                >
                  <Home className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex flex-col leading-none">
                <span className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground">
                  SOLO SUCCESS
                </span>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-brand-gradient">
                  CONTENT FACTORY — STUDIO
                </h1>
              </div>
            </div>
          </div>
        </header>
        <div className="p-4 sm:p-6">{children}</div>
      </div>
    </div>
  )
}
