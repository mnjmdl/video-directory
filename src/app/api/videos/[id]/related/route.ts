import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // First get the current video to find related videos
    const currentVideo = await prisma.video.findUnique({
      where: { id },
      select: {
        categoryId: true,
        userId: true,
      },
    })

    if (!currentVideo) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      )
    }

    const relatedVideos = await prisma.video.findMany({
      where: {
        isPublished: true,
        id: {
          not: id,
        },
        OR: [
          {
            categoryId: currentVideo.categoryId,
          },
          {
            userId: currentVideo.userId,
          },
        ],
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
        category: true,
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    })

    return NextResponse.json(relatedVideos)
  } catch (error) {
    console.error('Error fetching related videos:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}