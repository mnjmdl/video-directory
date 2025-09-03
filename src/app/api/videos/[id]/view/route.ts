import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if video exists and is published
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

    // Increment view count
    const updatedVideo = await prisma.video.update({
      where: { id },
      data: {
        views: {
          increment: 1,
        },
      },
      select: {
        views: true,
      },
    })

    return NextResponse.json({
      success: true,
      views: updatedVideo.views,
    })
  } catch (error) {
    console.error('Error incrementing view count:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}