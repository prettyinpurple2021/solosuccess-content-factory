"use client"

import type React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CheckCircle2, Unlink } from "lucide-react"
import type { PlatformKey } from "@/lib/storage"

interface SocialMediaCardProps {
  platform: string
  platformKey: PlatformKey
  username: string
  icon: React.ReactNode
  color: string
  connected: boolean
  followers?: number
  posts?: number
  engagement?: number
  onConnect: () => void
  onDisconnect: () => void
}

export default function SocialMediaCard({
  platform,
  username,
  icon,
  color,
  connected,
  followers,
  posts,
  engagement,
  onConnect,
  onDisconnect,
}: SocialMediaCardProps) {
  return (
    <Card className="border-4 border-black rounded-xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <div className={cn("p-4 text-white relative", color)}>
        <div className="flex justify-between items-start">
          {icon}
          {connected ? (
            <span className="flex items-center gap-1 text-xs font-bold bg-white/25 px-2 py-1 rounded-full">
              <CheckCircle2 className="h-3 w-3" /> Connected
            </span>
          ) : (
            <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-full text-white/80">
              Not connected
            </span>
          )}
        </div>
        <h3 className="text-xl font-bold mt-2">{platform}</h3>
        <p className="text-sm opacity-90">{connected ? username : "—"}</p>
      </div>

      {connected ? (
        <>
          <div className="px-4 pt-4 pb-2 bg-card">
            <div className="flex justify-between text-sm">
              <div>
                <p className="font-black">{followers != null ? followers.toLocaleString() : "—"}</p>
                <p className="text-muted-foreground text-xs">Followers</p>
              </div>
              <div>
                <p className="font-black">{posts != null ? posts.toLocaleString() : "—"}</p>
                <p className="text-muted-foreground text-xs">Posts</p>
              </div>
              <div>
                <p className="font-black">{engagement != null ? `${engagement}%` : "—"}</p>
                <p className="text-muted-foreground text-xs">Engagement</p>
              </div>
            </div>
          </div>
          <div className="px-4 pb-4 bg-card">
            <Button
              variant="outline"
              size="sm"
              onClick={onDisconnect}
              className="w-full mt-2 border-2 border-black rounded-lg font-bold text-xs flex gap-1 h-8 hover:bg-destructive hover:text-white hover:border-destructive transition-colors"
            >
              <Unlink className="h-3 w-3" /> Disconnect
            </Button>
          </div>
        </>
      ) : (
        <div className="p-4 bg-card">
          <p className="text-xs text-muted-foreground mb-3 font-medium">
            Connect your account to publish and track performance.
          </p>
          <Button
            size="sm"
            onClick={onConnect}
            className="w-full bg-black hover:bg-black/80 text-white border-2 border-black rounded-lg font-bold text-xs h-8 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            Connect {platform}
          </Button>
        </div>
      )}
    </Card>
  )
}
