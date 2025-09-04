'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Shield, CheckCircle, AlertCircle } from 'lucide-react'

export default function AdminSetupPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }
  }, [session, status, router])

  const handleSetupAdmin = async () => {
    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Admin user setup completed! The admin user now has ADMIN role and full access.'
        })

        // Redirect to admin users page after a short delay
        setTimeout(() => {
          router.push('/admin/users')
        }, 2000)
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Failed to setup admin user'
        })
      }
    } catch {
      setMessage({
        type: 'error',
        text: 'Network error occurred'
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Setup</h1>
          <p className="mt-2 text-gray-600">
            Set up admin access for the admin user
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Setup Admin User</h2>
            <p className="text-sm text-gray-600 mb-4">
              This will grant ADMIN role to the user with email <strong>admin@crystal.com</strong>.
              This user will then have full access to user management features.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-blue-900 mb-1">
                    Important
                  </h3>
                  <p className="text-sm text-blue-800">
                    Make sure the admin user exists before running this setup.
                    You can create the admin user through the signup page if it doesn&apos;t exist.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {message && (
            <div className={`mb-4 p-4 rounded-lg flex items-center space-x-3 ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
              )}
              <p className="text-sm">{message.text}</p>
            </div>
          )}

          <button
            onClick={handleSetupAdmin}
            disabled={isLoading}
            className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : null}
            Setup Admin Access
          </button>

          <div className="mt-4 text-center">
            <button
              onClick={() => router.push('/admin/users')}
              className="text-sm text-red-600 hover:text-red-500"
            >
              ← Back to User Management
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}