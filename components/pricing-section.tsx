"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

const PLANS = [
  {
    name: "Starter",
    price: { monthly: 9, annual: 7 },
    description: "For solo founders just getting started with content.",
    color: "bg-[#FFD700]",
    cta: "Start 7-Day Trial",
    highlight: false,
    features: [
      "50 generations / month",
      "2 platform connections",
      "All 7 content types",
      "Content Calendar (manual)",
      "Ideas / Swipe File",
      "Draft autosave",
    ],
  },
  {
    name: "Creator",
    price: { monthly: 29, annual: 23 },
    description: "The sweet spot for daily content publishers.",
    color: "bg-[#FF2D78]",
    cta: "Start 7-Day Trial",
    highlight: true,
    features: [
      "300 generations / month",
      "4 platform connections",
      "Everything in Starter",
      "Full repurpose engine",
      "Content Calendar with scheduling",
      "Priority generation speed",
    ],
  },
  {
    name: "Pro",
    price: { monthly: 59, annual: 47 },
    description: "For power users replacing 3+ tools.",
    color: "bg-[#FF6B6B]",
    cta: "Start 7-Day Trial",
    highlight: false,
    features: [
      "Unlimited generations (fair use)",
      "4+ platform connections",
      "Everything in Creator",
      "Bulk repurpose batching",
      "Early access to new features",
      "Priority support",
    ],
  },
]

export function PricingSection() {
  const [annual, setAnnual] = useState(false)

  return (
    <section id="pricing" className="py-20 md:py-28 border-b-4 border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-14 text-center">
          <span className="text-xs font-black tracking-widest uppercase text-muted-foreground">Pricing</span>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight mt-2 text-balance">PLANS BUILT FOR SOLO FOUNDERS</h2>
          <p className="text-muted-foreground mt-4 text-lg max-w-xl mx-auto">No feature gating. No seat limits. Pay for volume, not capability.</p>

          {/* Annual toggle */}
          <div className="inline-flex items-center gap-3 mt-8 border-4 border-black rounded-2xl p-1 bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <button
              onClick={() => setAnnual(false)}
              className={`px-5 py-2 rounded-xl font-black text-sm transition-all ${!annual ? "bg-black text-white" : "text-muted-foreground hover:text-foreground"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-5 py-2 rounded-xl font-black text-sm transition-all flex items-center gap-2 ${annual ? "bg-black text-white" : "text-muted-foreground hover:text-foreground"}`}
            >
              Annual
              <span className="text-xs bg-[#FFD700] text-black px-2 py-0.5 rounded-full font-black border border-black">2 months free</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-start">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`border-4 border-black rounded-3xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col transition-all ${plan.highlight ? "md:-translate-y-3 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]" : ""}`}
            >
              {/* Header */}
              <div className={`${plan.color} p-7 border-b-4 border-black`}>
                {plan.highlight && (
                  <div className="inline-block bg-black text-white text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full mb-3">
                    Most Popular
                  </div>
                )}
                <p className="font-black text-xl text-black">{plan.name}</p>
                <div className="flex items-end gap-1 mt-2">
                  <span className="text-5xl font-black text-black leading-none">
                    ${annual ? plan.price.annual : plan.price.monthly}
                  </span>
                  <span className="text-black/70 font-bold mb-1">/mo</span>
                </div>
                {annual && (
                  <p className="text-xs font-bold text-black/70 mt-1">
                    billed ${plan.price.annual * 12}/yr
                  </p>
                )}
                <p className="text-sm font-medium text-black/70 mt-2">{plan.description}</p>
              </div>

              {/* Features */}
              <div className="p-7 flex flex-col gap-4 flex-1 bg-card">
                <ul className="space-y-3 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                      <span className="font-bold text-sm">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  size="lg"
                  className={`w-full mt-2 border-4 border-black rounded-2xl font-black text-base h-13 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 transition-all ${plan.highlight ? "bg-black text-white" : "bg-card text-foreground"}`}
                  asChild
                >
                  <Link href="/auth/sign-up">{plan.cta} <ArrowRight className="h-4 w-4 ml-2" /></Link>
                </Button>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground font-medium mt-10">
          All plans include a 7-day free trial. No credit card required to start.
        </p>
      </div>
    </section>
  )
}
