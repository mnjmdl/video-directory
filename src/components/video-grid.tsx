'use client'

import Link from 'next/link'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { Eye, ThumbsUp, MessageCircle, Clock } from 'lucide-react'

interface VideoGridProps {
  videos: Array<{
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
    } | null
    _count: {
      likes: number
      comments: number
    }
  }>
}

export function VideoGrid({ videos }: VideoGridProps) {
  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '0:00'
    
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`
    }
    return views.toString()
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {videos.map((video) => (
        <div key={video.id} className="group cursor-pointer">
          <Link href={`/video/${video.id}`}>
            <div className="space-y-3">
              {/* Thumbnail */}
              <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden">
                {video.thumbnailUrl ? (
                  <Image
                    src={video.thumbnailUrl}
                    alt={video.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Eye className="w-8 h-8 text-gray-500" />
                      </div>
                      <span className="text-sm text-gray-500">No thumbnail</span>
                    </div>
                  </div>
                )}
                
                {/* Duration overlay */}
                {video.duration && (
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatDuration(video.duration)}</span>
                  </div>
                )}
              </div>

              {/* Video Info */}
              <div className="space-y-2">
                {/* Title */}
                <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-red-600 transition-colors">
                  {video.title}
                </h3>

                {/* Creator */}
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                    {video.user.avatar ? (
                      <Image
                        src={video.user.avatar}
                        alt={video.user.name || video.user.username}
                        width={24}
                        height={24}
                        className="object-cover rounded-full"
                      />
                    ) : (
                      <span className="text-xs font-medium text-gray-600">
                        {(video.user.name || video.user.username).charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-600 hover:text-gray-900">
                    {video.user.name || video.user.username}
                  </span>
                </div>

                {/* Stats */}
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>{formatViews(video.views)} views</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <ThumbsUp className="w-4 h-4" />
                    <span>{formatViews(video._count.likes)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>{video._count.comments}</span>
                  </div>
                </div>

                {/* Upload date and category */}
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}</span>
                  {video.category && (
                    <span className="bg-gray-100 px-2 py-1 rounded-full">
                      {video.category.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  )
}
