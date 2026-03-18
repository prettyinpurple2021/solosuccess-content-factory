"use client"

import { Card } from "@/components/ui/card"
import { Music, Video, ImageIcon, FileText, Repeat2, Lightbulb } from "lucide-react"
import Link from "next/link"

const studioOptions = [
  {
    type: "audio",
    name: "Audio Studio",
    description: "Record voiceovers, podcast clips, and audio content solo — no team required.",
    icon: <Music className="h-8 w-8 sm:h-10 sm:w-10" />,
    color: "bg-gradient-to-br from-yellow-400 to-orange-500",
    href: "/studio/audio",
  },
  {
    type: "video",
    name: "Video Studio",
    description: "Trim, caption, and repurpose your short-form video content fast.",
    icon: <Video className="h-8 w-8 sm:h-10 sm:w-10" />,
    color: "bg-gradient-to-br from-pink-500 to-rose-600",
    href: "/studio/video",
  },
  {
    type: "image",
    name: "Image Studio",
    description: "Design scroll-stopping graphics and branded visuals in minutes.",
    icon: <ImageIcon className="h-8 w-8 sm:h-10 sm:w-10" />,
    color: "bg-gradient-to-br from-yellow-500 to-pink-400",
    href: "/studio/image",
  },
  {
    type: "text",
    name: "Text Studio",
    description: "Draft, refine, and optimize copy across every platform you publish on.",
    icon: <FileText className="h-8 w-8 sm:h-10 sm:w-10" />,
    color: "bg-gradient-to-br from-orange-400 to-rose-500",
    href: "/studio/text",
  },
  {
    type: "repurpose",
    name: "Repurpose",
    description: "Turn one piece of content into posts, threads, newsletters, and more.",
    icon: <Repeat2 className="h-8 w-8 sm:h-10 sm:w-10" />,
    color: "bg-brand-gradient-metallic",
    href: "/studio/repurpose",
  },
  {
    type: "ideas",
    name: "Swipe File",
    description: "Save ideas, inspiration, and winning content to remix later.",
    icon: <Lightbulb className="h-8 w-8 sm:h-10 sm:w-10" />,
    color: "bg-gradient-to-br from-yellow-300 to-yellow-500",
    href: "/studio/ideas",
  },
]

export default function StudioSelector() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {studioOptions.map((studio) => (
        <Link href={studio.href} key={studio.type} className="block group">
          <Card className="border-4 border-black rounded-xl overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] group-hover:-translate-y-1 transition-transform h-full">
            <div className={`p-4 sm:p-6 text-white relative ${studio.color}`}>
              {studio.icon}
              <h3 className="text-lg sm:text-xl font-black mt-4 tracking-tight">{studio.name}</h3>
            </div>
            <div className="p-4 bg-card">
              <p className="text-sm leading-relaxed text-muted-foreground">{studio.description}</p>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  )
}
