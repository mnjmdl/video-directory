'use client'

import { useState } from 'react'
import { Play } from 'lucide-react'

interface VideoPlayerProps {
  videoUrl: string
  title: string
}

export function VideoPlayer({ videoUrl, title }: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

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

  return (
    <div className="relative w-full h-full bg-black">
      {/* HTML5 video player */}
      <video
        src={videoUrl}
        controls
        className="w-full h-full object-contain"
        onLoadStart={handleLoadStart}
        onCanPlay={handleCanPlay}
        onError={handleError}
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
