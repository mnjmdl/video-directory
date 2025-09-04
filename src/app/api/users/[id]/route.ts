import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params
    console.log('PATCH /api/users/[id] - User ID:', userId)
    const session = await getServerSession(authOptions)
    console.log('Session:', session)

    // Check if user is admin
    if (!session || (session.user as { role?: string })?.role !== 'ADMIN') {
      console.log('Access denied - not admin or no session')
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      )
    }

    const { disabled, role } = await request.json()
    console.log('Request body - disabled:', disabled, 'role:', role, 'userId:', userId)

    // Prevent admin from modifying themselves
    if (userId === session.user.id) {
      console.log('Cannot modify own account')
      return NextResponse.json(
        { error: 'Cannot modify your own account.' },
        { status: 400 }
      )
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {}
    if (disabled !== undefined) updateData.disabled = disabled
    if (role !== undefined) updateData.role = role

    console.log('Updating user with data:', updateData)

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        disabled: true,
      }
    })

    console.log('User updated successfully:', updatedUser)
    const actionMessage = []
    if (disabled !== undefined) actionMessage.push(disabled ? 'disabled' : 'enabled')
    if (role !== undefined) actionMessage.push(`role changed to ${role}`)

    return NextResponse.json({
      message: `User ${actionMessage.join(' and ')} successfully`,
      user: updatedUser
    })

  } catch (error) {
    console.error('User update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params
    const session = await getServerSession(authOptions)

    // Check if user is admin
    if (!session || (session.user as { role?: string })?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      )
    }

    // Prevent admin from deleting themselves
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account.' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found.' },
        { status: 404 }
      )
    }

    // Delete user (cascade will handle related data)
    await prisma.user.delete({
      where: { id: userId }
    })
    return NextResponse.json({
      message: 'User deleted successfully'
    })

  } catch (error) {
    console.error('User deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}