'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { useSession } from 'next-auth/react'
import { ThumbsUp, ThumbsDown, MessageCircle, MoreVertical, Send } from 'lucide-react'

interface Comment {
  id: string
  content: string
  createdAt: Date
  user: {
    id: string
    username: string
    name: string | null
    avatar: string | null
  }
  replies?: Comment[]
}

interface CommentSectionProps {
  videoId: string
  comments: Comment[]
}

export function CommentSection({ videoId, comments: initialComments }: CommentSectionProps) {
  const { data: session } = useSession()
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>('newest')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch comments on component mount
  useEffect(() => {
    fetchComments()
  }, [videoId])

  const fetchComments = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/videos/${videoId}/comments`)
      if (response.ok) {
        const data = await response.json()
        setComments(data)
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent, parentId?: string) => {
    e.preventDefault()

    if (!session?.user) {
      alert('Please sign in to comment')
      return
    }

    const content = parentId ? replyContent : newComment
    if (!content.trim()) return

    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/videos/${videoId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.trim(),
          parentId: parentId || null,
        }),
      })

      if (response.ok) {
        const newCommentData = await response.json()

        if (parentId) {
          // Add reply to existing comment
          setComments(prevComments =>
            prevComments.map(comment =>
              comment.id === parentId
                ? {
                    ...comment,
                    replies: [...(comment.replies || []), newCommentData]
                  }
                : comment
            )
          )
          setReplyContent('')
          setReplyingTo(null)
        } else {
          // Add new top-level comment
          setComments(prevComments => [newCommentData, ...prevComments])
          setNewComment('')
        }
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to post comment')
      }
    } catch (error) {
      console.error('Error posting comment:', error)
      alert('Failed to post comment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const sortedComments = [...comments].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
    // For popular sort, you could sort by reply count or engagement
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <div className={`${isReply ? 'ml-12 mt-4' : ''} flex space-x-3`}>
      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
        {comment.user.avatar ? (
          <Image
            src={comment.user.avatar}
            alt={comment.user.name || comment.user.username}
            width={32}
            height={32}
            className="object-cover rounded-full"
          />
        ) : (
          <span className="text-xs font-medium text-gray-600">
            {(comment.user.name || comment.user.username).charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex items-center space-x-2">
          <span className="font-medium text-sm text-gray-900">
            {comment.user.name || comment.user.username}
          </span>
          <span className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
          </span>
        </div>

        <p className="text-sm text-gray-700 whitespace-pre-wrap">
          {comment.content}
        </p>

        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700 transition-colors">
            <ThumbsUp className="w-3 h-3" />
            <span>Like</span>
          </button>
          <button className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700 transition-colors">
            <ThumbsDown className="w-3 h-3" />
            <span>Dislike</span>
          </button>
          {!isReply && (
            <button
              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
              className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              <MessageCircle className="w-3 h-3" />
              <span>Reply</span>
            </button>
          )}
          <button className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
            <MoreVertical className="w-3 h-3" />
          </button>
        </div>

        {/* Reply Form */}
        {replyingTo === comment.id && (
          <form onSubmit={(e) => handleSubmitComment(e, comment.id)} className="mt-3 space-y-2">
            <div className="flex space-x-2">
              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                {session?.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt="Your avatar"
                    width={24}
                    height={24}
                    className="object-cover rounded-full"
                  />
                ) : (
                  <span className="text-xs font-medium text-gray-600">Y</span>
                )}
              </div>
              <div className="flex-1">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder={`Reply to ${comment.user.name || comment.user.username}...`}
                  className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-transparent resize-none"
                  rows={2}
                />
                <div className="flex items-center justify-end space-x-2 mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setReplyingTo(null)
                      setReplyContent('')
                    }}
                    className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!replyContent.trim() || isSubmitting}
                    className={`px-3 py-1 text-xs rounded transition-colors flex items-center space-x-1 ${
                      replyContent.trim() && !isSubmitting
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-3 h-3" />
                    <span>{isSubmitting ? 'Posting...' : 'Reply'}</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* Render replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-3">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} isReply={true} />
            ))}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Sort Options */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setSortBy('newest')}
          className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
            sortBy === 'newest'
              ? 'text-gray-900 border-gray-900'
              : 'text-gray-500 border-transparent hover:text-gray-700'
          }`}
        >
          Newest first
        </button>
        <button
          onClick={() => setSortBy('popular')}
          className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
            sortBy === 'popular'
              ? 'text-gray-900 border-gray-900'
              : 'text-gray-500 border-transparent hover:text-gray-700'
          }`}
        >
          Top comments
        </button>
      </div>

      {/* Add Comment Form */}
      {session?.user ? (
        <form onSubmit={handleSubmitComment} className="space-y-4">
          <div className="flex space-x-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt="Your avatar"
                  width={32}
                  height={32}
                  className="object-cover rounded-full"
                />
              ) : (
                <span className="text-xs font-medium text-gray-600">Y</span>
              )}
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                rows={3}
              />
              <div className="flex items-center justify-end space-x-2 mt-2">
                <button
                  type="button"
                  onClick={() => setNewComment('')}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newComment.trim() || isSubmitting}
                  className={`px-4 py-2 text-sm rounded transition-colors flex items-center space-x-1 ${
                    newComment.trim() && !isSubmitting
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Posting...' : 'Comment'}</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="text-center py-6 bg-gray-50 rounded-lg">
          <MessageCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 mb-2">Sign in to comment</p>
          <button
            onClick={() => window.location.href = '/auth/signin'}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {sortedComments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}

            {sortedComments.length === 0 && (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No comments yet</h3>
                <p className="text-gray-500">Be the first to comment on this video!</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
