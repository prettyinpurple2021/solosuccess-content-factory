"use client"

import { useState, useEffect, useCallback } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Instagram,
  Linkedin,
  Menu,
  Plus,
  Twitter,
  Youtube,
  LayoutDashboard,
  CalendarDays,
  Repeat2,
  Lightbulb,
  CheckCircle2,
  Loader2,
  BookOpen,
  Rss,
} from "lucide-react"

// Inline SVGs for platforms without lucide icons
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden="true">
    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.884v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
  </svg>
)

const BlueSkyIcon = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden="true">
    <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.204-.659-.299-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8z"/>
  </svg>
)

const RedditIcon = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden="true">
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
  </svg>
)

const BlogIcon = () => <BookOpen className="h-6 w-6" />
import SocialMediaCard from "@/components/social-media-card"
import ContentCreator from "@/components/content-creator"
import ContentAnalytics from "@/components/content-analytics"
import StudioSelector from "@/components/studio-selector"
import MobileNavigation from "@/components/mobile-navigation"
import UserMenu from "@/components/user-menu"
import OnboardingDialog from "@/components/onboarding-dialog"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { createClient } from "@/lib/supabase/client"
import type { PlatformKey } from "@/lib/storage"

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: "Content Calendar", href: "/calendar", icon: <CalendarDays className="h-5 w-5" /> },
  { label: "Repurpose", href: "/repurpose", icon: <Repeat2 className="h-5 w-5" /> },
  { label: "Ideas / Swipe File", href: "/ideas", icon: <Lightbulb className="h-5 w-5" /> },
]

const PLATFORM_DEFS: {
  key: PlatformKey
  label: string
  color: string
  icon: React.ReactNode
  placeholder: string
}[] = [
  { key: "instagram", label: "Instagram", color: "bg-gradient-to-br from-yellow-400 to-pink-500", icon: <Instagram className="h-6 w-6" />, placeholder: "@yourbrand" },
  { key: "twitter", label: "Twitter / X", color: "bg-gradient-to-br from-pink-400 to-rose-600", icon: <Twitter className="h-6 w-6" />, placeholder: "@yourbrand" },
  { key: "linkedin", label: "LinkedIn", color: "bg-gradient-to-br from-yellow-500 to-orange-500", icon: <Linkedin className="h-6 w-6" />, placeholder: "Your Name / Company" },
  { key: "youtube", label: "YouTube", color: "bg-gradient-to-br from-red-500 to-rose-700", icon: <Youtube className="h-6 w-6" />, placeholder: "@yourchannel" },
  { key: "facebook", label: "Facebook", color: "bg-gradient-to-br from-blue-500 to-blue-700", icon: <FacebookIcon />, placeholder: "Your Page Name" },
  { key: "bluesky", label: "BlueSky", color: "bg-gradient-to-br from-sky-400 to-cyan-600", icon: <BlueSkyIcon />, placeholder: "@you.bsky.social" },
  { key: "reddit", label: "Reddit", color: "bg-gradient-to-br from-orange-500 to-red-600", icon: <RedditIcon />, placeholder: "r/yoursubreddit or u/yourname" },
  { key: "blog", label: "Blog", color: "bg-gradient-to-br from-amber-400 to-yellow-600", icon: <BlogIcon />, placeholder: "https://yourblog.com" },
  { key: "myapp", label: "My App / Site Feed", color: "bg-gradient-to-br from-violet-500 to-indigo-700", icon: <Rss className="h-6 w-6" />, placeholder: "https://yourapp.com/feed or RSS URL" },
]

type ConnectedRow = { platform_key: string; username: string }

export default function Dashboard() {
  const pathname = usePathname()
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string>("")
  const [platforms, setPlatforms] = useState<ConnectedRow[]>([])
  const [connectDialogOpen, setConnectDialogOpen] = useState(false)
  const [connectTarget, setConnectTarget] = useState<(typeof PLATFORM_DEFS)[0] | null>(null)
  const [usernameInput, setUsernameInput] = useState("")
  const [connecting, setConnecting] = useState(false)
  const [connected, setConnected] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [userId, setUserId] = useState("")

  // Load user + connected platforms from Supabase
  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUserEmail(user.email ?? "")
      setUserId(user.id)
      // Check onboarding status
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarded, display_name")
        .eq("id", user.id)
        .single()
      if (profile && !profile.onboarded) {
        setShowOnboarding(true)
      }
      if (profile?.display_name) {
        setUserEmail(profile.display_name)
      }
      const { data } = await supabase
        .from("connected_platforms")
        .select("platform_key, username")
        .eq("user_id", user.id)
      setPlatforms(data ?? [])
    }
    load()
  }, [router])

  const openConnectDialog = useCallback((def: (typeof PLATFORM_DEFS)[0]) => {
    setConnectTarget(def)
    setUsernameInput("")
    setConnected(false)
    setConnectDialogOpen(true)
  }, [])

  const handleConnect = useCallback(async () => {
    if (!connectTarget || !usernameInput.trim()) return
    setConnecting(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await new Promise((r) => setTimeout(r, 800))
    const { error } = await supabase
      .from("connected_platforms")
      .upsert({
        user_id: user.id,
        platform_key: connectTarget.key,
        username: usernameInput.trim(),
      }, { onConflict: "user_id,platform_key" })
    if (error) {
      toast.error("Error connecting", { description: error.message })
      setConnecting(false)
      return
    }
    const { data } = await supabase.from("connected_platforms").select("platform_key, username").eq("user_id", user.id)
    setPlatforms(data ?? [])
    setConnecting(false)
    setConnected(true)
    toast.success(`${connectTarget.label} connected`, { description: `${usernameInput.trim()} is now linked.` })
    setTimeout(() => setConnectDialogOpen(false), 1200)
  }, [connectTarget, usernameInput])

  const handleDisconnect = useCallback(async (key: PlatformKey) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from("connected_platforms").delete().eq("user_id", user.id).eq("platform_key", key)
    setPlatforms((prev) => prev.filter((p) => p.platform_key !== key))
    const def = PLATFORM_DEFS.find((p) => p.key === key)
    toast.success(`${def?.label ?? key} disconnected`)
  }, [])

  const getConnected = (key: PlatformKey) => platforms.find((p) => p.platform_key === key)

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4 md:p-8 font-sans">
      <OnboardingDialog
        open={showOnboarding}
        userId={userId}
        onComplete={(name) => { setShowOnboarding(false); setUserEmail(name); toast.success(`Welcome, ${name}! Let's start creating.`) }}
      />
      <div className="w-full max-w-7xl mx-auto bg-card border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-visible">

        {/* Header */}
        <header className="border-b-4 border-black p-4 sm:p-6 bg-card">
          <div className="flex justify-between items-center gap-4">
            <div className="flex flex-col leading-none">
              <span className="text-xs font-black tracking-[0.2em] uppercase text-muted-foreground">SOLOSUCCESS</span>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-brand-gradient">CONTENT FACTORY</h1>
            </div>

            {/* Mobile menu */}
            <div className="flex md:hidden gap-2 items-center">
              {userEmail && <UserMenu email={userEmail} />}
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

            {/* Desktop actions */}
            <div className="hidden md:flex items-center gap-3">
              <Button
                className="bg-black hover:bg-black/80 text-white rounded-xl border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                onClick={() => openConnectDialog(PLATFORM_DEFS[0])}
              >
                Connect Account
              </Button>
              {userEmail && <UserMenu email={userEmail} />}
            </div>
          </div>
        </header>

        <div className="grid md:grid-cols-[260px_1fr] min-h-[calc(100vh-6rem)]">

          {/* Sidebar */}
          <aside className="hidden md:flex flex-col border-r-4 border-black bg-secondary p-4 gap-8 sticky top-0 self-start h-screen overflow-y-auto">
            <nav className="space-y-1" aria-label="Main navigation">
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

            <div>
              <h2 className="text-sm font-black tracking-widest uppercase text-muted-foreground mb-3">Platforms</h2>
              <div className="space-y-2">
                {PLATFORM_DEFS.map((p) => {
                  const conn = getConnected(p.key)
                  return (
                    <Button
                      key={p.key}
                      variant="outline"
                      onClick={() => !conn && openConnectDialog(p)}
                      className={`w-full justify-start gap-2 rounded-xl border-2 border-black font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${conn ? "opacity-100" : "opacity-60"}`}
                    >
                      {p.icon}
                      <span className="flex-1 text-left">{conn ? conn.username : p.label}</span>
                      {conn && <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />}
                    </Button>
                  )
                })}
              </div>
            </div>

            <div className="mt-auto border-2 border-black rounded-xl p-3 bg-card">
              <p className="text-xs font-bold text-muted-foreground leading-relaxed text-balance">
                Built for solo founders who create, publish, and grow — all on their own.
              </p>
            </div>
          </aside>

          {/* Main */}
          <main className="min-h-0 p-4 sm:p-6 pb-16">

            {/* Connected accounts */}
            <section className="mb-8" aria-labelledby="accounts-heading">
              <h2 id="accounts-heading" className="text-xl sm:text-2xl font-black mb-4 tracking-tight">CONNECTED ACCOUNTS</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {PLATFORM_DEFS.map((def) => {
                  const conn = getConnected(def.key)
                  return (
                    <SocialMediaCard
                      key={def.key}
                      platform={def.label}
                      platformKey={def.key}
                      username={conn?.username ?? ""}
                      icon={def.icon}
                      color={def.color}
                      connected={!!conn}
                      onConnect={() => openConnectDialog(def)}
                      onDisconnect={() => handleDisconnect(def.key)}
                    />
                  )
                })}
                <button
                  onClick={() => { setConnectTarget(null); setConnectDialogOpen(true) }}
                  className="h-full min-h-[140px] border-4 border-dashed border-black rounded-xl flex flex-col items-center justify-center gap-2 bg-secondary hover:bg-muted text-foreground font-bold transition-colors"
                >
                  <Plus className="h-8 w-8" />
                  <span className="font-bold">Add Platform</span>
                </button>
              </div>
            </section>

            {/* Create content */}
            <section className="mb-10" aria-labelledby="create-heading">
              <h2 id="create-heading" className="text-xl sm:text-2xl font-black mb-4 tracking-tight">CREATE CONTENT</h2>
              <Tabs defaultValue="post" className="w-full">
                <TabsList className="w-full bg-secondary border-2 border-black rounded-xl p-1 mb-4 flex flex-wrap gap-1 h-auto">
                  {[
                    { value: "post", label: "Post" },
                    { value: "thread", label: "Thread" },
                    { value: "newsletter", label: "Newsletter" },
                    { value: "video", label: "Short Video" },
                    { value: "story", label: "Story" },
                    { value: "survey", label: "Survey" },
                    { value: "blog", label: "Blog" },
                  ].map((tab) => (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className="rounded-lg data-[state=active]:bg-brand-gradient-metallic data-[state=active]:text-white data-[state=active]:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] data-[state=active]:border-2 data-[state=active]:border-black font-bold flex-1 min-w-fit"
                    >
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {["post", "thread", "newsletter", "video", "story", "survey", "blog"].map((t) => (
                  <TabsContent key={t} value={t}>
                    <ContentCreator type={t as Parameters<typeof ContentCreator>[0]["type"]} />
                  </TabsContent>
                ))}
              </Tabs>
            </section>

            {/* Analytics */}
            <div className="mb-10">
              <ContentAnalytics />
            </div>

            {/* Studio */}
            <section aria-labelledby="studio-heading">
              <h2 id="studio-heading" className="text-xl sm:text-2xl font-black mb-4 tracking-tight">CONTENT STUDIO</h2>
              <StudioSelector />
            </section>
          </main>
        </div>
      </div>

      {/* Connect Account Dialog */}
      <Dialog open={connectDialogOpen} onOpenChange={setConnectDialogOpen}>
        <DialogContent className="border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">
              {connectTarget ? `Connect ${connectTarget.label}` : "Connect a Platform"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium">
              Enter your handle or page name. SoloSuccess Content Factory will link it for scheduling and publishing.
            </DialogDescription>
          </DialogHeader>

          {!connectTarget ? (
            <div className="grid grid-cols-2 gap-3 pt-2">
              {PLATFORM_DEFS.map((def) => (
                <button
                  key={def.key}
                  onClick={() => setConnectTarget(def)}
                  className={`rounded-xl border-4 border-black p-4 flex flex-col items-center gap-2 font-bold text-sm text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all ${def.color}`}
                >
                  {def.icon}
                  {def.label}
                </button>
              ))}
            </div>
          ) : connected ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <p className="font-black text-lg">Connected!</p>
              <p className="text-muted-foreground text-sm">{usernameInput} is now linked.</p>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              <div>
                <Label className="font-bold mb-2 block">
                  {connectTarget.key === "blog" || connectTarget.key === "myapp"
                    ? `Your ${connectTarget.label} URL or RSS feed`
                    : `Your ${connectTarget.label} handle / username`}
                </Label>
                <Input
                  placeholder={connectTarget.placeholder}
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleConnect() }}
                  className="border-2 border-black rounded-xl h-11"
                  autoFocus
                  type={connectTarget.key === "blog" || connectTarget.key === "myapp" ? "url" : "text"}
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 border-2 border-black rounded-xl font-bold" onClick={() => setConnectTarget(null)}>Back</Button>
                <Button
                  onClick={handleConnect}
                  disabled={!usernameInput.trim() || connecting}
                  className="flex-1 bg-black hover:bg-black/80 text-white border-2 border-black rounded-xl font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex gap-2"
                >
                  {connecting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {connecting ? "Connecting..." : `Connect ${connectTarget.label}`}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
