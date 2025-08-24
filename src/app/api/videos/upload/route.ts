import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { z } from 'zod'

const uploadSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  categoryId: z.string().min(1),
  isPublished: z.string().transform((val) => val === 'true'),
  userId: z.string().min(1),
})

// Helper function to generate unique filename
function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2)
  const extension = originalName.split('.').pop()
  return `${timestamp}-${random}.${extension}`
}

// Helper function to get video duration (simplified - in production use ffprobe or similar)
function getVideoDuration(): Promise<number> {
  return new Promise((resolve) => {
    // For demo purposes, return a random duration
    // In production, you'd use ffprobe or a similar tool to get actual duration
    const randomDuration = Math.floor(Math.random() * 1800) + 60 // 1-30 minutes
    resolve(randomDuration)
  })
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse form data
    const formData = await request.formData()
    const videoFile = formData.get('video') as File
    const thumbnailFile = formData.get('thumbnail') as File | null
    
    if (!videoFile) {
      return NextResponse.json({ error: 'Video file is required' }, { status: 400 })
    }

    // Validate form data
    const validationResult = uploadSchema.safeParse({
      title: formData.get('title'),
      description: formData.get('description'),
      categoryId: formData.get('categoryId'),
      isPublished: formData.get('isPublished'),
      userId: formData.get('userId'),
    })

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid form data', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Verify user owns the upload
    if (data.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId }
    })

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 400 })
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    const videosDir = join(uploadsDir, 'videos')
    const thumbnailsDir = join(uploadsDir, 'thumbnails')

    try {
      await mkdir(uploadsDir, { recursive: true })
      await mkdir(videosDir, { recursive: true })
      await mkdir(thumbnailsDir, { recursive: true })
    } catch {
      // Directory might already exist, ignore error
    }

    // Save video file
    const videoFileName = generateUniqueFilename(videoFile.name)
    const videoPath = join(videosDir, videoFileName)
    const videoBytes = await videoFile.arrayBuffer()
    await writeFile(videoPath, Buffer.from(videoBytes))

    // Save thumbnail file if provided
    let thumbnailUrl = null
    if (thumbnailFile) {
      const thumbnailFileName = generateUniqueFilename(thumbnailFile.name)
      const thumbnailPath = join(thumbnailsDir, thumbnailFileName)
      const thumbnailBytes = await thumbnailFile.arrayBuffer()
      await writeFile(thumbnailPath, Buffer.from(thumbnailBytes))
      thumbnailUrl = `/uploads/thumbnails/${thumbnailFileName}`
    }

    // Get video duration (simplified)
    const duration = await getVideoDuration()

    // Create video record in database
    const video = await prisma.video.create({
      data: {
        title: data.title,
        description: data.description || null,
        videoUrl: `/uploads/videos/${videoFileName}`,
        thumbnailUrl,
        duration,
        views: 0,
        isPublished: data.isPublished,
        userId: data.userId,
        categoryId: data.categoryId,
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
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Video uploaded successfully',
      id: video.id,
      video,
    })

  } catch (error) {
    console.error('Upload error:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

// Configure the API route to handle large files
export const config = {
  api: {
    bodyParser: false,
  },
}
