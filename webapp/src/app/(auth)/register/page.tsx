"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader2, Mail, Lock, User, Phone, Scale } from "lucide-react"
import { toast } from "sonner"
import { authApi } from "@/lib/api/auth"

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    khc_advocate_id: "",
    khc_advocate_name: "",
    khc_enrollment_number: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    setIsLoading(true)

    try {
      await authApi.register({
        email: formData.email,
        mobile: formData.mobile,
        password: formData.password,
        khc_advocate_id: formData.khc_advocate_id,
        khc_advocate_name: formData.khc_advocate_name,
        khc_enrollment_number: formData.khc_enrollment_number || undefined,
      })

      toast.success("Account created successfully", {
        description: "Please sign in to continue.",
      })

      router.push("/login")
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || "Registration failed"
      setError(errorMessage)
      toast.error("Registration failed", {
        description: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
          Create an account
        </CardTitle>
        <CardDescription className="text-slate-600">
          Join Lawmate to start managing your cases efficiently
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-900">
                  Registration Error
                </h4>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* KHC Details */}
          <div className="space-y-4 p-4 rounded-lg bg-indigo-50 border border-indigo-200">
            <h3 className="font-bold text-slate-900 text-sm">
              Kerala High Court Details
            </h3>

            <div className="space-y-2">
              <Label htmlFor="khc_advocate_id">
                KHC Advocate ID <span className="text-red-600">*</span>
              </Label>
              <div className="relative">
                <Scale className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="khc_advocate_id"
                  placeholder="KHC/001/2020"
                  value={formData.khc_advocate_id}
                  onChange={(e) =>
                    setFormData({ ...formData, khc_advocate_id: e.target.value })
                  }
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-slate-600">
                Your unique advocate ID from KHC portal
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="khc_advocate_name">
                Full Name (as per KHC) <span className="text-red-600">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="khc_advocate_name"
                  placeholder="John Doe"
                  value={formData.khc_advocate_name}
                  onChange={(e) =>
                    setFormData({ ...formData, khc_advocate_name: e.target.value })
                  }
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="khc_enrollment_number">
                Enrollment Number (Optional)
              </Label>
              <Input
                id="khc_enrollment_number"
                placeholder="KER/12345/2020"
                value={formData.khc_enrollment_number}
                onChange={(e) =>
                  setFormData({ ...formData, khc_enrollment_number: e.target.value })
                }
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">
                Email Address <span className="text-red-600">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="advocate@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile">
                Mobile Number <span className="text-red-600">*</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="mobile"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.mobile}
                  onChange={(e) =>
                    setFormData({ ...formData, mobile: e.target.value })
                  }
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Password <span className="text-red-600">*</span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                Confirm Password <span className="text-red-600">*</span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-sm text-center text-slate-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Sign in
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}