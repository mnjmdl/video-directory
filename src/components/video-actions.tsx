'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { ThumbsUp, ThumbsDown, Share, Download } from 'lucide-react'

interface VideoActionsProps {
  likeCount: number
  dislikeCount: number
  videoUrl: string
  videoTitle: string
  videoId: string
}

export function VideoActions({ likeCount, dislikeCount, videoUrl, videoTitle, videoId }: VideoActionsProps) {
  const { data: session } = useSession()
  const [currentLikeType, setCurrentLikeType] = useState<'LIKE' | 'DISLIKE' | null>(null)
  const [localLikeCount, setLocalLikeCount] = useState(likeCount)
  const [localDislikeCount, setLocalDislikeCount] = useState(dislikeCount)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch user's current like status
  useEffect(() => {
    if (session?.user && 'id' in session.user) {
      fetch(`/api/videos/${videoId}/like`)
        .then(res => res.json())
        .then(data => {
          if (data.type) {
            setCurrentLikeType(data.type)
          }
        })
        .catch(error => console.error('Error fetching like status:', error))
    }
  }, [session?.user, videoId])

  const handleLike = async (type: 'LIKE' | 'DISLIKE') => {
    if (!session?.user || !('id' in session.user)) {
      alert('Please sign in to like videos')
      return
    }

    if (isLoading) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/videos/${videoId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
      })

      const data = await response.json()

      if (data.success) {
        const previousLikeType = currentLikeType

        if (data.action === 'removed') {
          // User removed their like/dislike
          setCurrentLikeType(null)
          if (previousLikeType === 'LIKE') {
            setLocalLikeCount(prev => prev - 1)
          } else if (previousLikeType === 'DISLIKE') {
            setLocalDislikeCount(prev => prev - 1)
          }
        } else if (data.action === 'created') {
          // User added a new like/dislike
          setCurrentLikeType(data.type)
          if (data.type === 'LIKE') {
            setLocalLikeCount(prev => prev + 1)
          } else {
            setLocalDislikeCount(prev => prev + 1)
          }
        } else if (data.action === 'updated') {
          // User changed from like to dislike or vice versa
          setCurrentLikeType(data.type)
          if (data.type === 'LIKE') {
            setLocalLikeCount(prev => prev + 1)
            setLocalDislikeCount(prev => prev - 1)
          } else {
            setLocalDislikeCount(prev => prev + 1)
            setLocalLikeCount(prev => prev - 1)
          }
        }
      } else {
        alert(data.error || 'Failed to update like status')
      }
    } catch (error) {
      console.error('Error updating like:', error)
      alert('Failed to update like status')
    } finally {
      setIsLoading(false)
    }
  }

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`
    }
    return views.toString()
  }

  const handleDownload = async () => {
    try {
      // Create a safe filename by removing invalid characters
      const safeFileName = videoTitle.replace(/[^a-z0-9\s-_.]/gi, '').trim()
      
      // Fetch the video file
      const response = await fetch(videoUrl)
      if (!response.ok) {
        throw new Error('Failed to fetch video')
      }
      
      // Get the blob
      const blob = await response.blob()
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      // Set filename with proper extension
      const extension = videoUrl.split('.').pop()?.toLowerCase() || 'mp4'
      link.download = `${safeFileName}.${extension}`
      
      // Trigger download
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
      alert('Failed to download video. Please try again.')
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: videoTitle,
          url: window.location.href,
        })
      } catch (error) {
        // User cancelled or error occurred
        console.log('Share cancelled or failed:', error)
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href)
        alert('Video link copied to clipboard!')
      } catch (error) {
        console.error('Failed to copy link:', error)
        alert('Failed to copy link. Please copy the URL manually.')
      }
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <button 
        onClick={() => handleLike('LIKE')}
        disabled={isLoading}
        className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
          currentLikeType === 'LIKE' 
            ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
            : 'bg-gray-100 hover:bg-gray-200'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <ThumbsUp className={`w-4 h-4 ${currentLikeType === 'LIKE' ? 'fill-current' : ''}`} />
        <span className="text-sm">{formatViews(localLikeCount)}</span>
      </button>
      <button 
        onClick={() => handleLike('DISLIKE')}
        disabled={isLoading}
        className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
          currentLikeType === 'DISLIKE' 
            ? 'bg-red-100 text-red-600 hover:bg-red-200' 
            : 'bg-gray-100 hover:bg-gray-200'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <ThumbsDown className={`w-4 h-4 ${currentLikeType === 'DISLIKE' ? 'fill-current' : ''}`} />
        <span className="text-sm">{formatViews(localDislikeCount)}</span>
      </button>
      <button 
        onClick={handleShare}
        className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
      >
        <Share className="w-4 h-4" />
        <span className="text-sm">Share</span>
      </button>
      <button 
        onClick={handleDownload}
        className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
      >
        <Download className="w-4 h-4" />
        <span className="text-sm">Save</span>
      </button>
    </div>
  )
}
