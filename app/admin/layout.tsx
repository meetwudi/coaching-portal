import type React from "react"
import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { MainNav } from "@/components/main-nav"
import { MobileNav } from "@/components/mobile-nav"
import { UserNav } from "@/components/user-nav"
import { LayoutDashboard, Users, FileText, Mail } from "lucide-react"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  if (!profile || profile.role !== "admin") {
    redirect("/")
  }

  const navItems = [
    {
      title: "Dashboard",
      href: "/admin/dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      title: "Students",
      href: "/admin/students",
      icon: <Users className="h-4 w-4" />,
    },
    {
      title: "Notes",
      href: "/admin/notes",
      icon: <FileText className="h-4 w-4" />,
    },
    {
      title: "Invitations",
      href: "/admin/invitations",
      icon: <Mail className="h-4 w-4" />,
    },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="sticky top-0 z-40 border-b bg-white shadow-sm">
        <div className="max-w-6xl mx-auto w-full flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center">
              <MobileNav items={navItems} title="Career Coach Admin" />
              <h1 className="text-xl font-bold ml-2 md:ml-0">Career Coach Admin</h1>
            </div>
            <div className="hidden md:block">
              <MainNav items={navItems} isAdmin={true} />
            </div>
          </div>
          <UserNav
            user={{
              id: session.user.id,
              email: session.user.email || "",
              first_name: profile.first_name,
              last_name: profile.last_name,
            }}
          />
        </div>
      </header>
      <main className="flex-1 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">{children}</div>
      </main>
    </div>
  )
}

