import { AlertCircle, UserPlus } from 'lucide-react'
import Link from 'next/link'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
            <UserPlus className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Sign Up for VideoHub
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Create your account to start sharing videos
          </p>
        </div>

        {/* Demo Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-blue-900 mb-2">
                Demo Mode
              </h3>
              <p className="text-sm text-blue-800 mb-3">
                This is a demo application. For testing purposes, you can use the existing demo accounts instead of creating a new one.
              </p>
              <div className="space-y-2 text-sm text-blue-800">
                <div className="bg-white bg-opacity-50 p-2 rounded">
                  <div className="font-medium">Available Demo Accounts:</div>
                  <div className="ml-4 space-y-1 mt-1">
                    <div>• admin@videohub.com (password: admin123)</div>
                    <div>• john.doe@example.com (any password)</div>
                    <div>• jane.smith@example.com (any password)</div>
                    <div>• mike.wilson@example.com (any password)</div>
                    <div>• sarah.johnson@example.com (any password)</div>
                    <div>• alex.brown@example.com (any password)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sign In Link */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              Ready to get started?
            </p>
            <Link
              href="/auth/signin"
              className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              Go to Sign In
            </Link>
            <p className="text-xs text-gray-500">
              Use one of the demo accounts to explore the platform
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-red-600 hover:text-red-500 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
