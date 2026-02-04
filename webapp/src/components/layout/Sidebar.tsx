"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils/cn"
import {
  Scale,
  LayoutDashboard,
  FolderOpen,
  FileText,
  Calendar,
  Search,
  Settings,
  LogOut,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/lib/hooks/useAuth"

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Cases",
    href: "/cases",
    icon: FolderOpen,
  },
  {
    name: "Documents",
    href: "/documents",
    icon: FileText,
  },
  {
    name: "Calendar",
    href: "/calendar",
    icon: Calendar,
  },
  {
    name: "Search",
    href: "/search",
    icon: Search,
  },
]

const secondaryNavigation = [
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-200">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-600">
          <Scale className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-slate-900 text-lg tracking-tight">
            Lawmate
          </h1>
          <p className="text-xs text-slate-600">Case Management</p>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start transition-all",
                    isActive
                      ? "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-medium"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Button>
              </Link>
            )
          })}
        </nav>

        {/* AI Assistant CTA */}
        <div className="mt-6 mx-3 p-4 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-indigo-600 p-2">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">
                AI Assistant
              </h4>
              <p className="text-xs text-slate-600 mb-3">
                Get instant insights on your cases with Claude AI
              </p>
              <Button size="sm" variant="default" className="w-full">
                Try Now
              </Button>
            </div>
          </div>
        </div>

        {/* Secondary Navigation */}
        <div className="mt-6 pt-6 border-t border-slate-200">
          <nav className="space-y-1">
            {secondaryNavigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start transition-all",
                      isActive
                        ? "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Button>
                </Link>
              )
            })}
          </nav>
        </div>
      </ScrollArea>

      {/* User Profile */}
      <div className="border-t border-slate-200 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm">
            {user?.khc_advocate_name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-slate-900 text-sm truncate">
              {user?.khc_advocate_name}
            </div>
            <div className="text-xs text-slate-600 truncate">
              {user?.khc_advocate_id}
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => logout()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}