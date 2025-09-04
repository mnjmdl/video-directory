import { Suspense } from 'react'
import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { SignInForm } from '@/components/signin-form'
import { AlertCircle, LogIn, User, Lock } from 'lucide-react'

interface SignInPageProps {
  searchParams: Promise<{
    callbackUrl?: string
    error?: string
  }>
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const session = await getServerSession(authOptions)
  const { callbackUrl, error } = await searchParams

  // Redirect if already signed in
  if (session) {
    redirect(callbackUrl || '/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
            <LogIn className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Sign in to Crystal Video Library
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Welcome back! Please sign in to your account.
          </p>
        </div>

        {/* Demo Credentials Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-blue-900 mb-2">
                Demo Credentials
              </h3>
              <div className="space-y-2 text-sm text-blue-800">
                <div className="bg-white bg-opacity-50 p-2 rounded">
                  <div className="flex items-center space-x-2 font-medium">
                    <User className="h-4 w-4" />
                    <span>Admin Account:</span>
                  </div>
                  <div className="ml-6 space-y-1">
                    <div>📧 Email: admin@crystal.com</div>
                    <div>🔑 Password: admin123</div>
                  </div>
                </div>
                <div className="bg-white bg-opacity-50 p-2 rounded">
                  <div className="flex items-center space-x-2 font-medium">
                    <User className="h-4 w-4" />
                    <span>Regular Users:</span>
                  </div>
                  <div className="ml-6">
                    Use any existing email with any password
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-sm text-red-700">
                {error === 'CredentialsSignin'
                  ? 'Invalid email or password. Please try again.'
                  : 'An error occurred during sign in.'}
              </p>
            </div>
          </div>
        )}

        {/* Sign In Form */}
        <Suspense fallback={
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Lock className="w-8 h-8 text-gray-300 mx-auto mb-4 animate-pulse" />
              <p className="text-gray-500">Loading sign in form...</p>
            </div>
          </div>
        }>
          <SignInForm callbackUrl={callbackUrl} />
        </Suspense>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <a
              href="/auth/signup"
              className="font-medium text-red-600 hover:text-red-500 transition-colors"
            >
              Sign up here
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
