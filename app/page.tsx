import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import LoginForm from "@/components/login-form"

export default async function Home() {
  const supabase = createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    if (profile?.role === "admin") {
      redirect("/admin/dashboard")
    } else {
      redirect("/student/dashboard")
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Career Coaching Portal</h1>
          <p className="mt-2 text-gray-600">Sign in to access your coaching portal</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}

