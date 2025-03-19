import UpdatePasswordForm from "./update-password-form"

export default function UpdatePasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Update Password</h1>
          <p className="mt-2 text-gray-600">Enter your new password below</p>
        </div>
        <UpdatePasswordForm />
      </div>
    </div>
  )
}

