'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Filter, X } from 'lucide-react'

interface CategoryFilterProps {
  categories: Array<{
    id: string
    name: string
    slug: string
    color?: string | null
  }>
  selectedCategory?: string | null
  onCategoryChange?: (slug: string | null) => void
}

export function CategoryFilter({ categories, selectedCategory, onCategoryChange }: CategoryFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlCategory = searchParams.get('category')
  const [isOpen, setIsOpen] = useState(false)

  // Use prop selectedCategory if provided, otherwise fall back to URL parameter
  const currentCategory = selectedCategory !== undefined ? selectedCategory : urlCategory

  const handleCategorySelect = (slug: string | null) => {
    if (onCategoryChange) {
      // Use custom handler if provided
      onCategoryChange(slug)
    } else {
      // Default behavior: update URL
      const params = new URLSearchParams(searchParams)
      
      if (slug) {
        params.set('category', slug)
      } else {
        params.delete('category')
      }

      router.push(`/?${params.toString()}`)
    }
    setIsOpen(false)
  }

  const activeCategory = categories.find(cat => cat.slug === currentCategory)

  return (
    <div className="relative">
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-colors ${
          currentCategory 
            ? 'bg-red-600 text-white border-red-600' 
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
        }`}
      >
        <Filter className="w-4 h-4" />
        <span>
          {activeCategory ? activeCategory.name : 'All Categories'}
        </span>
        {currentCategory && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleCategorySelect(null)
            }}
            className="ml-1 hover:bg-red-700 rounded-full p-1"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="p-2">
              <div className="space-y-1">
                {/* All Categories Option */}
                <button
                  onClick={() => handleCategorySelect(null)}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                    !currentCategory 
                      ? 'bg-red-50 text-red-600' 
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-gray-400 rounded-full" />
                    <span>All Categories</span>
                  </div>
                </button>

                {/* Category Options */}
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.slug)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                      currentCategory === category.slug
                        ? 'bg-red-50 text-red-600'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ 
                          backgroundColor: category.color || '#6B7280' 
                        }}
                      />
                      <span>{category.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Mobile: Category Pills */}
      <div className="mt-4 md:hidden">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          <button
            onClick={() => handleCategorySelect(null)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm transition-colors ${
              !currentCategory
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategorySelect(category.slug)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm transition-colors ${
                currentCategory === category.slug
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
