import Link from "next/link"
import { ArrowRight, FileText, CalendarDays, Repeat2, Lightbulb, BarChart2, BookOpen, Video, Mail, MessageSquare, LayoutDashboard, ImageIcon, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

const FEATURES = [
  {
    icon: <FileText className="h-7 w-7" />,
    title: "Post, Thread & Story Creator",
    desc: "Write punchy social posts, multi-part threads, and stories optimised for every platform — all in one editor.",
    color: "bg-[#FFD700]",
  },
  {
    icon: <Mail className="h-7 w-7" />,
    title: "Newsletter Studio",
    desc: "Craft email newsletters from subject line to sign-off. Keep your list warm without leaving the factory.",
    color: "bg-[#FFEC6E]",
  },
  {
    icon: <Video className="h-7 w-7" />,
    title: "Short-Form Video Scripts",
    desc: "Script Reels, TikToks, and YouTube Shorts in minutes. No more staring at a blank page before hitting record.",
    color: "bg-[#FF6B6B]",
  },
  {
    icon: <BookOpen className="h-7 w-7" />,
    title: "Blog Post Builder",
    desc: "Title, meta description, cover image, body, and SEO tags — everything a published blog post needs, in one place.",
    color: "bg-[#FF2D78]",
  },
  {
    icon: <BarChart2 className="h-7 w-7" />,
    title: "Surveys & Polls",
    desc: "Ask your audience the right questions and validate your next offer before you build it.",
    color: "bg-[#FFD700]",
  },
  {
    icon: <Repeat2 className="h-7 w-7" />,
    title: "One-Click Repurpose",
    desc: "Paste any piece of content and instantly get 6 platform-ready reformats — post, thread, newsletter, script, and more.",
    color: "bg-[#FFEC6E]",
  },
  {
    icon: <CalendarDays className="h-7 w-7" />,
    title: "Content Calendar",
    desc: "Plan your entire month at a glance. Schedule content to any connected platform without juggling tabs.",
    color: "bg-[#FF6B6B]",
  },
  {
    icon: <Lightbulb className="h-7 w-7" />,
    title: "Ideas / Swipe File",
    desc: "Capture inspiration the moment it strikes. Tag, pin, and search your entire swipe file in seconds.",
    color: "bg-[#FF2D78]",
  },
]

const STATS = [
  { value: "7", label: "Content formats in one tool" },
  { value: "4", label: "Platforms, one dashboard" },
  { value: "1-click", label: "Repurpose any content" },
  { value: "100%", label: "Built for solopreneurs" },
]

const CONTENT_TYPES = [
  "Social Post", "Thread", "Newsletter", "Short Video", "Story", "Survey", "Blog Post",
]

const TESTIMONIALS = [
  {
    quote: "I used to jump between 6 different tools. Now everything lives in one place. My content output doubled in the first week.",
    name: "Jordan M.",
    role: "Indie SaaS Founder",
  },
  {
    quote: "The repurpose feature alone is worth it. I write one LinkedIn post and get a full week of content across every platform.",
    name: "Priya S.",
    role: "Solo Business Coach",
  },
  {
    quote: "As a one-person brand, I needed something that just worked. This is the content OS I didn't know I needed.",
    name: "Alex T.",
    role: "Creator & Consultant",
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background font-sans">

      {/* ─── Navbar ─── */}
      <header className="sticky top-0 z-50 bg-card border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex flex-col leading-none select-none">
            <span className="text-[9px] font-black tracking-[0.25em] uppercase text-muted-foreground">SOLOSUCCESS</span>
            <span className="text-lg font-black text-brand-gradient tracking-tight leading-none">CONTENT FACTORY</span>
          </div>
          <nav className="hidden md:flex items-center gap-6" aria-label="Site navigation">
            {["Features", "How It Works", "Pricing"].map((label) => (
              <a key={label} href={`#${label.toLowerCase().replace(/\s/g, "-")}`} className="font-bold text-sm hover:underline underline-offset-4">
                {label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-2 border-black rounded-xl font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hidden sm:inline-flex" asChild>
              <Link href="/auth/login">Log In</Link>
            </Button>
            <Button className="bg-black text-white border-2 border-black rounded-xl font-bold shadow-[4px_4px_0px_0px_rgba(255,45,120,1)] hover:shadow-[2px_2px_0px_0px_rgba(255,45,120,1)] hover:translate-y-0.5 transition-all" asChild>
              <Link href="/auth/sign-up">Start Free <ArrowRight className="h-4 w-4 ml-1" /></Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden border-b-4 border-black bg-card/80 backdrop-blur-[1px]">

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28 lg:py-36">
          <div className="max-w-4xl">
            {/* Tag */}
            <div className="inline-flex items-center gap-2 bg-[#FFD700] border-2 border-black rounded-full px-4 py-1.5 mb-8 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <LayoutDashboard className="h-4 w-4" />
              <span className="text-xs font-black tracking-widest uppercase">The solo founder's content OS</span>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] text-balance mb-8">
              CREATE.{" "}
              <span className="text-brand-gradient">PUBLISH.</span>
              <br />
              GROW — SOLO.
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl font-medium text-muted-foreground max-w-2xl leading-relaxed mb-10 text-balance">
              SoloSuccess Content Factory is the all-in-one content workspace built for one-person businesses. Write, schedule, repurpose, and publish — without a team.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-brand-gradient-metallic text-white border-4 border-black rounded-2xl font-black text-lg h-14 px-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 transition-all"
                asChild
              >
                <Link href="/auth/sign-up">Start for Free <ArrowRight className="h-5 w-5 ml-2" /></Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-4 border-black rounded-2xl font-black text-lg h-14 px-8 bg-card shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 transition-all"
                asChild
              >
                <Link href="/auth/login">Log In</Link>
              </Button>
            </div>
          </div>

          {/* Content type badges */}
          <div className="flex flex-wrap gap-3 mt-14" aria-label="Supported content types">
            {CONTENT_TYPES.map((type, i) => (
              <span
                key={type}
                className="border-2 border-black rounded-xl px-4 py-2 text-sm font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                style={{ background: i % 2 === 0 ? "#FFD700" : "#fff" }}
              >
                {type}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Stats bar ─── */}
      <section className="bg-black text-white border-b-4 border-black" aria-label="Key statistics">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x-2 divide-white/10">
            {STATS.map((s) => (
              <div key={s.label} className="py-8 px-6 text-center">
                <p className="text-3xl sm:text-4xl font-black text-brand-gradient">{s.value}</p>
                <p className="text-sm font-medium text-white/60 mt-1 text-balance">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="py-20 md:py-28 border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-14">
            <span className="text-xs font-black tracking-widest uppercase text-muted-foreground">Everything you need</span>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight mt-2 text-balance">
              YOUR ENTIRE CONTENT OPERATION,<br className="hidden md:block" />{" "}
              <span className="text-brand-gradient">IN ONE FACTORY.</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="border-4 border-black rounded-2xl p-6 bg-card shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-4 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                <div className={`w-12 h-12 ${f.color} border-2 border-black rounded-xl flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]`}>
                  {f.icon}
                </div>
                <h3 className="font-black text-lg leading-snug">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed flex-1">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section id="how-it-works" className="py-20 md:py-28 border-b-4 border-black bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-14">
            <span className="text-xs font-black tracking-widest uppercase text-muted-foreground">Simple by design</span>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight mt-2 text-balance">HOW IT WORKS</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Create Your Account", desc: "Sign up in seconds. No credit card required. Your workspace is ready immediately.", color: "bg-[#FFD700]" },
              { step: "02", title: "Connect Your Platforms", desc: "Link Instagram, Twitter, LinkedIn, and YouTube. All your channels, one command centre.", color: "bg-[#FF6B6B]" },
              { step: "03", title: "Create, Repurpose & Publish", desc: "Write content once, repurpose it everywhere, and schedule posts without leaving the app.", color: "bg-[#FF2D78]" },
            ].map((s) => (
              <div key={s.step} className="border-4 border-black rounded-2xl bg-card p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-4">
                <span className={`text-5xl font-black ${s.color.replace("bg-", "text-[")}]`} style={{ color: s.color === "bg-[#FFD700]" ? "#FFD700" : s.color === "bg-[#FF6B6B]" ? "#FF6B6B" : "#FF2D78" }}>
                  {s.step}
                </span>
                <h3 className="text-2xl font-black">{s.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="py-20 md:py-28 border-b-4 border-black bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-14">
            <span className="text-xs font-black tracking-widest uppercase text-muted-foreground">Social proof</span>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight mt-2">SOLO FOUNDERS LOVE IT</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="border-4 border-black rounded-2xl p-8 bg-secondary shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-6">
                <p className="text-lg font-medium leading-relaxed flex-1">{`"${t.quote}"`}</p>
                <div className="flex items-center gap-3 border-t-2 border-black pt-4">
                  <div className="w-10 h-10 bg-brand-gradient-metallic rounded-full border-2 border-black flex items-center justify-center text-white font-black text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-black text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section id="pricing" className="py-20 md:py-28 border-b-4 border-black bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-14 text-center">
            <span className="text-xs font-black tracking-widest uppercase text-muted-foreground">Simple pricing</span>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight mt-2">ONE PLAN. EVERYTHING INCLUDED.</h2>
            <p className="text-muted-foreground mt-4 text-lg max-w-xl mx-auto">No feature gating. No seat limits. Everything a solo founder needs from day one.</p>
          </div>

          <div className="max-w-lg mx-auto border-4 border-black rounded-3xl bg-card shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
            <div className="bg-brand-gradient-metallic p-8">
              <p className="text-white font-black text-sm tracking-widest uppercase">Solo Plan</p>
              <p className="text-white text-6xl font-black mt-2">Free</p>
              <p className="text-white/80 mt-1 font-medium">during early access</p>
            </div>
            <div className="p-8 space-y-4">
              {[
                "All 7 content types",
                "Content Calendar",
                "Repurpose Engine",
                "Ideas / Swipe File",
                "4 platform connections",
                "Draft autosave",
                "Full account + data sync",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                  <span className="font-bold">{item}</span>
                </div>
              ))}

              <Button
                size="lg"
                className="w-full mt-4 bg-black text-white border-4 border-black rounded-2xl font-black text-lg h-14 shadow-[6px_6px_0px_0px_rgba(255,45,120,1)] hover:shadow-[3px_3px_0px_0px_rgba(255,45,120,1)] hover:translate-y-1 transition-all"
                asChild
              >
                <Link href="/auth/sign-up">Get Started Free <ArrowRight className="h-5 w-5 ml-2" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="py-20 md:py-28 bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight text-brand-gradient text-balance mb-6">
            STOP JUGGLING TOOLS. START SHIPPING CONTENT.
          </h2>
          <p className="text-white/60 text-xl max-w-xl mx-auto mb-10 leading-relaxed">
            Join solo founders who build their audience with SoloSuccess Content Factory.
          </p>
          <Button
            size="lg"
            className="bg-brand-gradient-metallic text-white border-4 border-white rounded-2xl font-black text-xl h-16 px-12 shadow-[6px_6px_0px_0px_rgba(255,255,255,0.3)] hover:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.3)] hover:translate-y-1 transition-all"
            asChild
          >
            <Link href="/auth/sign-up">Create Your Free Account <ArrowRight className="h-6 w-6 ml-2" /></Link>
          </Button>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t-4 border-black bg-card py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col leading-none">
            <span className="text-[9px] font-black tracking-[0.25em] uppercase text-muted-foreground">SOLOSUCCESS</span>
            <span className="text-lg font-black text-brand-gradient">CONTENT FACTORY</span>
          </div>
          <p className="text-sm text-muted-foreground font-medium">
            Built for the one-person business. Ship great content, solo.
          </p>
          <div className="flex flex-wrap gap-4 text-sm font-bold">
            <Link href="/auth/login" className="hover:underline underline-offset-4">Log In</Link>
            <Link href="/auth/sign-up" className="hover:underline underline-offset-4">Sign Up</Link>
            <Link href="/legal/privacy" className="hover:underline underline-offset-4 text-muted-foreground">Privacy</Link>
            <Link href="/legal/terms" className="hover:underline underline-offset-4 text-muted-foreground">Terms</Link>
            <Link href="/legal/cookies" className="hover:underline underline-offset-4 text-muted-foreground">Cookies</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
