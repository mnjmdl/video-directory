// Simple test script to verify comments functionality
// Run with: node test_comments.js

const testComments = async () => {
  console.log('🧪 Testing Comments Functionality...\n')

  // Test 1: Fetch comments for a video
  try {
    console.log('📥 Testing GET /api/videos/[id]/comments')
    const response = await fetch('http://localhost:3000/api/videos/test-video-id/comments')

    if (response.ok) {
      const comments = await response.json()
      console.log('✅ GET comments successful')
      console.log(`📊 Found ${comments.length} comments\n`)
    } else {
      console.log('❌ GET comments failed:', response.status)
    }
  } catch (error) {
    console.log('❌ GET comments error:', error.message)
  }

  // Test 2: Try to post a comment (should fail without auth)
  try {
    console.log('📤 Testing POST /api/videos/[id]/comments (without auth)')
    const response = await fetch('http://localhost:3000/api/videos/test-video-id/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: 'Test comment',
      }),
    })

    if (response.status === 401) {
      console.log('✅ POST comment correctly requires authentication\n')
    } else {
      console.log('❌ POST comment auth check failed:', response.status)
    }
  } catch (error) {
    console.log('❌ POST comment error:', error.message)
  }

  console.log('🎉 Comments functionality test completed!')
  console.log('\n📝 To test posting comments:')
  console.log('1. Visit http://localhost:3000/auth/signin')
  console.log('2. Sign in with: admin@lingeriehub.com / admin123')
  console.log('3. Visit any video page and try posting a comment')
}

testComments().catch(console.error)