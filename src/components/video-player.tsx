'use client'

import { useState, useRef } from 'react'
import { Play } from 'lucide-react'

interface VideoPlayerProps {
  videoUrl: string
  title: string
  videoId?: string
}

export function VideoPlayer({ videoUrl, title, videoId }: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [hasViewed, setHasViewed] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleLoadStart = () => {
    setIsLoading(true)
    setHasError(false)
  }

  const handleCanPlay = () => {
    setIsLoading(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  const handlePlay = async () => {
    if (videoId && !hasViewed) {
      try {
        // Check if user has already viewed this video in this session
        const viewedKey = `viewed_${videoId}`
        const hasAlreadyViewed = localStorage.getItem(viewedKey)

        if (!hasAlreadyViewed) {
          // Increment view count
          const response = await fetch(`/api/videos/${videoId}/view`, {
            method: 'POST',
          })

          if (response.ok) {
            const data = await response.json()
            // Update the view count in the UI
            const viewCountElement = document.getElementById('view-count')
            if (viewCountElement && data.views) {
              const formatViews = (views: number) => {
                if (views >= 1000000) {
                  return `${(views / 1000000).toFixed(1)}M`
                } else if (views >= 1000) {
                  return `${(views / 1000).toFixed(1)}K`
                }
                return views.toString()
              }
              viewCountElement.textContent = `${formatViews(data.views)} views`
            }

            // Mark as viewed in localStorage
            localStorage.setItem(viewedKey, 'true')
            setHasViewed(true)
          }
        } else {
          setHasViewed(true)
        }
      } catch (error) {
        console.error('Error incrementing view count:', error)
      }
    }
  }

  return (
    <div className="relative w-full h-full bg-black">
      {/* HTML5 video player */}
      <video
        ref={videoRef}
        src={videoUrl}
        controls
        className="w-full h-full object-contain"
        onLoadStart={handleLoadStart}
        onCanPlay={handleCanPlay}
        onError={handleError}
        onPlay={handlePlay}
        preload="metadata"
      >
        Your browser does not support the video tag.
      </video>

      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
          <div className="text-center text-white">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Play className="w-8 h-8 ml-1" />
            </div>
            <p className="text-sm">Loading video...</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-center text-white">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-8 h-8 ml-1" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-sm text-gray-300">Video could not be loaded</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
