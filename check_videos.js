const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkVideos() {
  try {
    const totalCount = await prisma.video.count()
    const publishedCount = await prisma.video.count({
      where: { isPublished: true }
    })
    const unpublishedCount = await prisma.video.count({
      where: { isPublished: false }
    })

    console.log(`Total videos: ${totalCount}`)
    console.log(`Published videos: ${publishedCount}`)
    console.log(`Unpublished videos: ${unpublishedCount}`)

    // Get count by category for published videos
    const publishedByCategory = await prisma.video.groupBy({
      by: ['categoryId'],
      where: { isPublished: true },
      _count: {
        id: true,
      },
    })

    console.log('\nPublished videos by category:')
    for (const count of publishedByCategory) {
      const category = await prisma.category.findUnique({
        where: { id: count.categoryId }
      })
      console.log(`${category?.name}: ${count._count.id} videos`)
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkVideos()
