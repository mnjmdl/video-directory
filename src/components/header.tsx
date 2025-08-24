'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession, signIn, signOut } from 'next-auth/react'
import { Search, Upload, User, Menu, Home, TrendingUp, Library } from 'lucide-react'
import { useState, FormEvent } from 'react'

export function Header() {
  const { data: session } = useSession()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo and navigation */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full hover:bg-gray-100 md:hidden">
                <Menu className="h-5 w-5" />
              </button>
              <Link href="/" className="flex items-center space-x-2">
                <div className="bg-red-600 text-white p-2 rounded-lg">
                  <span className="text-xl font-bold">VH</span>
                </div>
                <span className="hidden sm:block text-xl font-semibold text-gray-600">VideoHub</span>
              </Link>
            </div>
            
            {/* Navigation - hidden on mobile */}
            <nav className="hidden md:flex space-x-2">
              <Link href="/" className="flex items-center space-x-2 px-4 py-3 rounded-lg text-gray-700 font-medium hover:bg-red-50 hover:text-red-600 transition-all duration-200 group">
                <Home className="h-5 w-5 group-hover:text-red-600" />
                <span className="text-sm font-semibold">Home</span>
              </Link>
              <Link href="/trending" className="flex items-center space-x-2 px-4 py-3 rounded-lg text-gray-700 font-medium hover:bg-red-50 hover:text-red-600 transition-all duration-200 group">
                <TrendingUp className="h-5 w-5 group-hover:text-red-600" />
                <span className="text-sm font-semibold">Trending</span>
              </Link>
              {session && (
                <Link href="/library" className="flex items-center space-x-2 px-4 py-3 rounded-lg text-gray-700 font-medium hover:bg-red-50 hover:text-red-600 transition-all duration-200 group">
                  <Library className="h-5 w-5 group-hover:text-red-600" />
                  <span className="text-sm font-semibold">Library</span>
                </Link>
              )}
            </nav>
          </div>

          {/* Center - Search */}
          <div className="flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch(e)
                  }
                }}
                className="w-full px-4 py-2 pl-10 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <button 
                type="submit"
                onClick={handleSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors"
              >
                <Search className="h-4 w-4 text-gray-600" />
              </button>
            </form>
          </div>

          {/* Right side - User actions */}
          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <Link href="/upload" className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition-colors">
                  <Upload className="h-4 w-4" />
                  <span className="hidden sm:block">Upload</span>
                </Link>
                <div className="relative">
                  <button 
                    className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100"
                    onClick={() => signOut()}
                  >
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                    <span className="hidden lg:block text-gray-600">{session.user?.name || (session.user as { username?: string })?.username}</span>
                  </button>
                </div>
              </>
            ) : (
              <button 
                onClick={() => signIn()}
                className="flex items-center space-x-2 border border-gray-300 px-4 py-2 rounded-full hover:bg-gray-50 transition-colors"
              >
                <User className="h-4 w-4 text-gray-600" />
                <span className="text-gray-600">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
