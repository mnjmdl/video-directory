'use client'

import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl: string
  searchParams?: Record<string, string>
}

export function Pagination({ currentPage, totalPages, baseUrl, searchParams = {} }: PaginationProps) {
  if (totalPages <= 1) return null

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams)
    if (page > 1) {
      params.set('page', page.toString())
    } else {
      params.delete('page')
    }
    const queryString = params.toString()
    return queryString ? `${baseUrl}?${queryString}` : baseUrl
  }

  const getVisiblePages = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  return (
    <div className="flex items-center justify-center space-x-2 mt-8">
      {/* Previous Button */}
      {currentPage > 1 ? (
        <Link
          href={createPageUrl(currentPage - 1)}
          className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:block">Previous</span>
        </Link>
      ) : (
        <div className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed">
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:block">Previous</span>
        </div>
      )}

      {/* Page Numbers */}
      <div className="flex items-center space-x-1">
        {getVisiblePages().map((page, index) => {
          if (page === '...') {
            return (
              <div key={`dots-${index}`} className="px-3 py-2 text-gray-500 dark:text-gray-400">
                ...
              </div>
            )
          }

          const pageNum = page as number
          const isActive = pageNum === currentPage

          return (
            <Link
              key={pageNum}
              href={createPageUrl(pageNum)}
              className={`px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-red-600 text-white font-semibold'
                  : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              {pageNum}
            </Link>
          )
        })}
      </div>

      {/* Next Button */}
      {currentPage < totalPages ? (
        <Link
          href={createPageUrl(currentPage + 1)}
          className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
        >
          <span className="hidden sm:block">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <div className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed">
          <span className="hidden sm:block">Next</span>
          <ChevronRight className="h-4 w-4" />
        </div>
      )}
    </div>
  )
}