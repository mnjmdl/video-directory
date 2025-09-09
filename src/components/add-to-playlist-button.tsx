'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Plus, Loader2 } from 'lucide-react'
import { CreatePlaylistModal } from './create-playlist-modal'

interface Playlist {
  id: string
  title: string
  isPublic: boolean
  _count: {
    playlistVideos: number
  }
}

interface AddToPlaylistButtonProps {
  videoId: string
  className?: string
}

export function AddToPlaylistButton({ videoId, className = '' }: AddToPlaylistButtonProps) {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [addingToPlaylist, setAddingToPlaylist] = useState<string | null>(null)

  // Fetch user's playlists when dropdown opens
  useEffect(() => {
    if (isOpen && session?.user && 'id' in session.user) {
      fetchPlaylists()
    }
  }, [isOpen, session?.user])

  const fetchPlaylists = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/playlists')
      const data = await response.json()
      if (data.playlists) {
        setPlaylists(data.playlists)
      }
    } catch (error) {
      console.error('Error fetching playlists:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToPlaylist = async (playlistId: string) => {
    if (!session?.user || !('id' in session.user)) {
      alert('Please sign in to add videos to playlists')
      return
    }

    setAddingToPlaylist(playlistId)
    try {
      const response = await fetch(`/api/playlists/${playlistId}/videos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoId }),
      })

      const data = await response.json()

      if (data.playlistVideo) {
        alert('Video added to playlist successfully!')
        setIsOpen(false)
      } else if (response.status === 409) {
        alert('Video is already in this playlist')
      } else {
        alert(data.error || 'Failed to add video to playlist')
      }
    } catch (error) {
      console.error('Error adding video to playlist:', error)
      alert('Failed to add video to playlist')
    } finally {
      setAddingToPlaylist(null)
    }
  }

  const handlePlaylistCreated = (newPlaylist: Playlist) => {
    setPlaylists(prev => [newPlaylist, ...prev])
    setIsCreateModalOpen(false)
  }

  if (!session?.user || !('id' in session.user)) {
    return null
  }

  const defaultClassName = "flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={className || defaultClassName}
      >
        <Plus className="w-4 h-4" />
        <span className="text-sm">Save</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-3 border-b border-gray-200">
            <h3 className="font-medium text-gray-900">Save to playlist</h3>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center">
                <Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-400" />
                <p className="text-sm text-gray-500 mt-2">Loading playlists...</p>
              </div>
            ) : playlists.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-sm text-gray-500">No playlists found</p>
              </div>
            ) : (
              <div className="py-2">
                {playlists.map((playlist) => (
                  <button
                    key={playlist.id}
                    onClick={() => handleAddToPlaylist(playlist.id)}
                    disabled={addingToPlaylist === playlist.id}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between disabled:opacity-50"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{playlist.title}</p>
                      <p className="text-xs text-gray-500">
                        {playlist._count.playlistVideos} videos • {playlist.isPublic ? 'Public' : 'Private'}
                      </p>
                    </div>
                    {addingToPlaylist === playlist.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    ) : (
                      <Plus className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 border-t border-gray-200">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create new playlist</span>
            </button>
          </div>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <CreatePlaylistModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPlaylistCreated={handlePlaylistCreated}
      />
    </div>
  )
}
