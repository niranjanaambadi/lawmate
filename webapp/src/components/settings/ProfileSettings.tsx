"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/lib/hooks/useAuth"
import { Camera, Loader2, Save } from "lucide-react"
import { toast } from "sonner"

export function ProfileSettings() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    khc_advocate_name: user?.khc_advocate_name || "",
    email: user?.email || "",
    mobile: user?.mobile || "",
    khc_enrollment_number: user?.khc_enrollment_number || "",
  })

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    toast.success("Profile updated successfully")
    setIsSaving(false)
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      {/* Profile Picture */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>
            Update your profile picture to personalize your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="text-2xl bg-indigo-100 text-indigo-600">
                  {user?.khc_advocate_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-lg">
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-1">
                {user?.khc_advocate_name}
              </h3>
              <p className="text-sm text-slate-600 mb-3">
                {user?.khc_advocate_id}
              </p>
              <Button variant="outline" size="sm">
                Change Picture
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your personal details and contact information
            </CardDescription>
          </div>
          {!isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.khc_advocate_name}
                onChange={(e) =>
                  setFormData({ ...formData, khc_advocate_name: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="khc_id">KHC Advocate ID</Label>
              <Input
                id="khc_id"
                value={user?.khc_advocate_id || ""}
                disabled
                className="bg-slate-50"
              />
              <p className="text-xs text-slate-500">Cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number</Label>
              <Input
                id="mobile"
                type="tel"
                value={formData.mobile}
                onChange={(e) =>
                  setFormData({ ...formData, mobile: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="enrollment">Enrollment Number</Label>
              <Input
                id="enrollment"
                value={formData.khc_enrollment_number}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    khc_enrollment_number: e.target.value,
                  })
                }
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={user?.role || ""}
                disabled
                className="bg-slate-50 capitalize"
              />
            </div>
          </div>

          {isEditing && (
            <div className="flex items-center gap-2 pt-4">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Status */}
      <Card>
        <CardHeader>
          <CardTitle>Account Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-slate-200 p-4">
              <div className="text-sm text-slate-600 mb-1">Account Created</div>
              <div className="font-bold text-slate-900">
                {user?.created_at &&
                  new Date(user.created_at).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 p-4">
              <div className="text-sm text-slate-600 mb-1">Last Login</div>
              <div className="font-bold text-slate-900">
                {user?.last_login_at
                  ? new Date(user.last_login_at).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Never"}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 p-4">
              <div className="text-sm text-slate-600 mb-1">Last Sync</div>
              <div className="font-bold text-slate-900">
                {user?.last_sync_at
                  ? new Date(user.last_sync_at).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Never"}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 p-4">
              <div className="text-sm text-slate-600 mb-1">Account Status</div>
              <div className="flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full ${
                    user?.is_active ? "bg-emerald-500" : "bg-red-500"
                  }`}
                />
                <span className="font-bold text-slate-900">
                  {user?.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}