import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
} from "lucide-react"
import SocialMediaCard from "@/components/social-media-card"
import ContentCreator from "@/components/content-creator"
import StudioSelector from "@/components/studio-selector"
import MobileNavigation from "@/components/mobile-navigation"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const navItems = [
  { label: "Dashboard", href: "#", icon: <LayoutDashboard className="h-5 w-5" />, active: true },
  { label: "Content Calendar", href: "#", icon: <CalendarDays className="h-5 w-5" /> },
  { label: "Repurpose", href: "#", icon: <Repeat2 className="h-5 w-5" /> },
  { label: "Ideas / Swipe File", href: "#", icon: <Lightbulb className="h-5 w-5" /> },
]

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background p-2 sm:p-4 md:p-8 font-sans">
      {/* Main container — neobrutalist card */}
      <div className="w-full max-w-7xl mx-auto bg-card border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">

        {/* Header */}
        <header className="border-b-4 border-black p-4 sm:p-6 bg-card">
          <div className="flex justify-between items-center gap-4">
            {/* Brand wordmark with metallic gradient */}
            <div className="flex flex-col leading-none">
              <span className="text-xs font-black tracking-[0.2em] uppercase text-muted-foreground">
                SOLO SUCCESS
              </span>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-brand-gradient">
                CONTENT FACTORY
              </h1>
            </div>

            {/* Mobile menu trigger */}
            <div className="flex md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="border-r-4 border-black p-0 w-72">
                  <MobileNavigation />
                </SheetContent>
              </Sheet>
            </div>

            {/* Desktop header actions */}
            <div className="hidden sm:flex items-center gap-3">
              <Button className="bg-black hover:bg-black/80 text-white rounded-xl border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                Connect Account
              </Button>
              <Button
                variant="outline"
                className="rounded-xl border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                Settings
              </Button>
            </div>
          </div>
        </header>

        <div className="grid md:grid-cols-[260px_1fr] h-[calc(100vh-6rem)]">

          {/* Sidebar — desktop only */}
          <aside className="hidden md:flex flex-col border-r-4 border-black bg-secondary p-4 gap-8">
            <nav className="space-y-1" aria-label="Main navigation">
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

            <div>
              <h2 className="text-sm font-black tracking-widest uppercase text-muted-foreground mb-3">Platforms</h2>
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
                    className="w-full justify-start gap-2 rounded-xl border-2 border-black font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  >
                    {p.icon} {p.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Solo founder tagline */}
            <div className="mt-auto border-2 border-black rounded-xl p-3 bg-card">
              <p className="text-xs font-bold text-muted-foreground leading-relaxed text-balance">
                Built for solo founders who create, publish, and grow — all on their own.
              </p>
            </div>
          </aside>

          {/* Main content area */}
          <main className="overflow-auto p-4 sm:p-6">

            {/* Connected accounts */}
            <section className="mb-8" aria-labelledby="accounts-heading">
              <h2 id="accounts-heading" className="text-xl sm:text-2xl font-black mb-4 tracking-tight">
                CONNECTED ACCOUNTS
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <SocialMediaCard
                  platform="Instagram"
                  username="@yourbrand"
                  icon={<Instagram className="h-6 w-6" />}
                  color="bg-gradient-to-br from-yellow-400 to-pink-500"
                />
                <SocialMediaCard
                  platform="Twitter / X"
                  username="@yourbrand"
                  icon={<Twitter className="h-6 w-6" />}
                  color="bg-gradient-to-br from-pink-400 to-rose-600"
                />
                <SocialMediaCard
                  platform="LinkedIn"
                  username="Your Brand"
                  icon={<Linkedin className="h-6 w-6" />}
                  color="bg-gradient-to-br from-yellow-500 to-orange-500"
                />
                <Button className="h-full min-h-[120px] border-4 border-dashed border-black rounded-xl flex flex-col items-center justify-center gap-2 bg-secondary hover:bg-muted text-foreground font-bold">
                  <Plus className="h-8 w-8" />
                  <span className="font-bold">Add Platform</span>
                </Button>
              </div>
            </section>

            {/* Create content */}
            <section className="mb-10" aria-labelledby="create-heading">
              <h2 id="create-heading" className="text-xl sm:text-2xl font-black mb-4 tracking-tight">
                CREATE CONTENT
              </h2>
              <Tabs defaultValue="post" className="w-full">
                <TabsList className="w-full bg-secondary border-2 border-black rounded-xl p-1 mb-4 flex flex-wrap gap-1 h-auto">
                  {[
                    { value: "post", label: "Post" },
                    { value: "thread", label: "Thread" },
                    { value: "newsletter", label: "Newsletter" },
                    { value: "video", label: "Short Video" },
                    { value: "story", label: "Story" },
                    { value: "survey", label: "Survey" },
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

                <TabsContent value="post">
                  <ContentCreator type="post" />
                </TabsContent>
                <TabsContent value="thread">
                  <ContentCreator type="thread" />
                </TabsContent>
                <TabsContent value="newsletter">
                  <ContentCreator type="newsletter" />
                </TabsContent>
                <TabsContent value="video">
                  <ContentCreator type="video" />
                </TabsContent>
                <TabsContent value="story">
                  <ContentCreator type="story" />
                </TabsContent>
                <TabsContent value="survey">
                  <ContentCreator type="survey" />
                </TabsContent>
              </Tabs>
            </section>

            {/* Content studio */}
            <section aria-labelledby="studio-heading">
              <h2 id="studio-heading" className="text-xl sm:text-2xl font-black mb-4 tracking-tight">
                CONTENT STUDIO
              </h2>
              <StudioSelector />
            </section>
          </main>
        </div>
      </div>
    </div>
  )
}
