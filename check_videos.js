const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkVideos() {
  try {
    const totalVideos = await prisma.video.count()
    const publishedVideos = await prisma.video.count({
      where: { isPublished: true }
    })
    const videosByCategory = await prisma.video.groupBy({
      by: ['categoryId'],
      _count: {
        id: true
      }
    })
    
    console.log(`📊 Video Statistics:`)
    console.log(`Total Videos: ${totalVideos}`)
    console.log(`Published Videos: ${publishedVideos}`)
    console.log(`Draft Videos: ${totalVideos - publishedVideos}`)
    console.log(`\n📋 Videos by Category:`)
    
    // Get category names
    const categories = await prisma.category.findMany()
    const categoryMap = categories.reduce((acc, cat) => {
      acc[cat.id] = cat.name
      return acc
    }, {})
    
    videosByCategory.forEach(group => {
      console.log(`${categoryMap[group.categoryId]}: ${group._count.id} videos`)
    })
    
  } catch (error) {
    console.error('Error checking videos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkVideos()
