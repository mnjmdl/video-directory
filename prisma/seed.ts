import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'technology' },
      update: {},
      create: {
        name: 'Technology',
        slug: 'technology',
        description: 'Tech tutorials, reviews, and innovations',
        color: '#3B82F6',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'entertainment' },
      update: {},
      create: {
        name: 'Entertainment',
        slug: 'entertainment',
        description: 'Movies, music, comedy, and fun content',
        color: '#EF4444',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'education' },
      update: {},
      create: {
        name: 'Education',
        slug: 'education',
        description: 'Learning and educational content',
        color: '#10B981',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'gaming' },
      update: {},
      create: {
        name: 'Gaming',
        slug: 'gaming',
        description: 'Game reviews, playthroughs, and gaming news',
        color: '#8B5CF6',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'lifestyle' },
      update: {},
      create: {
        name: 'Lifestyle',
        slug: 'lifestyle',
        description: 'Health, fitness, cooking, and lifestyle tips',
        color: '#F59E0B',
      },
    }),
  ])

  console.log('✅ Categories created')

  // Create admin user first
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@videohub.com' },
    update: {},
    create: {
      email: 'admin@videohub.com',
      username: 'admin',
      name: 'Admin User',
      bio: 'VideoHub Administrator - Managing the platform and ensuring quality content.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    },
  })

  console.log('✅ Admin user created')
  console.log('📧 Admin Email: admin@videohub.com')
  console.log('🔑 Admin Password: admin123 (CHANGE THIS IN PRODUCTION!)')

  // Create regular users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'john.doe@example.com' },
      update: {},
      create: {
        email: 'john.doe@example.com',
        username: 'johndoe',
        name: 'John Doe',
        bio: 'Tech enthusiast and content creator. I love making tutorials about the latest technologies.',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
      },
    }),
    prisma.user.upsert({
      where: { email: 'jane.smith@example.com' },
      update: {},
      create: {
        email: 'jane.smith@example.com',
        username: 'janesmith',
        name: 'Jane Smith',
        bio: 'Gamer and streamer. Join me for epic gaming adventures!',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b69a5013?w=400&h=400&fit=crop&crop=face',
      },
    }),
    prisma.user.upsert({
      where: { email: 'mike.wilson@example.com' },
      update: {},
      create: {
        email: 'mike.wilson@example.com',
        username: 'mikewilson',
        name: 'Mike Wilson',
        bio: 'Educator and lifelong learner. Making complex topics simple.',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      },
    }),
    prisma.user.upsert({
      where: { email: 'sarah.johnson@example.com' },
      update: {},
      create: {
        email: 'sarah.johnson@example.com',
        username: 'sarahjohnson',
        name: 'Sarah Johnson',
        bio: 'Lifestyle blogger sharing tips on health, wellness, and productivity.',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
      },
    }),
    prisma.user.upsert({
      where: { email: 'alex.brown@example.com' },
      update: {},
      create: {
        email: 'alex.brown@example.com',
        username: 'alexbrown',
        name: 'Alex Brown',
        bio: 'Entertainment creator making funny sketches and commentary videos.',
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

  // Generate hundreds of videos with varied content
  const generateVideoData = () => {
    const videoTemplates = {
      technology: [
        { title: 'JavaScript ES2024 New Features', description: 'Explore the latest JavaScript features that will improve your coding workflow.' },
        { title: 'TypeScript for Beginners', description: 'Get started with TypeScript and learn how to write better, more maintainable code.' },
        { title: 'React Hooks Deep Dive', description: 'Master React hooks with practical examples and best practices.' },
        { title: 'Next.js 14 Complete Guide', description: 'Build modern web applications with the latest Next.js features.' },
        { title: 'Python Data Analysis Tutorial', description: 'Learn data analysis with pandas, numpy, and matplotlib.' },
        { title: 'Docker for Developers', description: 'Containerize your applications with Docker for better deployment.' },
        { title: 'AWS Cloud Fundamentals', description: 'Get started with Amazon Web Services and cloud computing.' },
        { title: 'GraphQL API Development', description: 'Build efficient APIs with GraphQL and modern tools.' },
        { title: 'Mobile App Development with Flutter', description: 'Create cross-platform mobile apps using Flutter framework.' },
        { title: 'Blockchain Development Basics', description: 'Understand blockchain technology and smart contract development.' },
        { title: 'Cybersecurity Best Practices', description: 'Protect your applications and data with security best practices.' },
        { title: 'DevOps Pipeline Setup', description: 'Automate your deployment process with CI/CD pipelines.' },
        { title: 'Machine Learning with TensorFlow', description: 'Build and train machine learning models using TensorFlow.' },
        { title: 'Vue.js 3 Complete Course', description: 'Master Vue.js 3 composition API and build modern web apps.' },
        { title: 'Database Design Principles', description: 'Learn how to design efficient and scalable databases.' },
      ],
      gaming: [
        { title: 'Elden Ring Boss Strategy Guide', description: 'Master the toughest bosses in Elden Ring with these proven strategies.' },
        { title: 'Minecraft Redstone Engineering', description: 'Build complex contraptions and automated systems in Minecraft.' },
        { title: 'Valorant Pro Tips and Tricks', description: 'Improve your aim and game sense in Valorant competitive play.' },
        { title: 'Fortnite Building Techniques', description: 'Master advanced building techniques to dominate in Fortnite.' },
        { title: 'Among Us Detective Skills', description: 'Learn how to spot impostors and win as crewmate in Among Us.' },
        { title: 'Call of Duty Warzone Loadouts', description: 'The best weapon loadouts for dominating in Warzone.' },
        { title: 'Pokemon Strategy Guide', description: 'Competitive Pokemon battling strategies and team building.' },
        { title: 'League of Legends Champion Guide', description: 'Master your favorite champions with detailed gameplay tips.' },
        { title: 'Cyberpunk 2077 Side Quests', description: 'Discover hidden side quests and secrets in Night City.' },
        { title: 'The Witcher 3 Complete Walkthrough', description: 'Complete guide to all main and side quests in The Witcher 3.' },
        { title: 'Apex Legends Movement Guide', description: 'Advanced movement techniques to outplay your opponents.' },
        { title: 'Fall Guys Winning Strategies', description: 'Tips and tricks to consistently win in Fall Guys matches.' },
        { title: 'Rocket League Training Routines', description: 'Practice routines to improve your Rocket League skills.' },
        { title: 'Overwatch 2 Hero Tier List', description: 'Ranking all heroes in the current Overwatch 2 meta.' },
        { title: 'Genshin Impact F2P Guide', description: 'How to progress efficiently without spending money.' },
      ],
      education: [
        { title: 'Calculus Made Easy', description: 'Understand calculus concepts with simple explanations and examples.' },
        { title: 'World History Timeline', description: 'Major events that shaped human civilization throughout history.' },
        { title: 'Physics Experiments at Home', description: 'Fun and educational physics experiments you can do at home.' },
        { title: 'Chemistry Fundamentals', description: 'Basic chemistry principles explained in an easy-to-understand way.' },
        { title: 'Biology Cell Structure', description: 'Explore the fascinating world of cells and their components.' },
        { title: 'Geography Climate Zones', description: 'Understanding different climate zones and their characteristics.' },
        { title: 'Mathematics Problem Solving', description: 'Strategies and techniques for solving complex math problems.' },
        { title: 'English Grammar Rules', description: 'Master English grammar with clear explanations and examples.' },
        { title: 'Study Techniques That Work', description: 'Evidence-based study methods to improve your learning.' },
        { title: 'Critical Thinking Skills', description: 'Develop analytical thinking skills for better decision making.' },
        { title: 'Speed Reading Techniques', description: 'Learn to read faster while maintaining comprehension.' },
        { title: 'Memory Improvement Methods', description: 'Techniques to enhance your memory and retention.' },
        { title: 'Public Speaking Mastery', description: 'Overcome fear and become a confident public speaker.' },
        { title: 'Time Management Strategies', description: 'Effective time management techniques for students and professionals.' },
        { title: 'Financial Literacy Basics', description: 'Essential financial concepts everyone should understand.' },
      ],
      entertainment: [
        { title: 'Movie Review: Latest Blockbuster', description: 'In-depth review of the latest Hollywood blockbuster release.' },
        { title: 'Behind the Scenes: Film Making', description: 'Exclusive behind-the-scenes look at movie production.' },
        { title: 'Music Producer Breakdown', description: 'Analyzing the production techniques in popular songs.' },
        { title: 'Celebrity Interview Highlights', description: 'Best moments from our exclusive celebrity interviews.' },
        { title: 'Stand-up Comedy Special', description: 'Hilarious stand-up comedy routine that will make you laugh.' },
        { title: 'Magic Tricks Revealed', description: 'Learn amazing magic tricks and impress your friends.' },
        { title: 'Dance Tutorial: Popular Moves', description: 'Learn the latest dance moves that are trending online.' },
        { title: 'TV Show Analysis', description: 'Deep dive into the themes and symbolism of popular TV shows.' },
        { title: 'Concert Highlights', description: 'Best performances from recent live music concerts.' },
        { title: 'Comedy Sketch Collection', description: 'Funny sketches and parodies that will brighten your day.' },
        { title: 'Theater Performance Review', description: 'Review of the latest Broadway and theater productions.' },
        { title: 'Podcast Highlights', description: 'Best moments from popular podcast episodes.' },
        { title: 'Art Gallery Virtual Tour', description: 'Explore famous art galleries from the comfort of your home.' },
        { title: 'Book Club Discussion', description: 'Engaging discussion about the latest bestselling novels.' },
        { title: 'Film Festival Coverage', description: 'Highlights and reviews from major film festivals.' },
      ],
      lifestyle: [
        { title: 'Morning Routine for Success', description: 'Start your day right with this productivity-boosting morning routine.' },
        { title: 'Healthy Meal Prep Ideas', description: 'Nutritious and delicious meal prep recipes for busy people.' },
        { title: 'Home Workout Routine', description: 'Effective exercises you can do at home without equipment.' },
        { title: 'Minimalist Living Tips', description: 'Simplify your life and reduce clutter with minimalist principles.' },
        { title: 'Meditation for Beginners', description: 'Learn basic meditation techniques to reduce stress and anxiety.' },
        { title: 'Budget-Friendly Home Decor', description: 'Transform your living space on a budget with creative ideas.' },
        { title: 'Sustainable Living Guide', description: 'Practical tips for living more sustainably and eco-friendly.' },
        { title: 'Fashion Style Tips', description: 'Build a versatile wardrobe with timeless fashion pieces.' },
        { title: 'Gardening for Beginners', description: 'Start your own garden with these simple gardening tips.' },
        { title: 'Travel Planning Essentials', description: 'How to plan the perfect trip on any budget.' },
        { title: 'Photography Tips', description: 'Improve your photography skills with professional techniques.' },
        { title: 'Productivity Hacks', description: 'Simple tricks to boost your productivity and get more done.' },
        { title: 'Stress Management Techniques', description: 'Effective ways to manage and reduce stress in your daily life.' },
        { title: 'DIY Home Improvement', description: 'Easy home improvement projects you can do yourself.' },
        { title: 'Personal Finance Tips', description: 'Smart money management strategies for financial freedom.' },
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

      // Create multiple videos from each template with variations
      templates.forEach((template, templateIndex) => {
        // Create 3-5 variations of each template
        const variations = Math.floor(Math.random() * 3) + 3
        
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

    // Add some random additional videos to reach 300+
    while (videoData.length < 300) {
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

  console.log('🎉 Seed completed successfully!')
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
