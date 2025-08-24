import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Manual validation
    const q = searchParams.get('q')?.trim()
    const category = searchParams.get('category')?.trim() || null
    const pageParam = searchParams.get('page')
    const limitParam = searchParams.get('limit')
    
    if (!q || q.length === 0) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }
    
    if (q.length > 100) {
      return NextResponse.json(
        { error: 'Search query too long (max 100 characters)' },
        { status: 400 }
      )
    }
    
    const page = pageParam ? Math.max(1, parseInt(pageParam)) : 1
    const limit = limitParam ? Math.min(50, Math.max(1, parseInt(limitParam))) : 20
    
    if (isNaN(page) || isNaN(limit)) {
      return NextResponse.json(
        { error: 'Invalid page or limit parameter' },
        { status: 400 }
      )
    }

    const offset = (page - 1) * limit

    // Use raw SQL for case-insensitive search with LIKE
    const searchPattern = `%${q}%`
    
    // Get total count for pagination
    let countResult
    if (category) {
      countResult = await prisma.$queryRaw<[{count: bigint}]>`
        SELECT COUNT(*) as count 
        FROM videos v 
        LEFT JOIN categories c ON v.categoryId = c.id 
        WHERE v.isPublished = 1 AND v.title LIKE ${searchPattern} COLLATE NOCASE AND c.slug = ${category}
      `
    } else {
      countResult = await prisma.$queryRaw<[{count: bigint}]>`
        SELECT COUNT(*) as count 
        FROM videos v 
        WHERE v.isPublished = 1 AND v.title LIKE ${searchPattern} COLLATE NOCASE
      `
    }
    
    const totalResults = Number(countResult[0].count)

    // Define the type for raw video results
    interface RawVideoResult {
      id: string
      title: string
      description: string | null
      videoUrl: string
      thumbnailUrl: string | null
      duration: number | null
      views: number
      createdAt: Date
      updatedAt: Date
      userId: string
      username: string
      userName: string | null
      avatar: string | null
      categoryId: string | null
      categoryName: string | null
      categorySlug: string | null
      categoryColor: string | null
      likesCount: bigint | number
      commentsCount: bigint | number
    }

    // Get search results with all related data
    let rawVideos
    if (category) {
      rawVideos = await prisma.$queryRaw<RawVideoResult[]>`
        SELECT 
          v.id,
          v.title,
          v.description,
          v.videoUrl,
          v.thumbnailUrl,
          v.duration,
          v.views,
          v.createdAt,
          v.updatedAt,
          u.id as userId,
          u.username,
          u.name as userName,
          u.avatar,
          c.id as categoryId,
          c.name as categoryName,
          c.slug as categorySlug,
          c.color as categoryColor,
          COUNT(DISTINCT l.id) as likesCount,
          COUNT(DISTINCT cm.id) as commentsCount
        FROM videos v
        LEFT JOIN users u ON v.userId = u.id
        LEFT JOIN categories c ON v.categoryId = c.id
        LEFT JOIN likes l ON v.id = l.videoId
        LEFT JOIN comments cm ON v.id = cm.videoId
        WHERE v.isPublished = 1 AND v.title LIKE ${searchPattern} COLLATE NOCASE AND c.slug = ${category}
        GROUP BY v.id, v.title, v.description, v.videoUrl, v.thumbnailUrl, v.duration, v.views, v.createdAt, v.updatedAt,
                 u.id, u.username, u.name, u.avatar,
                 c.id, c.name, c.slug, c.color
        ORDER BY v.views DESC, v.createdAt DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    } else {
      rawVideos = await prisma.$queryRaw<RawVideoResult[]>`
        SELECT 
          v.id,
          v.title,
          v.description,
          v.videoUrl,
          v.thumbnailUrl,
          v.duration,
          v.views,
          v.createdAt,
          v.updatedAt,
          u.id as userId,
          u.username,
          u.name as userName,
          u.avatar,
          c.id as categoryId,
          c.name as categoryName,
          c.slug as categorySlug,
          c.color as categoryColor,
          COUNT(DISTINCT l.id) as likesCount,
          COUNT(DISTINCT cm.id) as commentsCount
        FROM videos v
        LEFT JOIN users u ON v.userId = u.id
        LEFT JOIN categories c ON v.categoryId = c.id
        LEFT JOIN likes l ON v.id = l.videoId
        LEFT JOIN comments cm ON v.id = cm.videoId
        WHERE v.isPublished = 1 AND v.title LIKE ${searchPattern} COLLATE NOCASE
        GROUP BY v.id, v.title, v.description, v.videoUrl, v.thumbnailUrl, v.duration, v.views, v.createdAt, v.updatedAt,
                 u.id, u.username, u.name, u.avatar,
                 c.id, c.name, c.slug, c.color
        ORDER BY v.views DESC, v.createdAt DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    }
    
    // Transform raw results to match expected format
    const videos = rawVideos.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      videoUrl: row.videoUrl,
      thumbnailUrl: row.thumbnailUrl,
      duration: row.duration,
      views: row.views,
      createdAt: row.createdAt,
      user: {
        id: row.userId,
        username: row.username,
        name: row.userName,
        avatar: row.avatar,
      },
      category: row.categoryId ? {
        id: row.categoryId,
        name: row.categoryName,
        slug: row.categorySlug,
        color: row.categoryColor,
      } : null,
      _count: {
        likes: Number(row.likesCount) || 0,
        comments: Number(row.commentsCount) || 0,
      },
    }))

    const totalPages = Math.ceil(totalResults / limit)

    return NextResponse.json({
      results: videos,
      pagination: {
        page,
        limit,
        totalResults,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      query: {
        q,
        category,
      },
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Search failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
