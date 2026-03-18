'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useTheme } from 'next-themes'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { LogOut, User, Moon, Sun, Settings } from 'lucide-react'
import Link from 'next/link'

interface UserMenuProps {
  email: string
}

export default function UserMenu({ email }: UserMenuProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'

  const handleSignOut = async () => {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const initials = email.slice(0, 2).toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="rounded-xl border-2 border-black font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2 px-3"
          aria-label="User menu"
        >
          <span className="w-7 h-7 rounded-full bg-brand-gradient-metallic text-white text-xs font-black flex items-center justify-center">
            {initials}
          </span>
          <span className="hidden sm:block max-w-[140px] truncate text-sm">{email}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] min-w-[220px]"
      >
        <DropdownMenuLabel className="font-black text-xs tracking-widest uppercase text-muted-foreground">
          My Account
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-black/20" />
        <DropdownMenuItem className="font-medium flex gap-2 cursor-default" disabled>
          <User className="h-4 w-4" />
          <span className="truncate">{email}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-black/20" />
        <DropdownMenuItem asChild>
          <Link href="/settings/profile" className="flex gap-2 font-bold cursor-pointer">
            <Settings className="h-4 w-4" />
            Profile Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-black/20" />
        {/* Dark mode toggle */}
        <DropdownMenuItem
          className="flex items-center justify-between gap-2 cursor-pointer"
          onSelect={(e) => e.preventDefault()}
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
        >
          <div className="flex items-center gap-2 font-bold">
            {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            {isDark ? 'Dark Mode' : 'Light Mode'}
          </div>
          <Switch
            checked={isDark}
            onCheckedChange={(v) => setTheme(v ? 'dark' : 'light')}
            className="pointer-events-none"
            aria-label="Toggle dark mode"
          />
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-black/20" />
        <DropdownMenuItem
          onClick={handleSignOut}
          disabled={loading}
          className="font-bold text-destructive flex gap-2 cursor-pointer focus:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          {loading ? 'Signing out...' : 'Sign Out'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

