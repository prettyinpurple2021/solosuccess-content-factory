"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { ArrowLeft, User, Mail, Briefcase, Save, Trash2, ShieldAlert } from "lucide-react"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const BUSINESS_TYPES = [
  "Solo Founder",
  "Freelancer / Consultant",
  "Coach / Creator",
  "E-commerce",
  "SaaS",
  "Agency",
  "Content Creator",
  "Other",
]

export default function ProfileSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [email, setEmail] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [bio, setBio] = useState("")
  const [businessType, setBusinessType] = useState("")
  const [website, setWebsite] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordSaving, setPasswordSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/auth/login"); return }
      setEmail(user.email ?? "")
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, bio, business_type, website")
        .eq("id", user.id)
        .single()
      if (profile) {
        setDisplayName(profile.display_name ?? "")
        setBio(profile.bio ?? "")
        setBusinessType(profile.business_type ?? "")
        setWebsite(profile.website ?? "")
      }
      setLoading(false)
    }
    load()
  }, [router])

  const handleSaveProfile = async () => {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      display_name: displayName.trim(),
      bio: bio.trim(),
      business_type: businessType,
      website: website.trim(),
      updated_at: new Date().toISOString(),
    })

    if (error) {
      toast.error("Failed to save profile", { description: error.message })
    } else {
      toast.success("Profile saved")
    }
    setSaving(false)
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }
    setPasswordSaving(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      toast.error("Failed to update password", { description: error.message })
    } else {
      toast.success("Password updated")
      setNewPassword("")
      setConfirmPassword("")
    }
    setPasswordSaving(false)
  }

  const handleDeleteAccount = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
    toast.info("Account deletion requested. Please contact support to complete removal.")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8 font-sans">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 font-bold text-sm border-2 border-black rounded-xl px-4 py-2 bg-card shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-brand-gradient-metallic border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <User className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-balance">Profile Settings</h1>
              <p className="text-muted-foreground font-medium text-sm">Manage your account and preferences</p>
            </div>
          </div>
        </div>

        {/* Profile info */}
        <Card className="border-4 border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-card mb-6">
          <h2 className="font-black text-xs tracking-widest uppercase text-muted-foreground mb-5 flex items-center gap-2">
            <User className="h-4 w-4" /> Personal Info
          </h2>
          <div className="space-y-5">
            <div>
              <Label className="font-black mb-2 block">Display Name</Label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="How should we call you?"
                className="border-2 border-black rounded-xl h-11 text-base"
              />
            </div>
            <div>
              <Label className="font-black mb-2 block flex items-center gap-2">
                <Mail className="h-4 w-4" /> Email
              </Label>
              <Input
                value={email}
                disabled
                className="border-2 border-black rounded-xl h-11 text-base bg-muted cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground mt-1.5 font-medium">Email cannot be changed here. Contact support if needed.</p>
            </div>
            <div>
              <Label className="font-black mb-2 block flex items-center gap-2">
                <Briefcase className="h-4 w-4" /> Business Type
              </Label>
              <Select value={businessType} onValueChange={setBusinessType}>
                <SelectTrigger className="border-2 border-black rounded-xl h-11 font-bold">
                  <SelectValue placeholder="Select your business type..." />
                </SelectTrigger>
                <SelectContent className="border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  {BUSINESS_TYPES.map((t) => (
                    <SelectItem key={t} value={t} className="font-bold">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="font-black mb-2 block">Website / Portfolio URL</Label>
              <Input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yoursite.com"
                type="url"
                className="border-2 border-black rounded-xl h-11 text-base"
              />
            </div>
            <div>
              <Label className="font-black mb-2 block">Bio <span className="text-muted-foreground font-normal text-xs">(optional, shown on your public posts)</span></Label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell your audience who you are..."
                className="border-2 border-black rounded-xl min-h-[96px] text-base"
                maxLength={280}
              />
              <p className="text-xs text-muted-foreground mt-1 text-right font-medium">{bio.length}/280</p>
            </div>
          </div>
          <Button
            onClick={handleSaveProfile}
            disabled={saving}
            className="w-full mt-6 h-12 bg-brand-gradient-metallic text-white border-2 border-black rounded-xl font-black text-base shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2"
          >
            <Save className="h-5 w-5" />
            {saving ? "Saving..." : "Save Profile"}
          </Button>
        </Card>

        {/* Password */}
        <Card className="border-4 border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-card mb-6">
          <h2 className="font-black text-xs tracking-widest uppercase text-muted-foreground mb-5 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" /> Change Password
          </h2>
          <div className="space-y-4">
            <div>
              <Label className="font-black mb-2 block">New Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="border-2 border-black rounded-xl h-11"
              />
            </div>
            <div>
              <Label className="font-black mb-2 block">Confirm New Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your new password"
                className="border-2 border-black rounded-xl h-11"
              />
            </div>
          </div>
          <Button
            onClick={handleChangePassword}
            disabled={passwordSaving || !newPassword}
            variant="outline"
            className="w-full mt-5 h-11 border-2 border-black rounded-xl font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
          >
            {passwordSaving ? "Updating..." : "Update Password"}
          </Button>
        </Card>

        {/* Danger zone */}
        <Card className="border-4 border-destructive rounded-2xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-card">
          <h2 className="font-black text-xs tracking-widest uppercase text-destructive mb-3 flex items-center gap-2">
            <Trash2 className="h-4 w-4" /> Danger Zone
          </h2>
          <Separator className="mb-4 bg-destructive/20" />
          <p className="text-sm font-medium text-muted-foreground mb-4">
            Deleting your account is permanent. All your content, drafts, ideas, and settings will be removed and cannot be recovered.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="border-2 border-destructive text-destructive rounded-xl font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-destructive hover:text-white"
              >
                <Trash2 className="h-4 w-4 mr-2" /> Delete My Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-black text-xl">Delete your account?</AlertDialogTitle>
                <AlertDialogDescription className="font-medium">
                  This action cannot be undone. All your data will be permanently deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-2 border-black rounded-xl font-bold">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  className="bg-destructive text-white border-2 border-black rounded-xl font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                >
                  Yes, delete my account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Card>
      </div>
    </div>
  )
}
