'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

export default function AdminTestPage() {
  const { data: session, status } = useSession()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Session information is displayed in the UI
  }, [session, status, mounted])

  if (!mounted || status === 'loading') {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Test Page</h1>
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="font-semibold mb-2">Session Information:</h2>
        <p><strong>Status:</strong> {status}</p>
        <p><strong>User:</strong> {session?.user?.email || 'Not logged in'}</p>
        <p><strong>Role:</strong> {(session?.user as any)?.role || 'No role'}</p>
        <p><strong>Is Admin:</strong> {(session?.user as any)?.role === 'ADMIN' ? 'Yes' : 'No'}</p>
      </div>

      <div className="mt-4">
        <p className="text-sm text-gray-600">
          Check the browser console for detailed session information.
        </p>
      </div>
    </div>
  )
}