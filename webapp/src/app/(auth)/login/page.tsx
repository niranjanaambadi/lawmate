// "use client"

// import { useState } from "react"
// import { signIn } from "next-auth/react"
// import { useRouter } from "next/navigation"
// import Link from "next/link"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import { AlertCircle, Loader2, Mail, Lock } from "lucide-react"
// import { toast } from "sonner"

// export default function LoginPage() {
//   const router = useRouter()
//   const [isLoading, setIsLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//   })

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setError(null)
//     setIsLoading(true)

//     try {
//       const result = await signIn("credentials", {
//         email: formData.email,
//         password: formData.password,
//         redirect: false,
//       })

//       if (result?.error) {
//         setError("Invalid email or password")
//         toast.error("Login failed", {
//           description: "Please check your credentials and try again.",
//         })
//       } else {
//         toast.success("Login successful", {
//           description: "Redirecting to dashboard...",
//         })
//         router.push("/dashboard")
//       }
//     } catch (err) {
//       setError("An unexpected error occurred")
//       toast.error("Login failed", {
//         description: "Please try again later.",
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   return (
//     <Card className="border-slate-200 shadow-sm">
//       <CardHeader className="space-y-1">
//         <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
//           Welcome back
//         </CardTitle>
//         <CardDescription className="text-slate-600">
//           Enter your credentials to access your account
//         </CardDescription>
//       </CardHeader>
//       <CardContent>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           {error && (
//             <div className="rounded-lg bg-red-50 border border-red-200 p-3 flex items-start gap-3">
//               <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
//               <div>
//                 <h4 className="text-sm font-medium text-red-900">
//                   Authentication Error
//                 </h4>
//                 <p className="text-sm text-red-700 mt-1">{error}</p>
//               </div>
//             </div>
//           )}

//           <div className="space-y-2">
//             <Label htmlFor="email">Email Address</Label>
//             <div className="relative">
//               <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
//               <Input
//                 id="email"
//                 type="email"
//                 placeholder="advocate@example.com"
//                 value={formData.email}
//                 onChange={(e) =>
//                   setFormData({ ...formData, email: e.target.value })
//                 }
//                 className="pl-10"
//                 required
//                 disabled={isLoading}
//               />
//             </div>
//           </div>

//           <div className="space-y-2">
//             <div className="flex items-center justify-between">
//               <Label htmlFor="password">Password</Label>
//               <Link
//                 href="/forgot-password"
//                 className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
//               >
//                 Forgot password?
//               </Link>
//             </div>
//             <div className="relative">
//               <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
//               <Input
//                 id="password"
//                 type="password"
//                 placeholder="••••••••"
//                 value={formData.password}
//                 onChange={(e) =>
//                   setFormData({ ...formData, password: e.target.value })
//                 }
//                 className="pl-10"
//                 required
//                 disabled={isLoading}
//               />
//             </div>
//           </div>

//           <Button
//             type="submit"
//             className="w-full"
//             disabled={isLoading}
//           >
//             {isLoading ? (
//               <>
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                 Signing in...
//               </>
//             ) : (
//               "Sign in"
//             )}
//           </Button>
//         </form>
//       </CardContent>
//       <CardFooter className="flex flex-col space-y-4">
//         <div className="text-sm text-center text-slate-600">
//           Don't have an account?{" "}
//           <Link
//             href="/register"
//             className="text-indigo-600 hover:text-indigo-700 font-medium"
//           >
//             Create an account
//           </Link>
//         </div>

//         <div className="relative">
//           <div className="absolute inset-0 flex items-center">
//             <span className="w-full border-t border-slate-200" />
//           </div>
//           <div className="relative flex justify-center text-xs uppercase">
//             <span className="bg-white px-2 text-slate-500">
//               Secure Authentication
//             </span>
//           </div>
//         </div>

//         <p className="text-xs text-center text-slate-500">
//           By signing in, you agree to our{" "}
//           <Link href="/terms" className="underline hover:text-slate-700">
//             Terms of Service
//           </Link>{" "}
//           and{" "}
//           <Link href="/privacy" className="underline hover:text-slate-700">
//             Privacy Policy
//           </Link>
//         </p>
//       </CardFooter>
//     </Card>
//   )
// }

// src/app/auth/signin/page.tsx
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl
      });

      if (result?.error) {
        setError(result.error);
      } else if (result?.ok) {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In to LawMate</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="advocate@example.com"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            <a href="/auth/forgot-password" className="hover:underline">
              Forgot password?
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}