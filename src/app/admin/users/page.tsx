'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Shield, Users, UserPlus, Search, Calendar, Video, MessageCircle, UserCheck, UserX, Trash2, Crown, Shield as ShieldIcon, User } from 'lucide-react'
import Link from 'next/link'

interface User {
  id: string
  email: string
  username: string
  name: string | null
  role: 'ADMIN' | 'MODERATOR' | 'USER'
  disabled: boolean
  createdAt: string
  _count: {
    videos: number
    comments: number
  }
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    if ((session.user as { role?: string })?.role !== 'ADMIN') {
      router.push('/')
      return
    }

    fetchUsers()
  }, [session, status, router, mounted])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      const data = await response.json()

      if (response.ok) {
        setUsers(data.users || [])
        setError(null)
      } else {
        setError(data.error || 'Failed to fetch users')
        setUsers([])
      }
    } catch {
      setError('Network error occurred')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const handleToggleUserStatus = async (userId: string, disabled: boolean) => {
    if (!confirm(disabled ? 'Are you sure you want to disable this user?' : 'Are you sure you want to enable this user?')) {
      return
    }

    setActionLoading(userId)
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ disabled }),
      })

      const data = await response.json()

      if (response.ok) {
        setUsers(users.map(user =>
          user.id === userId ? { ...user, disabled } : user
        ))
      } else {
        setError(data.error || 'Failed to update user status')
      }
    } catch {
      setError('Network error occurred')
    } finally {
      setActionLoading(null)
    }
  }

  const handleChangeUserRole = async (userId: string, newRole: 'ADMIN' | 'MODERATOR' | 'USER', username: string) => {
    if (!confirm(`Are you sure you want to change ${username}'s role to ${newRole.toLowerCase()}?`)) {
      return
    }

    setActionLoading(userId)
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      })

      const data = await response.json()

      if (response.ok) {
        setUsers(users.map(user =>
          user.id === userId ? { ...user, role: newRole } : user
        ))
      } else {
        setError(data.error || 'Failed to update user role')
      }
    } catch {
      setError('Network error occurred')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!confirm(`Are you sure you want to permanently delete user "${username}"? This action cannot be undone.`)) {
      return
    }

    setActionLoading(userId)
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        setUsers(users.filter(user => user.id !== userId))
      } else {
        setError(data.error || 'Failed to delete user')
      }
    } catch {
      setError('Network error occurred')
    } finally {
      setActionLoading(null)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Crown className="h-4 w-4 text-yellow-600" />
      case 'MODERATOR':
        return <ShieldIcon className="h-4 w-4 text-blue-600" />
      default:
        return <User className="h-4 w-4 text-gray-600" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'text-yellow-600 bg-yellow-100'
      case 'MODERATOR':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!mounted || status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if ((session?.user as { role?: string })?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-red-600" />
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="mt-2 text-gray-600">You don't have permission to view this page.</p>
          <Link
            href="/"
            className="mt-4 inline-block text-red-600 hover:text-red-500"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Users className="mr-3 h-8 w-8 text-red-600" />
                User Management
              </h1>
              <p className="mt-2 text-gray-600">Manage all users in the system</p>
            </div>
            <Link
              href="/auth/signup"
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Create User
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name, email, or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Users List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              All Users ({filteredUsers.length})
            </h2>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              {searchTerm ? 'No users found matching your search.' : 'No users found.'}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <div key={user.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        user.disabled ? 'bg-red-100' : 'bg-gray-300'
                      }`}>
                        <span className={`font-medium ${
                          user.disabled ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {user.name?.charAt(0)?.toUpperCase() || user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className={`text-sm font-medium ${
                            user.disabled ? 'text-red-600' : 'text-gray-900'
                          }`}>
                            {user.name || user.username}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full flex items-center space-x-1 ${getRoleColor(user.role)}`}>
                              {getRoleIcon(user.role)}
                              <span>{user.role.toLowerCase()}</span>
                            </span>
                            {user.disabled && (
                              <span className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded-full">
                                Disabled
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500">@{user.username}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Video className="h-4 w-4" />
                          <span>{user._count.videos} videos</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="h-4 w-4" />
                          <span>{user._count.comments} comments</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {/* Role Change Dropdown */}
                        <select
                          value={user.role}
                          onChange={(e) => handleChangeUserRole(user.id, e.target.value as 'ADMIN' | 'MODERATOR' | 'USER', user.username)}
                          disabled={actionLoading === user.id}
                          className="text-xs px-2 py-1 border border-gray-300 rounded-md bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="USER">User</option>
                          <option value="MODERATOR">Moderator</option>
                          <option value="ADMIN">Admin</option>
                        </select>

                        {/* Status Toggle */}
                        <button
                          onClick={() => handleToggleUserStatus(user.id, !user.disabled)}
                          disabled={actionLoading === user.id}
                          className={`p-2 rounded-lg transition-colors ${
                            user.disabled
                              ? 'text-green-600 hover:bg-green-50'
                              : 'text-orange-600 hover:bg-orange-50'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                          title={user.disabled ? 'Enable user' : 'Disable user'}
                        >
                          {user.disabled ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteUser(user.id, user.username)}
                          disabled={actionLoading === user.id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete user"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}