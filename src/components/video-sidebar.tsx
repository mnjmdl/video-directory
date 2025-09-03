import Link from 'next/link'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { Eye, Clock } from 'lucide-react'

interface VideoSidebarProps {
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

export function VideoSidebar({ videos }: VideoSidebarProps) {
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
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Up next</h2>
      <div className="space-y-3">
        {videos.map((video) => (
          <Link 
            key={video.id} 
            href={`/video/${video.id}`}
            className="group block"
          >
            <div className="flex space-x-3">
              {/* Thumbnail */}
              <div className="relative flex-shrink-0 w-40 aspect-video bg-gray-200 rounded-lg overflow-hidden">
                {video.thumbnailUrl ? (
                  <Image
                    src={video.thumbnailUrl}
                    alt={video.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <Eye className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                
                {/* Duration overlay */}
                {video.duration && (
                  <div className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-xs px-1 py-0.5 rounded flex items-center space-x-1">
                    <Clock className="w-2 h-2" />
                    <span>{formatDuration(video.duration)}</span>
                  </div>
                )}
              </div>

              {/* Video Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-600 line-clamp-2 group-hover:text-red-600 transition-colors text-sm leading-tight">
                  {video.title}
                </h3>
                
                <div className="mt-1 space-y-1">
                  <p className="text-xs text-gray-500 hover:text-gray-900">
                    {video.user.name || video.user.username}
                  </p>
                  
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>{formatViews(video.views)} views</span>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {videos.length === 0 && (
        <div className="text-center py-8">
          <div className="bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Eye className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">No related videos found</p>
        </div>
      )}
    </div>
  )
}
