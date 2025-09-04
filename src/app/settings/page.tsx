import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { PasswordChangeForm } from '@/components/password-change-form'
import { Settings, User, Shield } from 'lucide-react'

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <Settings className="w-8 h-8 text-red-600" />
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        </div>
        <p className="text-gray-600">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <nav className="space-y-4">
              <div className="flex items-center space-x-3 text-gray-900">
                <User className="w-5 h-5" />
                <span className="font-medium">Profile</span>
              </div>
              <div className="flex items-center space-x-3 text-red-600">
                <Shield className="w-5 h-5" />
                <span className="font-medium">Security</span>
              </div>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Security Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Shield className="w-6 h-6 text-red-600" />
              <h2 className="text-xl font-semibold text-gray-900">Security Settings</h2>
            </div>

            <div className="space-y-6">
              {/* Current User Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Account Information</h3>
                <div className="text-sm text-gray-600">
                  <p><strong>Email:</strong> {session.user.email}</p>
                  <p><strong>Username:</strong> {session.user.username}</p>
                  <p><strong>Role:</strong> {session.user.role}</p>
                </div>
              </div>

              {/* Password Change Form */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                <PasswordChangeForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}