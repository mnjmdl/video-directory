'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession, signIn, signOut } from 'next-auth/react'
import { Search, Upload, User, Menu, Home, Library, Sun, Moon } from 'lucide-react'
import { useState, FormEvent } from 'react'

export function Header() {
  const { data: session } = useSession()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [dropdownOpen, setDropdownOpen] = useState(false)

  // Initialize theme from localStorage or system preference
  useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark'
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      const initialTheme = savedTheme || systemTheme
      setTheme(initialTheme)

      if (initialTheme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  })

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)

    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo and navigation */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden">
                <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
              <Link href="/" className="flex items-center space-x-2">
                <div className="bg-red-600 text-white p-2 rounded-lg">
                  <span className="text-xl font-bold">CVL</span>
                </div>
                <span className="hidden sm:block text-xl font-semibold text-gray-600 dark:text-gray-300">Crystal Video Library</span>
              </Link>
            </div>

            {/* Navigation - hidden on mobile */}
            <nav className="hidden md:flex space-x-2">
              <Link href="/" className="flex items-center space-x-2 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 group">
                <Home className="h-5 w-5 group-hover:text-red-600 dark:group-hover:text-red-400" />
                <span className="text-sm font-semibold">Home</span>
              </Link>
              {/* <Link href="/trending" className="flex items-center space-x-2 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 group">
                <TrendingUp className="h-5 w-5 group-hover:text-red-600 dark:group-hover:text-red-400" />
                <span className="text-sm font-semibold">Trending</span>
              </Link> */}
              {session && (
                <Link href="/library" className="flex items-center space-x-2 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 group">
                  <Library className="h-5 w-5 group-hover:text-red-600 dark:group-hover:text-red-400" />
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
                className="w-full px-4 py-2 pl-10 pr-12 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <button
                type="submit"
                onClick={handleSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 p-2 rounded-full transition-colors"
              >
                <Search className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              </button>
            </form>
          </div>

          {/* Right side - Theme toggle and User actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <Sun className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>

            {session ? (
              <>
                <Link href="/upload" className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition-colors">
                  <Upload className="h-4 w-4" />
                  <span className="hidden sm:block">Upload</span>
                </Link>
                <div className="relative">
                  <button
                    className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                    <span className="hidden lg:block text-gray-600 dark:text-gray-300">{session.user?.name || (session.user as { username?: string })?.username}</span>
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                      {(session.user as { role?: string })?.role === 'ADMIN' && (
                        <>
                          <Link
                            href="/admin/users"
                            onClick={() => setDropdownOpen(false)}
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-md"
                          >
                            Manage Users
                          </Link>
                          <Link
                            href="/admin/setup"
                            onClick={() => setDropdownOpen(false)}
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            Setup Admin
                          </Link>
                          <Link
                            href="/auth/signup"
                            onClick={() => setDropdownOpen(false)}
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            Create User
                          </Link>
                        </>
                      )}
                      <Link
                        href="/settings"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Settings
                      </Link>
                      <button
                        onClick={() => {
                          signOut()
                          setDropdownOpen(false)
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                          (session.user as { role?: string })?.role === 'ADMIN' ? '' : 'rounded-md'
                        }`}
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button
                onClick={() => signIn()}
                className="flex items-center space-x-2 border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
              >
                <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
