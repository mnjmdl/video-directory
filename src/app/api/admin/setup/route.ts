import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    // const session = await getServerSession(authOptions)

    // Allow setup without session for initial admin setup
    // In production, you should remove this endpoint or secure it properly

    // Find the admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@crystal.com' }
    })

    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin user not found. Please create the admin user first.' },
        { status: 404 }
      )
    }

    // Update admin user with ADMIN role
    const updatedAdmin = await prisma.user.update({
      where: { id: adminUser.id },
      data: {
        role: 'ADMIN',
        disabled: false // Ensure admin is not disabled
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        disabled: true
      }
    })

    return NextResponse.json({
      message: 'Admin user setup completed successfully',
      user: updatedAdmin
    })

  } catch (error) {
    console.error('Admin setup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}