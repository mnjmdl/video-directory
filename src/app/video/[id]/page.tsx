import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { prisma } from '@/lib/prisma'
import { VideoPlayer } from '@/components/video-player'
import { VideoSidebar } from '@/components/video-sidebar'
import { CommentSection } from '@/components/comment-section'
import { Eye, ThumbsUp, ThumbsDown, Share, Download, MessageCircle } from 'lucide-react'

interface VideoPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function VideoPage({ params }: VideoPageProps) {
  const { id } = await params
  const video = await prisma.video.findUnique({
    where: {
      id,
      isPublished: true,
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          name: true,
          avatar: true,
          bio: true,
          _count: {
            select: {
              videos: true,
              subscribers: true,
            },
          },
        },
      },
      category: true,
      comments: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
      likes: true,
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
  })

  if (!video) {
    notFound()
  }

  // Get related videos
  const relatedVideos = await prisma.video.findMany({
    where: {
      isPublished: true,
      id: {
        not: video.id,
      },
      OR: [
        {
          categoryId: video.categoryId,
        },
        {
          userId: video.userId,
        },
      ],
    },
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
    take: 10,
  })

  // Increment view count (in a real app, you'd do this more carefully to avoid inflating views)
  await prisma.video.update({
    where: { id },
    data: {
      views: {
        increment: 1,
      },
    },
  })

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`
    }
    return views.toString()
  }

  const likeCount = video.likes.filter(like => like.type === 'LIKE').length
  const dislikeCount = video.likes.filter(like => like.type === 'DISLIKE').length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Player */}
          <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
            <VideoPlayer videoUrl={video.videoUrl} title={video.title} />
          </div>

          {/* Video Info */}
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {video.title}
              </h1>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>{formatViews(video.views + 1)} views</span>
                  </div>
                  <span>•</span>
                  <span>{formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}</span>
                  {video.category && (
                    <>
                      <span>•</span>
                      <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">
                        {video.category.name}
                      </span>
                    </>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                    <ThumbsUp className="w-4 h-4" />
                    <span className="text-sm">{formatViews(likeCount)}</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                    <ThumbsDown className="w-4 h-4" />
                    <span className="text-sm">{formatViews(dislikeCount)}</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                    <Share className="w-4 h-4" />
                    <span className="text-sm">Share</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                    <Download className="w-4 h-4" />
                    <span className="text-sm">Save</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Channel Info */}
            <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                {video.user.avatar ? (
                  <Image
                    src={video.user.avatar}
                    alt={video.user.name || video.user.username}
                    width={48}
                    height={48}
                    className="object-cover rounded-full"
                  />
                ) : (
                  <span className="text-lg font-medium text-gray-600">
                    {(video.user.name || video.user.username).charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {video.user.name || video.user.username}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {formatViews(video.user._count.subscribers)} subscribers • {formatViews(video.user._count.videos)} videos
                    </p>
                  </div>
                  <button className="bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700 transition-colors">
                    Subscribe
                  </button>
                </div>
                {video.user.bio && (
                  <p className="text-sm text-gray-700 mt-2">{video.user.bio}</p>
                )}
              </div>
            </div>

            {/* Description */}
            {video.description && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{video.description}</p>
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="border-t pt-6">
            <div className="flex items-center space-x-4 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                <MessageCircle className="w-5 h-5" />
                <span>{formatViews(video._count.comments)} Comments</span>
              </h2>
            </div>
            
            <Suspense fallback={
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            }>
              <CommentSection videoId={video.id} comments={video.comments} />
            </Suspense>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Suspense fallback={
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex space-x-3">
                  <div className="w-40 h-24 bg-gray-200 rounded animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          }>
            <VideoSidebar videos={relatedVideos} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
