import { Suspense } from 'react'
import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { VideoGrid } from '@/components/video-grid'
import { Pagination } from '@/components/pagination'
import { Eye, ThumbsUp, MessageCircle, Library as LibraryIcon } from 'lucide-react'

interface LibraryPageProps {
  searchParams: Promise<{ page?: string }>
}

const VIDEOS_PER_PAGE = 50

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const { page: pageParam } = await searchParams
  const currentPage = Math.max(1, parseInt(pageParam || '1'))

  // Get user's liked videos
  const likedVideos = await prisma.like.findMany({
    where: {
      userId: session.user.id,
      type: 'LIKE',
    },
    include: {
      video: {
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
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  const videos = likedVideos.map(like => like.video).filter(video => video.isPublished)
  const totalVideos = videos.length
  const totalPages = Math.ceil(totalVideos / VIDEOS_PER_PAGE)
  const startIndex = (currentPage - 1) * VIDEOS_PER_PAGE
  const endIndex = startIndex + VIDEOS_PER_PAGE
  const paginatedVideos = videos.slice(startIndex, endIndex)

  // Build search params for pagination
  const paginationSearchParams: Record<string, string> = {}

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <LibraryIcon className="w-8 h-8 text-red-600" />
          <h1 className="text-3xl font-bold text-gray-400">My Library</h1>
        </div>
        <p className="text-gray-600">
          Your collection of liked videos and saved content
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
              <Eye className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalVideos}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Liked Videos</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <ThumbsUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {likedVideos.reduce((sum, like) => sum + like.video._count.likes, 0)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Likes</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
              <MessageCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {likedVideos.reduce((sum, like) => sum + like.video._count.comments, 0)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Comments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {totalVideos > 0 ? (
        <>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Videos You Liked
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {totalVideos} video{totalVideos !== 1 ? 's' : ''} in your library
            </p>
          </div>

          <VideoGrid videos={paginatedVideos} />

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              baseUrl="/library"
              searchParams={paginationSearchParams}
            />
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <LibraryIcon className="w-12 h-12 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Your library is empty
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            Start building your collection by liking videos that interest you.
            They&apos;ll appear here for easy access.
          </p>
          <Link
            href="/"
            className="inline-flex items-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-full hover:bg-red-700 transition-colors"
          >
            <span>Browse Videos</span>
          </Link>
        </div>
      )}
    </div>
  )
}