import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/playlists/[id]/videos - Add video to playlist
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: playlistId } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { videoId } = await request.json()

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      )
    }

    // Check if playlist exists and user owns it
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
    })

    if (!playlist) {
      return NextResponse.json(
        { error: 'Playlist not found' },
        { status: 404 }
      )
    }

    if (playlist.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Check if video exists and is published
    const video = await prisma.video.findUnique({
      where: {
        id: videoId,
        isPublished: true,
      },
    })

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      )
    }

    // Check if video is already in playlist
    const existingEntry = await prisma.playlistVideo.findUnique({
      where: {
        playlistId_videoId: {
          playlistId,
          videoId,
        },
      },
    })

    if (existingEntry) {
      return NextResponse.json(
        { error: 'Video is already in this playlist' },
        { status: 409 }
      )
    }

    // Get the next order number
    const lastVideo = await prisma.playlistVideo.findFirst({
      where: { playlistId },
      orderBy: { order: 'desc' },
    })

    const nextOrder = (lastVideo?.order || 0) + 1

    // Add video to playlist
    const playlistVideo = await prisma.playlistVideo.create({
      data: {
        playlistId,
        videoId,
        order: nextOrder,
      },
      include: {
        video: {
          include: {
            user: {
              select: {
                username: true,
                name: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json({ playlistVideo }, { status: 201 })
  } catch (error) {
    console.error('Error adding video to playlist:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/playlists/[id]/videos - Remove video from playlist
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: playlistId } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { videoId } = await request.json()

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      )
    }

    // Check if playlist exists and user owns it
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
    })

    if (!playlist) {
      return NextResponse.json(
        { error: 'Playlist not found' },
        { status: 404 }
      )
    }

    if (playlist.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Remove video from playlist
    const deletedEntry = await prisma.playlistVideo.deleteMany({
      where: {
        playlistId,
        videoId,
      },
    })

    if (deletedEntry.count === 0) {
      return NextResponse.json(
        { error: 'Video not found in playlist' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing video from playlist:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
