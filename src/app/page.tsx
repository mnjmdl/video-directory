import { Suspense } from 'react'
import { VideoGrid } from '@/components/video-grid'
import { CategoryFilter } from '@/components/category-filter'
import { prisma } from '@/lib/prisma'

interface HomeProps {
  searchParams: Promise<{ category?: string }>
}

export default async function Home({ searchParams }: HomeProps) {
  const { category: selectedCategory } = await searchParams
  
  // Build where clause for video filtering
  const videoWhere: {
    isPublished: boolean
    category?: {
      slug: string
    }
  } = {
    isPublished: true,
  }
  
  // Add category filter if specified
  if (selectedCategory) {
    videoWhere.category = {
      slug: selectedCategory
    }
  }
  
  // Get videos and categories from database
  const [videos, categories] = await Promise.all([
    prisma.video.findMany({
      where: videoWhere,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
          },
        },
        category: true,
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // Limit initial load
    }),
    prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    }),
  ])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-400 mb-2">
          {selectedCategory 
            ? `${categories.find(c => c.slug === selectedCategory)?.name || selectedCategory} Videos` 
            : 'Welcome to VideoHub'
          }
        </h1>
        <p className="text-gray-600">
          {selectedCategory 
            ? `Explore ${categories.find(c => c.slug === selectedCategory)?.name?.toLowerCase() || selectedCategory} content` 
            : 'Discover and share amazing videos from creators around the world'
          }
        </p>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <Suspense fallback={
          <div className="flex items-center space-x-2 px-4 py-2 rounded-full border bg-white text-gray-700 border-gray-300">
            <div className="w-4 h-4 bg-gray-300 rounded animate-pulse" />
            <span>Loading filters...</span>
          </div>
        }>
          <CategoryFilter categories={categories} />
        </Suspense>
      </div>

      {/* Video Grid */}
      {videos.length > 0 ? (
        <VideoGrid videos={videos} />
      ) : (
        <div className="text-center py-12">
          <div className="bg-gray-100 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {selectedCategory ? 'No videos in this category' : 'No videos yet'}
          </h3>
          <p className="text-gray-500 mb-4">
            {selectedCategory 
              ? `No videos found in the ${categories.find(c => c.slug === selectedCategory)?.name?.toLowerCase() || selectedCategory} category. Try selecting a different category.`
              : 'Be the first to upload a video to get started!'
            }
          </p>
        </div>
      )}
    </div>
  )
}
