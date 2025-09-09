import React from 'react'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { prisma } from '@/lib/prisma'
import { Play, Clock, Eye, Lock, Globe } from 'lucide-react'

interface PlaylistPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function PlaylistPage({ params }: PlaylistPageProps) {
  const { id } = await params
  
  const playlist = await prisma.playlist.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          name: true,
          avatar: true,
        },
      },
      playlistVideos: {
        include: {
          video: {
            include: {
              user: {
                select: {
                  username: true,
                  name: true,
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
          order: 'asc',
        },
      },
      _count: {
        select: {
          playlistVideos: true,
        },
      },
    },
  })

  if (!playlist) {
    notFound()
  }

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`
    }
    return views.toString()
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const totalDuration = playlist.playlistVideos.reduce((total, pv) => {
    return total + (pv.video.duration || 0)
  }, 0)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Playlist Info */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-b from-red-500 to-red-600 rounded-lg p-6 text-white sticky top-6">
            {playlist.playlistVideos.length > 0 && (
              <div className="aspect-video bg-black/20 rounded-lg mb-4 relative overflow-hidden">
                <Image
                  src={playlist.playlistVideos[0].video.thumbnailUrl || '/placeholder-video.jpg'}
                  alt={playlist.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Play className="w-12 h-12 text-white" />
                </div>
              </div>
            )}

            <h1 className="text-2xl font-bold mb-2">{playlist.title}</h1>
            
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                {playlist.user.avatar ? (
                  <Image
                    src={playlist.user.avatar}
                    alt={playlist.user.name || playlist.user.username}
                    width={32}
                    height={32}
                    className="object-cover rounded-full"
                  />
                ) : (
                  <span className="text-sm font-medium">
                    {(playlist.user.name || playlist.user.username).charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <p className="font-medium">{playlist.user.name || playlist.user.username}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm opacity-90">
              <div className="flex items-center space-x-4">
                <span>{playlist._count.playlistVideos} videos</span>
                {totalDuration > 0 && (
                  <>
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatDuration(totalDuration)}</span>
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {playlist.isPublic ? (
                  <>
                    <Globe className="w-4 h-4" />
                    <span>Public playlist</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Private playlist</span>
                  </>
                )}
              </div>

              <p className="text-xs">
                Updated {formatDistanceToNow(new Date(playlist.updatedAt), { addSuffix: true })}
              </p>
            </div>

            {playlist.description && (
              <div className="mt-4 pt-4 border-t border-white/20">
                <p className="text-sm opacity-90 whitespace-pre-wrap">{playlist.description}</p>
              </div>
            )}

            {playlist.playlistVideos.length > 0 && (
              <div className="mt-6">
                <Link
                  href={`/video/${playlist.playlistVideos[0].video.id}?playlist=${playlist.id}`}
                  className="w-full bg-white text-red-600 hover:bg-gray-100 px-6 py-3 rounded-full font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <Play className="w-5 h-5" />
                  <span>Play all</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Video List */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {playlist.playlistVideos.length === 0 ? (
              <div className="text-center py-12">
                <Play className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No videos in this playlist</h3>
                <p className="text-gray-500">This playlist is empty.</p>
              </div>
            ) : (
              playlist.playlistVideos.map((playlistVideo, index) => (
                <Link
                  key={playlistVideo.id}
                  href={`/video/${playlistVideo.video.id}?playlist=${playlist.id}`}
                  className="flex space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors group"
                >
                  <div className="flex-shrink-0 text-gray-500 font-medium w-8 text-center">
                    {index + 1}
                  </div>
                  
                  <div className="flex-shrink-0 relative">
                    <div className="w-40 h-24 bg-gray-200 rounded-lg overflow-hidden">
                      <Image
                        src={playlistVideo.video.thumbnailUrl || '/placeholder-video.jpg'}
                        alt={playlistVideo.video.title}
                        width={160}
                        height={96}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                      />
                    </div>
                    {playlistVideo.video.duration && (
                      <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                        {formatDuration(playlistVideo.video.duration)}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2">
                      {playlistVideo.video.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {playlistVideo.video.user.name || playlistVideo.video.user.username}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500 mt-2">
                      <div className="flex items-center space-x-1">
                        <Eye className="w-3 h-3" />
                        <span>{formatViews(playlistVideo.video.views)} views</span>
                      </div>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(playlistVideo.video.createdAt), { addSuffix: true })}</span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
