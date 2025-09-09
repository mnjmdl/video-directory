import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id: channelId } = await params

    // Prevent self-subscription
    if (session.user.id === channelId) {
      return NextResponse.json(
        { error: 'Cannot subscribe to yourself' },
        { status: 400 }
      )
    }

    // Verify the channel exists
    const channel = await prisma.user.findUnique({
      where: { id: channelId },
    })

    if (!channel) {
      return NextResponse.json(
        { error: 'Channel not found' },
        { status: 404 }
      )
    }

    // Check if already subscribed
    const existingSubscription = await prisma.subscription.findUnique({
      where: {
        subscriberId_channelId: {
          subscriberId: session.user.id,
          channelId,
        },
      },
    })

    if (existingSubscription) {
      // Unsubscribe
      await prisma.subscription.delete({
        where: { id: existingSubscription.id },
      })
      return NextResponse.json({
        success: true,
        action: 'unsubscribed',
        subscribed: false,
      })
    } else {
      // Subscribe
      await prisma.subscription.create({
        data: {
          subscriberId: session.user.id,
          channelId,
        },
      })
      return NextResponse.json({
        success: true,
        action: 'subscribed',
        subscribed: true,
      })
    }
  } catch (error) {
    console.error('Error handling subscription:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id: channelId } = await params

    const subscription = await prisma.subscription.findUnique({
      where: {
        subscriberId_channelId: {
          subscriberId: session.user.id,
          channelId,
        },
      },
    })

    return NextResponse.json({
      subscribed: !!subscription,
    })
  } catch (error) {
    console.error('Error fetching subscription status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
