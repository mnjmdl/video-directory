import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id } = await params
    const { type } = await request.json()

    if (!type || !['LIKE', 'DISLIKE'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid like type. Must be LIKE or DISLIKE' },
        { status: 400 }
      )
    }

    // Verify video exists and is published
    const video = await prisma.video.findUnique({
      where: {
        id,
        isPublished: true,
      },
    })

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      )
    }

    // Check if user already liked this video
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_videoId: {
          userId: session.user.id,
          videoId: id,
        },
      },
    })

    if (existingLike) {
      if (existingLike.type === type) {
        // User is trying to like/dislike the same way again - remove the like
        await prisma.like.delete({
          where: { id: existingLike.id },
        })
        return NextResponse.json({
          success: true,
          action: 'removed',
          type: null,
        })
      } else {
        // User is changing their like type
        const updatedLike = await prisma.like.update({
          where: { id: existingLike.id },
          data: { type },
        })
        return NextResponse.json({
          success: true,
          action: 'updated',
          type: updatedLike.type,
        })
      }
    } else {
      // Create new like
      const newLike = await prisma.like.create({
        data: {
          type,
          userId: session.user.id,
          videoId: id,
        },
      })
      return NextResponse.json({
        success: true,
        action: 'created',
        type: newLike.type,
      })
    }
  } catch (error) {
    console.error('Error handling like:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id } = await params

    const like = await prisma.like.findUnique({
      where: {
        userId_videoId: {
          userId: session.user.id,
          videoId: id,
        },
      },
    })

    return NextResponse.json({
      type: like?.type || null,
    })
  } catch (error) {
    console.error('Error fetching like status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}