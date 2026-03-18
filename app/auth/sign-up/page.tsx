'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== repeatPassword) {
      setError('Passwords do not match')
      return
    }
    const supabase = createClient()
    setIsLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/`,
        },
      })
      if (error) throw error
      router.push('/auth/sign-up-success')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <p className="text-xs font-black tracking-[0.2em] uppercase text-muted-foreground mb-1">SOLO SUCCESS</p>
          <h1 className="text-4xl font-black tracking-tight text-brand-gradient">CONTENT FACTORY</h1>
          <p className="text-muted-foreground font-medium mt-2">Your entire content operation. One place.</p>
        </div>

        <div className="bg-card border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
          <h2 className="text-2xl font-black mb-2">CREATE YOUR ACCOUNT</h2>
          <p className="text-muted-foreground text-sm font-medium mb-6">Free to get started. No credit card required.</p>
          <form onSubmit={handleSignUp} className="space-y-5">
            <div>
              <Label htmlFor="email" className="font-bold mb-2 block">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-2 border-black rounded-xl h-11"
              />
            </div>
            <div>
              <Label htmlFor="password" className="font-bold mb-2 block">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-2 border-black rounded-xl h-11"
              />
            </div>
            <div>
              <Label htmlFor="repeat-password" className="font-bold mb-2 block">Confirm Password</Label>
              <Input
                id="repeat-password"
                type="password"
                required
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                className="border-2 border-black rounded-xl h-11"
              />
            </div>
            {error && (
              <p className="text-sm font-bold text-destructive bg-destructive/10 border-2 border-destructive rounded-xl px-4 py-2">
                {error}
              </p>
            )}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-gradient-metallic text-white border-2 border-black rounded-xl font-black text-base h-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              {isLoading ? 'Creating account...' : 'Create Free Account'}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm font-medium">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-black underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
