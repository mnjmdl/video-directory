'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { VideoGrid } from '@/components/video-grid'
import { CategoryFilter } from '@/components/category-filter'
import { Search, Loader2, AlertCircle } from 'lucide-react'

interface SearchResults {
  results: Array<{
    id: string
    title: string
    description: string | null
    videoUrl: string
    thumbnailUrl: string | null
    duration: number | null
    views: number
    createdAt: Date
    user: {
      id: string
      username: string
      name: string | null
      avatar: string | null
    }
    category: {
      id: string
      name: string
      slug: string
      color: string | null
    } | null
    _count: {
      likes: number
      comments: number
    }
  }>
  pagination: {
    page: number
    limit: number
    totalResults: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  query: {
    q: string
    category?: string
  }
}

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [results, setResults] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState([])

  const query = searchParams.get('q') || ''
  const category = searchParams.get('category') || ''
  const page = parseInt(searchParams.get('page') || '1')

  // Load categories for filter
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (response.ok) {
          const data = await response.json()
          setCategories(data)
        }
      } catch (error) {
        console.error('Failed to load categories:', error)
      }
    }
    loadCategories()
  }, [])

  // Perform search when query parameters change
  useEffect(() => {
    if (!query) {
      setResults(null)
      return
    }

    const performSearch = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const searchUrl = new URL('/api/search', window.location.origin)
        searchUrl.searchParams.set('q', query)
        if (category) searchUrl.searchParams.set('category', category)
        searchUrl.searchParams.set('page', page.toString())
        
        const response = await fetch(searchUrl.toString())
        
        if (!response.ok) {
          throw new Error(`Search failed: ${response.status}`)
        }
        
        const data = await response.json()
        setResults(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed')
        setResults(null)
      } finally {
        setLoading(false)
      }
    }

    performSearch()
  }, [query, category, page])

  const handleCategoryFilter = (categorySlug: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (categorySlug) {
      params.set('category', categorySlug)
    } else {
      params.delete('category')
    }
    params.delete('page') // Reset to first page
    
    router.push(`/search?${params.toString()}`)
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', newPage.toString())
    router.push(`/search?${params.toString()}`)
  }

  if (!query) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="bg-gray-100 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
            <Search className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Start searching</h2>
          <p className="text-gray-600">Enter a search term to find videos</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Info */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Search Results for &quot;{query}&quot;
        </h1>
        {results && (
          <p className="text-gray-600">
            {results.pagination.totalResults} result{results.pagination.totalResults !== 1 ? 's' : ''} found
            {category && ` in ${category} category`}
          </p>
        )}
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="mb-6">
          <CategoryFilter 
            categories={categories} 
            selectedCategory={category} 
            onCategoryChange={handleCategoryFilter}
          />
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-red-600" />
          <span className="ml-2 text-gray-600">Searching...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex items-center justify-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <div className="flex items-center">
              <AlertCircle className="w-6 h-6 text-red-600 mr-2" />
              <div>
                <h3 className="text-red-800 font-medium">Search Error</h3>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Results */}
      {results && !loading && !error && (
        <>
          {results.results.length > 0 ? (
            <>
              <VideoGrid videos={results.results} />
              
              {/* Pagination */}
              {results.pagination.totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 mt-8">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={!results.pagination.hasPrevPage}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  <div className="flex space-x-1">
                    {Array.from({ length: Math.min(5, results.pagination.totalPages) }, (_, i) => {
                      const pageNum = i + 1
                      const isCurrentPage = pageNum === page
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-2 text-sm font-medium rounded-md ${
                            isCurrentPage
                              ? 'bg-red-600 text-white'
                              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={!results.pagination.hasNextPage}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your search terms or removing category filters
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-red-600" />
          <span className="ml-2 text-gray-600">Loading search...</span>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}
