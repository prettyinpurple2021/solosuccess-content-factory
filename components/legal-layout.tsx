"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

function LegalLayout({ title, subtitle, lastUpdated, children }: {
  title: string
  subtitle: string
  lastUpdated: string
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-card border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex flex-col leading-none select-none">
            <span className="text-[9px] font-black tracking-[0.25em] uppercase text-muted-foreground">SOLOSUCCESS</span>
            <span className="text-lg font-black text-brand-gradient tracking-tight leading-none">CONTENT FACTORY</span>
          </Link>
          <Button variant="outline" className="border-2 border-black rounded-xl font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]" asChild>
            <Link href="/"><ArrowLeft className="h-4 w-4 mr-2" />Back</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <div className="border-b-4 border-black bg-black text-white py-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-black tracking-widest uppercase text-white/50 mb-3">Legal</p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-brand-gradient text-balance">{title}</h1>
          <p className="mt-4 text-white/60 font-medium">{subtitle}</p>
          <p className="mt-2 text-white/40 text-sm">Last updated: {lastUpdated}</p>
        </div>
      </div>

      {/* Body */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <div className="prose-legal space-y-10">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-4 border-black bg-card py-10 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex flex-col leading-none">
            <span className="text-[9px] font-black tracking-[0.25em] uppercase text-muted-foreground">SOLOSUCCESS</span>
            <span className="text-lg font-black text-brand-gradient">CONTENT FACTORY</span>
          </Link>
          <div className="flex flex-wrap gap-6 text-sm font-bold">
            <Link href="/legal/privacy" className="hover:underline underline-offset-4">Privacy Policy</Link>
            <Link href="/legal/terms" className="hover:underline underline-offset-4">Terms of Service</Link>
            <Link href="/legal/cookies" className="hover:underline underline-offset-4">Cookie Policy</Link>
            <Link href="/auth/sign-up" className="hover:underline underline-offset-4">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-4 border-black rounded-2xl bg-card shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
      <div className="bg-[#FFD700] border-b-4 border-black px-6 py-4">
        <h2 className="text-xl font-black">{title}</h2>
      </div>
      <div className="px-6 py-6 text-[15px] leading-relaxed text-foreground space-y-3">
        {children}
      </div>
    </section>
  )
}

export { LegalLayout, Section }
