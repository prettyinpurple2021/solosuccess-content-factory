import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="text-xs font-black tracking-[0.2em] uppercase text-muted-foreground mb-1">SOLOSUCCESS</p>
          <h1 className="text-4xl font-black tracking-tight text-brand-gradient">CONTENT FACTORY</h1>
        </div>

        <div className="bg-card border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-16 w-16 text-destructive" />
          </div>
          <h2 className="text-2xl font-black mb-2">SOMETHING WENT WRONG</h2>
          {params?.error ? (
            <p className="text-sm font-bold text-destructive bg-destructive/10 border-2 border-destructive rounded-xl px-4 py-2 mb-6">
              {params.error}
            </p>
          ) : (
            <p className="text-muted-foreground font-medium mb-6">
              An authentication error occurred. Please try again.
            </p>
          )}
          <div className="flex gap-3">
            <Button
              asChild
              variant="outline"
              className="flex-1 border-2 border-black rounded-xl font-black h-11"
            >
              <Link href="/auth/sign-up">Sign Up</Link>
            </Button>
            <Button
              asChild
              className="flex-1 bg-brand-gradient-metallic text-white border-2 border-black rounded-xl font-black h-11 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
            >
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
