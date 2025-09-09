'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface SubscribeButtonProps {
  channelId: string
  initialSubscriberCount: number
  className?: string
}

export function SubscribeButton({ channelId, initialSubscriberCount, className = '' }: SubscribeButtonProps) {
  const { data: session } = useSession()
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [, setSubscriberCount] = useState(initialSubscriberCount)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch subscription status when user is authenticated
  useEffect(() => {
    if (session?.user && 'id' in session.user && session.user.id !== channelId) {
      fetch(`/api/users/${channelId}/subscribe`)
        .then(res => res.json())
        .then(data => {
          if (data.subscribed !== undefined) {
            setIsSubscribed(data.subscribed)
          }
        })
        .catch(error => console.error('Error fetching subscription status:', error))
    }
  }, [session?.user, channelId])

  const handleSubscribe = async () => {
    if (!session?.user || !('id' in session.user)) {
      alert('Please sign in to subscribe to channels')
      return
    }

    if (session.user.id === channelId) {
      alert('You cannot subscribe to your own channel')
      return
    }

    if (isLoading) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/users/${channelId}/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (data.success) {
        setIsSubscribed(data.subscribed)
        
        // Update subscriber count
        if (data.action === 'subscribed') {
          setSubscriberCount(prev => prev + 1)
        } else if (data.action === 'unsubscribed') {
          setSubscriberCount(prev => prev - 1)
        }
      } else {
        alert(data.error || 'Failed to update subscription')
      }
    } catch (error) {
      console.error('Error updating subscription:', error)
      alert('Failed to update subscription')
    } finally {
      setIsLoading(false)
    }
  }

  // Don't show subscribe button for own channel
  if (session?.user && 'id' in session.user && session.user.id === channelId) {
    return null
  }

  const defaultClassName = `px-6 py-2 rounded-full transition-colors ${
    isSubscribed 
      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
      : 'bg-red-600 text-white hover:bg-red-700'
  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`

  return (
    <button 
      onClick={handleSubscribe}
      disabled={isLoading}
      className={className || defaultClassName}
    >
      {isLoading ? 'Loading...' : isSubscribed ? 'Subscribed' : 'Subscribe'}
    </button>
  )
}
