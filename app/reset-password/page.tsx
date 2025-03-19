import Link from "next/link"
import ResetPasswordForm from "./reset-password-form"

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Reset Password</h1>
          <p className="mt-2 text-gray-600">Enter your email to receive a password reset link</p>
        </div>
        <ResetPasswordForm />
        <div className="text-center">
          <Link href="/" className="text-sm text-blue-600 hover:text-blue-800">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}

