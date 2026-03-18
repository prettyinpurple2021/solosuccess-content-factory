"use client"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { ArrowRight, CheckCircle2, Rocket, User, Briefcase } from "lucide-react"

const BUSINESS_TYPES = [
  "Consultant / Freelancer",
  "SaaS / Software",
  "Creator / Coach",
  "E-commerce",
  "Agency",
  "Other",
]

interface OnboardingDialogProps {
  open: boolean
  userId: string
  onComplete: (displayName: string) => void
}

export default function OnboardingDialog({ open, userId, onComplete }: OnboardingDialogProps) {
  const [step, setStep] = useState(1)
  const [displayName, setDisplayName] = useState("")
  const [businessType, setBusinessType] = useState("")
  const [saving, setSaving] = useState(false)

  const handleComplete = async () => {
    if (!displayName.trim()) {
      toast.error("Please enter your name to continue.")
      return
    }
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim(),
        business_type: businessType || null,
        onboarded: true,
      })
      .eq("id", userId)

    if (error) {
      toast.error("Could not save profile. Please try again.")
      setSaving(false)
      return
    }
    setSaving(false)
    onComplete(displayName.trim())
  }

  const steps = [
    { icon: <User className="h-8 w-8" />, title: "What should we call you?", subtitle: "Set your name so your content feels personal." },
    { icon: <Briefcase className="h-8 w-8" />, title: "What kind of business do you run?", subtitle: "We'll tailor your content suggestions." },
    { icon: <Rocket className="h-8 w-8" />, title: "You're all set!", subtitle: "Start creating content that grows your solo business." },
  ]

  const current = steps[step - 1]

  return (
    <Dialog open={open}>
      <DialogContent
        className="border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md p-0 overflow-hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Progress bar */}
        <div className="h-2 bg-secondary w-full">
          <div
            className="h-full bg-brand-gradient-metallic transition-all duration-500"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <div className="p-8">
          {/* Step indicator */}
          <div className="flex gap-2 mb-6">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full border-2 border-black transition-all ${s <= step ? "bg-brand-gradient-metallic" : "bg-secondary"}`}
              />
            ))}
          </div>

          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl border-4 border-black bg-brand-gradient-metallic text-white flex items-center justify-center mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            {current.icon}
          </div>

          <h2 className="text-2xl font-black mb-1 text-balance">{current.title}</h2>
          <p className="text-muted-foreground font-medium mb-6 text-sm">{current.subtitle}</p>

          {/* Step 1 — Name */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label className="font-bold mb-2 block">Your first name or brand name</Label>
                <Input
                  placeholder="e.g. Sarah, BuildFast, The Lean Founder..."
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && displayName.trim()) setStep(2) }}
                  className="border-2 border-black rounded-xl h-12 text-base"
                  autoFocus
                />
              </div>
              <Button
                onClick={() => { if (displayName.trim()) setStep(2) }}
                disabled={!displayName.trim()}
                className="w-full h-12 bg-black text-white border-2 border-black rounded-xl font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex gap-2"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Step 2 — Business type */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {BUSINESS_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => setBusinessType(type)}
                    className={`p-3 text-sm font-bold border-2 rounded-xl text-left transition-all ${
                      businessType === type
                        ? "border-black bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        : "border-black/30 hover:border-black bg-secondary"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  variant="outline"
                  className="border-2 border-black rounded-xl font-bold h-11"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  className="bg-black text-white border-2 border-black rounded-xl font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] h-11 flex gap-2"
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3 — Done */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2 p-4 border-2 border-black rounded-xl bg-secondary text-sm font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  <span>Name: <strong>{displayName}</strong></span>
                </div>
                {businessType && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    <span>Business type: <strong>{businessType}</strong></span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  <span>AI writing assistant ready</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  <span>7 content types unlocked</span>
                </div>
              </div>
              <Button
                onClick={handleComplete}
                disabled={saving}
                className="w-full h-12 bg-brand-gradient-metallic text-white border-2 border-black rounded-xl font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex gap-2 text-base"
              >
                {saving ? "Saving..." : "Start Creating"}
                {!saving && <Rocket className="h-4 w-4" />}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
