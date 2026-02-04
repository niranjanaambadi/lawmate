import { Scale } from "lucide-react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur">
              <Scale className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white text-2xl tracking-tight">
                Lawmate
              </h1>
              <p className="text-indigo-200 text-sm">
                Lawyer's Personal Assistant
              </p>
            </div>
          </div>

          {/* <div className="space-y-6">
            <h2 className="text-4xl font-bold text-white leading-tight">
              Manage your cases with confidence
            </h2>
            <p className="text-lg text-indigo-100 leading-relaxed max-w-md">
              Professional case management system designed specifically for
              Kerala High Court advocates. Sync automatically or upload cases, get AI-powered
              insights, and never miss a deadline.
            </p>
          </div> */}
          <div className="relative z-10 space-y-12">
  {/* Headline Section */}
  <div className="space-y-6">
    <h2 className="text-4xl font-bold text-white leading-tight">
      Manage your cases <br /> with confidence
    </h2>
    <p className="text-lg text-indigo-100 leading-relaxed max-w-md">
      The all-in-one workspace designed specifically for
      Kerala High Court advocates.
    </p>
  </div>

  {/* Feature List Section - NEW */}
  <div className="space-y-5">
    {[
      { title: "KHC Cause List Sync", desc: "Automated updates from the High Court daily list." },
      { title: "AI Case Summaries", desc: "Instantly extract key points from long court orders." },
      { title: "Deadline Tracking", desc: "Smart reminders for filings, appearances, and bails." },
    ].map((feature, i) => (
      <div key={i} className="flex items-start gap-4 group">
        <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
          <svg className="w-4 h-4 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h3 className="text-white font-medium">{feature.title}</h3>
          <p className="text-indigo-200/80 text-sm leading-snug">{feature.desc}</p>
        </div>
      </div>
    ))}
  </div>
</div>
        </div>

        <div className="relative z-10">
          <div className="grid grid-cols-3 gap-8 text-white">
            <div>
              <div className="text-3xl font-bold mb-1">10+</div>
              <div className="text-sm text-indigo-200">Active Advocates</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">50K+</div>
              <div className="text-sm text-indigo-200">Cases Managed</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">99.9%</div>
              <div className="text-sm text-indigo-200">Uptime</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-600">
              <Scale className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-3xl">Lawmate</h1>
              <p className="text-xs text-slate-600">Lawyer's Personal Assistant</p>
            </div>
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}