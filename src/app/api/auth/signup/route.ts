import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
// import bcrypt from 'bcryptjs' // Unused for now

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    console.log('Signup API: Session check:', session?.user)

    // Check if user is admin
    if (!session || (session.user as { role?: string })?.role !== 'ADMIN') {
      console.log('Signup API: Access denied - not admin')
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      )
    }

    const { email, username, name, password } = await request.json()

    console.log('Signup API: Creating user:', { email, username, name })

    // Validate required fields
    if (!email || !username || !name || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    })

    if (existingUser) {
      console.log('Signup API: User already exists')
      return NextResponse.json(
        { error: 'User with this email or username already exists' },
        { status: 400 }
      )
    }

    // Hash password (for future use when password storage is implemented)
    // const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email,
        username,
        name,
        role: 'USER', // Default role for new users
        // Note: In production, you'd store hashedPassword, but for demo we'll skip password storage
        // password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        createdAt: true,
      }
    })

    console.log('Signup API: User created successfully:', newUser.id)

    return NextResponse.json({
      message: 'User created successfully',
      user: newUser
    })

  } catch (error) {
    console.error('Signup API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}