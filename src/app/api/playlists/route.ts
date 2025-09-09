import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/playlists - Get user's playlists
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    // If userId is provided, get public playlists for that user
    // Otherwise, get all playlists for the authenticated user
    const playlists = await prisma.playlist.findMany({
      where: {
        userId: userId || session.user.id,
        ...(userId && userId !== session.user.id ? { isPublic: true } : {}),
      },
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
              select: {
                id: true,
                title: true,
                thumbnailUrl: true,
                duration: true,
                views: true,
                createdAt: true,
                user: {
                  select: {
                    username: true,
                    name: true,
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
      orderBy: {
        updatedAt: 'desc',
      },
    })

    return NextResponse.json({ playlists })
  } catch (error) {
    console.error('Error fetching playlists:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/playlists - Create new playlist
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { title, description, isPublic } = await request.json()

    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Playlist title is required' },
        { status: 400 }
      )
    }

    const playlist = await prisma.playlist.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        isPublic: isPublic ?? true,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            playlistVideos: true,
          },
        },
      },
    })

    return NextResponse.json({ playlist }, { status: 201 })
  } catch (error) {
    console.error('Error creating playlist:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
