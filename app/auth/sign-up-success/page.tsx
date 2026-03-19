import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="text-xs font-black tracking-[0.2em] uppercase text-muted-foreground mb-1">SOLOSUCCESS</p>
          <h1 className="text-4xl font-black tracking-tight text-brand-gradient">CONTENT FACTORY</h1>
        </div>

        <div className="bg-card border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <h2 className="text-2xl font-black mb-2">YOU'RE IN!</h2>
          <p className="text-muted-foreground font-medium mb-2">
            We sent a confirmation link to your email.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            Click the link in your email to activate your account, then come back to sign in and start building your content engine.
          </p>
          <Button
            asChild
            className="w-full bg-brand-gradient-metallic text-white border-2 border-black rounded-xl font-black text-base h-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <Link href="/auth/login">Go to Sign In</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
