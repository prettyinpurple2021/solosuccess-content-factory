import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Instagram, Linkedin, Menu, Plus, Twitter, Youtube } from "lucide-react"
import SocialMediaCard from "@/components/social-media-card"
import ContentCreator from "@/components/content-creator"
import StudioSelector from "@/components/studio-selector"
import MobileNavigation from "@/components/mobile-navigation"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-2 sm:p-4 md:p-8">
      {/* Glassmorphic container */}
      <div className="w-full max-w-7xl mx-auto backdrop-blur-xl bg-white/30 border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        {/* Header */}
        <header className="border-b-4 border-black p-4 sm:p-6 bg-white/40 backdrop-blur-md">
          <div className="flex justify-between items-center gap-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">POSTCRAFT</h1>

            {/* Mobile menu */}
            <div className="flex md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-xl border-2 border-black">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="border-r-4 border-black p-0">
                  <MobileNavigation />
                </SheetContent>
              </Sheet>
            </div>

            {/* Desktop buttons */}
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

        <div className="grid md:grid-cols-[280px_1fr] h-[calc(100vh-6rem)]">
          {/* Sidebar - Desktop only */}
          <div className="hidden md:block border-r-4 border-black bg-white/40 p-4">
            <nav className="space-y-2">
              <Link href="#" className="flex items-center gap-2 text-lg font-bold p-3 bg-black text-white rounded-xl">
                Dashboard
              </Link>
              <Link href="#" className="flex items-center gap-2 text-lg font-bold p-3 hover:bg-black/10 rounded-xl">
                Analytics
              </Link>
              <Link href="#" className="flex items-center gap-2 text-lg font-bold p-3 hover:bg-black/10 rounded-xl">
                Calendar
              </Link>
              <Link href="#" className="flex items-center gap-2 text-lg font-bold p-3 hover:bg-black/10 rounded-xl">
                Messages
              </Link>
            </nav>

            <div className="mt-8">
              <h2 className="text-xl font-black mb-4">PLATFORMS</h2>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 rounded-xl border-2 border-black font-bold"
                >
                  <Instagram className="h-5 w-5" /> Instagram
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 rounded-xl border-2 border-black font-bold"
                >
                  <Twitter className="h-5 w-5" /> Twitter
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 rounded-xl border-2 border-black font-bold"
                >
                  <Linkedin className="h-5 w-5" /> LinkedIn
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 rounded-xl border-2 border-black font-bold"
                >
                  <Youtube className="h-5 w-5" /> YouTube
                </Button>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="overflow-auto p-4 sm:p-6">
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-black mb-4">CONNECTED ACCOUNTS</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <SocialMediaCard
                  platform="Instagram"
                  username="@yourbrand"
                  icon={<Instagram className="h-6 w-6" />}
                  color="bg-gradient-to-br from-purple-500 to-pink-500"
                />
                <SocialMediaCard
                  platform="Twitter"
                  username="@yourbrand"
                  icon={<Twitter className="h-6 w-6" />}
                  color="bg-blue-400"
                />
                <SocialMediaCard
                  platform="LinkedIn"
                  username="Your Brand"
                  icon={<Linkedin className="h-6 w-6" />}
                  color="bg-blue-600"
                />
                <Button className="h-full min-h-[120px] border-4 border-dashed border-black rounded-xl flex flex-col items-center justify-center gap-2 bg-white/50 hover:bg-white/70">
                  <Plus className="h-8 w-8" />
                  <span className="font-bold">Add Platform</span>
                </Button>
              </div>
            </div>

            <div className="mb-10">
              <h2 className="text-xl sm:text-2xl font-black mb-4">CREATE CONTENT</h2>
              <Tabs defaultValue="post" className="w-full">
                <TabsList className="w-full bg-white/50 border-2 border-black rounded-xl p-1 mb-4">
                  <TabsTrigger
                    value="post"
                    className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white font-bold"
                  >
                    Post
                  </TabsTrigger>
                  <TabsTrigger
                    value="story"
                    className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white font-bold"
                  >
                    Story
                  </TabsTrigger>
                  <TabsTrigger
                    value="video"
                    className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white font-bold"
                  >
                    Video
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="post">
                  <ContentCreator type="post" />
                </TabsContent>
                <TabsContent value="story">
                  <ContentCreator type="story" />
                </TabsContent>
                <TabsContent value="video">
                  <ContentCreator type="video" />
                </TabsContent>
              </Tabs>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black mb-4">CONTENT STUDIO</h2>
              <StudioSelector />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

