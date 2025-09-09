'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Plus, Play, Lock, Globe, MoreVertical, Edit, Trash2 } from 'lucide-react'
import { CreatePlaylistModal } from './create-playlist-modal'

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

export function PlaylistManager() {
  const { data: session } = useSession()
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  useEffect(() => {
    if (session?.user && 'id' in session.user) {
      fetchPlaylists()
    }
  }, [session?.user])

  const fetchPlaylists = async () => {
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

  const handlePlaylistCreated = (newPlaylist: Playlist) => {
    setPlaylists(prev => [newPlaylist, ...prev])
    setIsCreateModalOpen(false)
  }

  const handleDeletePlaylist = async (playlistId: string) => {
    if (!confirm('Are you sure you want to delete this playlist? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/playlists/${playlistId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setPlaylists(prev => prev.filter(p => p.id !== playlistId))
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete playlist')
      }
    } catch (error) {
      console.error('Error deleting playlist:', error)
      alert('Failed to delete playlist')
    }
  }


  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="aspect-video bg-gray-200 animate-pulse" />
            <div className="p-4 space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      {/* Create Playlist Button */}
      <div className="mb-6">
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Create New Playlist</span>
        </button>
      </div>

      {/* Playlists Grid */}
      {playlists.length === 0 ? (
        <div className="text-center py-12">
          <Play className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No playlists yet</h3>
          <p className="text-gray-500 mb-6">Create your first playlist to organize your favorite videos</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Create Playlist</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map((playlist) => (
            <div key={playlist.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group hover:shadow-md transition-shadow">
              <Link href={`/playlist/${playlist.id}`} className="block">
                <div className="aspect-video bg-gray-100 relative overflow-hidden">
                  {playlist.playlistVideos.length > 0 ? (
                    <Image
                      src={playlist.playlistVideos[0].video.thumbnailUrl || '/placeholder-video.jpg'}
                      alt={playlist.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Play className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                    {playlist._count.playlistVideos} videos
                  </div>
                </div>
              </Link>

              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <Link href={`/playlist/${playlist.id}`}>
                      <h3 className="font-medium text-gray-900 hover:text-red-600 transition-colors line-clamp-2">
                        {playlist.title}
                      </h3>
                    </Link>
                    
                    <div className="flex items-center space-x-2 mt-2 text-sm text-gray-500">
                      {playlist.isPublic ? (
                        <>
                          <Globe className="w-4 h-4" />
                          <span>Public</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>Private</span>
                        </>
                      )}
                    </div>

                    <p className="text-xs text-gray-500 mt-1">
                      Updated {formatDistanceToNow(new Date(playlist.updatedAt), { addSuffix: true })}
                    </p>

                    {playlist.description && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {playlist.description}
                      </p>
                    )}
                  </div>

                  <div className="relative ml-2">
                    <button className="p-1 hover:bg-gray-100 rounded-full transition-colors group/menu">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                    
                    {/* Dropdown menu would go here - simplified for now */}
                    <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-10">
                      <button className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button 
                        onClick={() => handleDeletePlaylist(playlist.id)}
                        className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreatePlaylistModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPlaylistCreated={handlePlaylistCreated}
      />
    </div>
  )
}
