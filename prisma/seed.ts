import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'bra' },
      update: {},
      create: {
        name: 'Bra',
        slug: 'bra',
        description: 'Bra styles, fits, and fashion',
        color: '#FF69B4',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'knickers' },
      update: {},
      create: {
        name: 'Knickers',
        slug: 'knickers',
        description: 'Knickers, panties, and underwear styles',
        color: '#FF1493',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'swimwear' },
      update: {},
      create: {
        name: 'Swimwear',
        slug: 'swimwear',
        description: 'Swimsuits, bikinis, and beachwear',
        color: '#00CED1',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'slips' },
      update: {},
      create: {
        name: 'Slips',
        slug: 'slips',
        description: 'Slips, camisoles, and intimate apparel',
        color: '#9370DB',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'others' },
      update: {},
      create: {
        name: 'Others',
        slug: 'others',
        description: 'Other lingerie and intimate wear',
        color: '#FFA500',
      },
    }),
  ])

  console.log('✅ Categories created')

  // Create admin user first
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@crystalvideolibrary.com' },
    update: {},
    create: {
      email: 'admin@crystalvideolibrary.com',
      username: 'admin',
      name: 'Crystal Video Library Admin',
      bio: 'Crystal Video Library Administrator - Curating the best video content and fashion inspiration.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    },
  })

  console.log('✅ Admin user created')
  console.log('📧 Admin Email: admin@crystalvideolibrary.com')
  console.log('🔑 Admin Password: admin123 (CHANGE THIS IN PRODUCTION!)')

  // Create regular users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'emma.davis@example.com' },
      update: {},
      create: {
        email: 'emma.davis@example.com',
        username: 'emmadavis',
        name: 'Emma Davis',
        bio: 'Lingerie expert and fashion consultant. Helping you find your perfect fit and style.',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b69a5013?w=400&h=400&fit=crop&crop=face',
      },
    }),
    prisma.user.upsert({
      where: { email: 'sophia.chen@example.com' },
      update: {},
      create: {
        email: 'sophia.chen@example.com',
        username: 'sophiachen',
        name: 'Sophia Chen',
        bio: 'Swimwear specialist and beach fashion enthusiast. Your guide to perfect beach looks!',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
      },
    }),
    prisma.user.upsert({
      where: { email: 'lisa.rodriguez@example.com' },
      update: {},
      create: {
        email: 'lisa.rodriguez@example.com',
        username: 'lisarodriguez',
        name: 'Lisa Rodriguez',
        bio: 'Intimate apparel designer sharing styling tips and fashion inspiration.',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      },
    }),
    prisma.user.upsert({
      where: { email: 'maya.patel@example.com' },
      update: {},
      create: {
        email: 'maya.patel@example.com',
        username: 'mayapatel',
        name: 'Maya Patel',
        bio: 'Sustainable fashion advocate focusing on eco-friendly lingerie and ethical brands.',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
      },
    }),
    prisma.user.upsert({
      where: { email: 'olivia.wilson@example.com' },
      update: {},
      create: {
        email: 'olivia.wilson@example.com',
        username: 'oliviawilson',
        name: 'Olivia Wilson',
        bio: 'Plus-size fashion expert specializing in inclusive lingerie and body positivity.',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
      },
    }),
  ])

  // Add admin user to the users array for video creation
  const allUsers = [adminUser, ...users]

  console.log('✅ Users created')

  // Available video URLs for rotation
  const videoUrls = [
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
  ]

  // Generate 1000+ videos with varied content
  const generateVideoData = () => {
    const videoTemplates = {
      bra: [
        { title: 'Perfect Bra Fitting Guide', description: 'Learn how to find your perfect bra size and fit for maximum comfort and support.' },
        { title: 'Bra Style Guide 2024', description: 'Explore the latest bra styles and trends for every occasion.' },
        { title: 'Sports Bra Selection Tips', description: 'Choose the right sports bra for your activity level and body type.' },
        { title: 'Nursing Bra Essentials', description: 'Comfortable and functional nursing bras for new mothers.' },
        { title: 'Push-Up Bra Techniques', description: 'Master the art of push-up bras for enhanced shape and confidence.' },
        { title: 'Wireless Bra Comfort Guide', description: 'Discover the comfort and freedom of wireless bras.' },
        { title: 'Bra Care and Maintenance', description: 'Keep your bras looking new with proper care techniques.' },
        { title: 'Plus Size Bra Fitting', description: 'Specialized fitting tips for plus size bras and body shapes.' },
        { title: 'Lace Bra Styling Ideas', description: 'Romantic lace bras for special occasions and everyday wear.' },
        { title: 'Bra Construction Explained', description: 'Understanding bra components and quality indicators.' },
        { title: 'Seasonal Bra Wardrobe', description: 'Build a versatile bra collection for different seasons.' },
        { title: 'Bra Shopping Online Tips', description: 'How to shop for bras online with confidence.' },
        { title: 'Bra Alteration Techniques', description: 'Simple alterations to customize your bra fit.' },
        { title: 'Designer Bra Collections', description: 'Luxury designer bras and their unique features.' },
        { title: 'Bra Size Changes Over Time', description: 'Understanding how your bra size may change throughout life.' },
        { title: 'Bra Shopping Mistakes to Avoid', description: 'Common bra shopping mistakes and how to avoid them.' },
        { title: 'Bra Band Size vs Cup Size', description: 'Understanding the difference between band and cup measurements.' },
        { title: 'Bra Padding Options Guide', description: 'Different padding options and when to choose each type.' },
        { title: 'Bra Strap Adjustments', description: 'How to properly adjust bra straps for optimal comfort.' },
      ],
      knickers: [
        { title: 'Knickers Style Guide', description: 'Complete guide to different knickers styles and their best uses.' },
        { title: 'Comfortable Everyday Knickers', description: 'Find the most comfortable knickers for daily wear.' },
        { title: 'Shapewear Knickers Review', description: 'Tummy control and shaping knickers that work.' },
        { title: 'Lace Knickers for Romance', description: 'Elegant lace knickers for intimate moments.' },
        { title: 'Sports Knickers Guide', description: 'Performance knickers for active lifestyles.' },
        { title: 'Seamless Knickers Tutorial', description: 'Invisible knickers under tight clothing.' },
        { title: 'Period Knickers Innovation', description: 'Modern period knickers for sustainable menstruation.' },
        { title: 'High-Waisted Knickers Trend', description: 'The return of high-waisted knickers and styling tips.' },
        { title: 'Knickers Fabric Guide', description: 'Understanding different fabrics and their properties.' },
        { title: 'Knickers Size and Fit', description: 'How to choose the right knickers size for your body.' },
        { title: 'Luxury Silk Knickers', description: 'Indulge in premium silk knickers and their benefits.' },
        { title: 'Knickers Care Instructions', description: 'Proper care and washing techniques for knickers.' },
        { title: 'Thong vs Briefs Debate', description: 'Choosing between thongs and full coverage knickers.' },
        { title: 'Knickers for Different Body Types', description: 'Finding knickers that flatter every body shape.' },
        { title: 'Sustainable Knickers Options', description: 'Eco-friendly knickers for conscious consumers.' },
        { title: 'Knickers for Sensitive Skin', description: 'Gentle knickers for sensitive skin types.' },
        { title: 'Knickers Underwear Layers', description: 'How to layer knickers for different outfits.' },
        { title: 'Knickers Waistband Comfort', description: 'Finding knickers with comfortable waistbands.' },
        { title: 'Knickers Color Selection Guide', description: 'Choosing knickers colors for different occasions.' },
      ],
      swimwear: [
        { title: 'Swimwear Fitting Guide', description: 'Find your perfect swimsuit size and style.' },
        { title: 'Beachwear Trends 2024', description: 'Latest swimsuit trends and seasonal colors.' },
        { title: 'One-Piece Swimsuits Review', description: 'Classic one-piece swimsuits for every body type.' },
        { title: 'Bikini Style Guide', description: 'Mix and match bikinis for different occasions.' },
        { title: 'Swimwear for Active Water Sports', description: 'Performance swimwear for swimming and water activities.' },
        { title: 'Maternity Swimwear Solutions', description: 'Comfortable swimwear for pregnancy and postpartum.' },
        { title: 'Plus Size Swimwear Collection', description: 'Inclusive swimwear for all body sizes.' },
        { title: 'Swimwear Fabric Technology', description: 'UV protection and quick-dry swimwear fabrics.' },
        { title: 'Designer Swimwear Showcase', description: 'Luxury designer swimsuits and beachwear.' },
        { title: 'Swimwear Care and Maintenance', description: 'How to care for your swimwear to extend its life.' },
        { title: 'Tankini Styling Tips', description: 'Mix and match tankinis for versatile beach looks.' },
        { title: 'Swimwear for Different Climates', description: 'Appropriate swimwear for various weather conditions.' },
        { title: 'Burkini Fashion Guide', description: 'Modest swimwear options and styling ideas.' },
        { title: 'Kids Swimwear Safety', description: 'Safe and comfortable swimwear for children.' },
        { title: 'Vintage Swimwear Revival', description: 'Retro-inspired swimsuits making a comeback.' },
        { title: 'Swimwear Sun Protection Guide', description: 'Swimwear with built-in UV protection.' },
        { title: 'Swimwear for Water Sports', description: 'Durable swimwear for surfing, diving, and other activities.' },
        { title: 'Swimwear Pattern Selection', description: 'Choosing patterns that flatter different body types.' },
        { title: 'Swimwear Accessory Guide', description: 'Matching accessories for your swimwear outfits.' },
      ],
      slips: [
        { title: 'Slip Dress Styling Guide', description: 'How to style slip dresses for different occasions.' },
        { title: 'Silk Slip Collection', description: 'Luxurious silk slips for everyday elegance.' },
        { title: 'Camisole and Slip Sets', description: 'Coordinating camisoles and slips for complete looks.' },
        { title: 'Slip as Loungewear', description: 'Comfortable slips perfect for relaxing at home.' },
        { title: 'Layering with Slips', description: 'How to layer slips under sheer clothing.' },
        { title: 'Slip Fabric Guide', description: 'Different fabrics used in modern slips.' },
        { title: 'Adjustable Slip Features', description: 'Slips with adjustable straps and features.' },
        { title: 'Slip Care Instructions', description: 'Proper care for delicate slip fabrics.' },
        { title: 'Designer Slip Collections', description: 'High-end designer slips and their appeal.' },
        { title: 'Slip Size and Fit Guide', description: 'Finding the perfect slip size for your body.' },
        { title: 'Seasonal Slip Wardrobe', description: 'Building a slip collection for year-round wear.' },
        { title: 'Slip as Nightwear', description: 'Comfortable slips for sleeping and lounging.' },
        { title: 'Vintage Slip Revival', description: 'Classic slip styles making a modern comeback.' },
        { title: 'Slip Underwear Guide', description: 'Full and half slips for different needs.' },
        { title: 'Sustainable Slip Options', description: 'Eco-conscious slip brands and materials.' },
        { title: 'Slip Dress Layering Techniques', description: 'How to layer slips under different types of clothing.' },
        { title: 'Slip Fabric Transparency Guide', description: 'Understanding fabric transparency in slips.' },
        { title: 'Slip Length Selection', description: 'Choosing the right slip length for different outfits.' },
        { title: 'Slip Neckline Options', description: 'Different neckline styles available in slips.' },
      ],
      others: [
        { title: 'Lingerie Wardrobe Essentials', description: 'Must-have pieces for every lingerie collection.' },
        { title: 'Lingerie Shopping Guide', description: 'How to shop for lingerie with confidence.' },
        { title: 'Lingerie Care Masterclass', description: 'Complete guide to caring for delicate lingerie.' },
        { title: 'Lingerie Styling Tips', description: 'How to style lingerie for different occasions.' },
        { title: 'Designer Lingerie Showcase', description: 'Luxury lingerie brands and their signature pieces.' },
        { title: 'Lingerie for Special Occasions', description: 'Special lingerie for weddings, anniversaries, and celebrations.' },
        { title: 'Lingerie Size Guide', description: 'Comprehensive sizing guide for all lingerie types.' },
        { title: 'Sustainable Lingerie Brands', description: 'Eco-friendly lingerie options for conscious consumers.' },
        { title: 'Lingerie Gift Guide', description: 'Perfect lingerie gifts for different relationships.' },
        { title: 'Lingerie Fashion Trends', description: 'Latest trends in lingerie design and styling.' },
        { title: 'Lingerie Photography Tips', description: 'How to photograph lingerie beautifully.' },
        { title: 'Lingerie History and Evolution', description: 'The fascinating history of lingerie through the ages.' },
        { title: 'Lingerie for Different Ages', description: 'Appropriate lingerie for different life stages.' },
        { title: 'Lingerie Storage Solutions', description: 'How to store lingerie to maintain its quality.' },
        { title: 'Custom Lingerie Options', description: 'Personalized and custom-made lingerie pieces.' },
        { title: 'Lingerie Material Guide', description: 'Understanding different lingerie fabrics and materials.' },
        { title: 'Lingerie Brand Comparisons', description: 'Comparing popular lingerie brands and their specialties.' },
        { title: 'Lingerie Shopping Budget Guide', description: 'How to shop for lingerie on different budgets.' },
        { title: 'Lingerie Seasonal Trends', description: 'Seasonal lingerie trends and color palettes.' },
      ]
    }

    const thumbnails = [
      'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1489599558377-d2e39a3a19d8?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1516307365426-bea591f05011?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1504711331083-9c895941bf81?w=800&h=450&fit=crop',
    ]

    const videoData = []
    let videoCounter = 0

    // Generate videos for each category
    Object.entries(videoTemplates).forEach(([categorySlug, templates]) => {
      const category = categories.find(c => c.slug === categorySlug)
      if (!category) return

      // Create 8-12 variations of each template
      templates.forEach((template, templateIndex) => {
        const variations = Math.floor(Math.random() * 5) + 8

        for (let i = 0; i < variations; i++) {
          const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)]
          const randomThumbnail = thumbnails[Math.floor(Math.random() * thumbnails.length)]
          const randomVideoUrl = videoUrls[Math.floor(Math.random() * videoUrls.length)]
          const randomDuration = Math.floor(Math.random() * 1800) + 60 // 1-30 minutes
          const randomViews = Math.floor(Math.random() * 100000) + 100

          // Add variation to title and description
          const titleVariations = [
            template.title,
            `${template.title} - Part ${i + 1}`,
            `Advanced ${template.title}`,
            `${template.title} Tutorial`,
            `Complete Guide: ${template.title}`,
          ]

          const descriptionVariations = [
            template.description,
            `${template.description} This comprehensive tutorial covers everything you need to know.`,
            `${template.description} Perfect for beginners and intermediate learners.`,
            `${template.description} Follow along with practical examples and exercises.`,
            `${template.description} Updated for 2024 with the latest best practices.`,
          ]

          videoData.push({
            title: titleVariations[i % titleVariations.length],
            description: descriptionVariations[i % descriptionVariations.length],
            videoUrl: randomVideoUrl,
            thumbnailUrl: randomThumbnail,
            duration: randomDuration,
            views: randomViews,
            userId: randomUser.id,
            categoryId: category.id,
            isPublished: Math.random() > 0.1, // 90% published, 10% draft
          })

          videoCounter++
        }
      })
    })

    // Add some random additional videos to reach 1000+
    while (videoData.length < 1000) {
      const randomCategory = categories[Math.floor(Math.random() * categories.length)]
      const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)]
      const randomThumbnail = thumbnails[Math.floor(Math.random() * thumbnails.length)]
      const randomVideoUrl = videoUrls[Math.floor(Math.random() * videoUrls.length)]

      const generalTitles = [
        'Quick Tips and Tricks',
        'Behind the Scenes Content',
        'Live Stream Highlights',
        'Q&A Session',
        'Community Showcase',
        'Weekly Update',
        'Special Announcement',
        'Viewer Submissions',
        'Collaboration Video',
        'Challenge Completed',
      ]

      const generalDescriptions = [
        'Sharing some quick tips and insights from my recent experience.',
        'Take a look behind the scenes of my content creation process.',
        'Best moments from our recent live streaming session.',
        'Answering your most frequently asked questions.',
        'Highlighting amazing work from our community members.',
        'Weekly update on what\'s happening in our community.',
        'Important announcement about upcoming content and events.',
        'Featuring awesome submissions from our viewers.',
        'Amazing collaboration with fellow content creators.',
        'Successfully completed this week\'s challenge!',
      ]

      const randomTitle = generalTitles[Math.floor(Math.random() * generalTitles.length)]
      const randomDescription = generalDescriptions[Math.floor(Math.random() * generalDescriptions.length)]

      videoData.push({
        title: `${randomTitle} #${Math.floor(Math.random() * 100) + 1}`,
        description: randomDescription,
        videoUrl: randomVideoUrl,
        thumbnailUrl: randomThumbnail,
        duration: Math.floor(Math.random() * 1200) + 180, // 3-20 minutes
        views: Math.floor(Math.random() * 50000) + 50,
        userId: randomUser.id,
        categoryId: randomCategory.id,
        isPublished: Math.random() > 0.15, // 85% published
      })
    }

    return videoData
  }

  const videoData = generateVideoData()

  // Create videos
  for (const video of videoData) {
    await prisma.video.create({
      data: video,
    })
  }

  console.log('✅ Videos created')

  // Create some likes and comments for engagement
  const videos = await prisma.video.findMany()

  // Add likes
  for (const video of videos.slice(0, 8)) {
    const numLikes = Math.floor(Math.random() * 50) + 10
    for (let i = 0; i < numLikes; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)]
      try {
        await prisma.like.create({
          data: {
            type: Math.random() > 0.1 ? 'LIKE' : 'DISLIKE', // 90% likes, 10% dislikes
            userId: randomUser.id,
            videoId: video.id,
          },
        })
      } catch (error) {
        // Skip if duplicate like (user already liked this video)
        continue
      }
    }
  }

  console.log('✅ Likes created')

  // Add comments
  const sampleComments = [
    'Great video! Really helpful content.',
    'Thanks for sharing this tutorial!',
    'Could you make a follow-up video about advanced features?',
    'This is exactly what I was looking for.',
    'Amazing work! Keep it up.',
    'Very well explained, easy to follow.',
    'Love your content! Subscribed.',
    'This helped me solve my problem. Thank you!',
    'More videos like this please!',
    'Excellent tutorial, learned a lot.',
  ]

  for (const video of videos.slice(0, 10)) {
    const numComments = Math.floor(Math.random() * 8) + 2
    for (let i = 0; i < numComments; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)]
      const randomComment = sampleComments[Math.floor(Math.random() * sampleComments.length)]

      await prisma.comment.create({
        data: {
          content: randomComment,
          userId: randomUser.id,
          videoId: video.id,
        },
      })
    }
  }

  console.log('✅ Comments created')

  // Create some playlists
  for (const user of users.slice(0, 3)) {
    await prisma.playlist.create({
      data: {
        title: `${user.name}'s Favorites`,
        description: 'My favorite videos collection',
        isPublic: true,
        userId: user.id,
        playlistVideos: {
          create: videos.slice(0, 5).map((video, index) => ({
            videoId: video.id,
            order: index + 1,
          }))
        }
      },
    })
  }

  console.log('✅ Playlists created')

  console.log('🎉 Crystal Video Library seed completed successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
