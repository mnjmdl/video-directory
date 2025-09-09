'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { X, Plus } from 'lucide-react'

interface Playlist {
  id: string
  title: string
  description: string | null
  isPublic: boolean
  createdAt: string
  updatedAt: string
  user: {
    id: string
    username: string
    name: string | null
    avatar: string | null
  }
  playlistVideos: Array<{
    video: {
      id: string
      title: string
      thumbnailUrl: string | null
      duration: number | null
      views: number
      createdAt: string
      user: {
        username: string
        name: string | null
      }
    }
  }>
  _count: {
    playlistVideos: number
  }
}

interface CreatePlaylistModalProps {
  isOpen: boolean
  onClose: () => void
  onPlaylistCreated?: (playlist: Playlist) => void
}

export function CreatePlaylistModal({ isOpen, onClose, onPlaylistCreated }: CreatePlaylistModalProps) {
  const { data: session } = useSession()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session?.user || !('id' in session.user)) {
      alert('Please sign in to create playlists')
      return
    }

    if (!title.trim()) {
      alert('Please enter a playlist title')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/playlists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          isPublic,
        }),
      })

      const data = await response.json()

      if (data.playlist) {
        onPlaylistCreated?.(data.playlist)
        setTitle('')
        setDescription('')
        setIsPublic(true)
        onClose()
      } else {
        alert(data.error || 'Failed to create playlist')
      }
    } catch (error) {
      console.error('Error creating playlist:', error)
      alert('Failed to create playlist')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Create New Playlist</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter playlist title"
              maxLength={100}
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter playlist description (optional)"
              rows={3}
              maxLength={500}
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
              Make this playlist public
            </label>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !title.trim()}
              className="flex-1 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>{isLoading ? 'Creating...' : 'Create Playlist'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
