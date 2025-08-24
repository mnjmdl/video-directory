'use client'

import { useState } from 'react'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { ThumbsUp, ThumbsDown, MessageCircle, MoreVertical } from 'lucide-react'

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
}

interface CommentSectionProps {
  videoId: string
  comments: Comment[]
}

export function CommentSection({ comments }: CommentSectionProps) {
  const [newComment, setNewComment] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>('newest')

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement comment submission
    console.log('Submitting comment:', newComment)
    setNewComment('')
  }

  const sortedComments = [...comments].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
    // For popular sort, you'd typically sort by likes/engagement
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

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
      <form onSubmit={handleSubmitComment} className="space-y-4">
        <div className="flex space-x-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-medium text-gray-600">You</span>
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
                disabled={!newComment.trim()}
                className={`px-4 py-2 text-sm rounded transition-colors ${
                  newComment.trim()
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Comment
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-6">
        {sortedComments.map((comment) => (
          <div key={comment.id} className="flex space-x-3">
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
                <button className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700 transition-colors">
                  <MessageCircle className="w-3 h-3" />
                  <span>Reply</span>
                </button>
                <button className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
                  <MoreVertical className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {sortedComments.length === 0 && (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No comments yet</h3>
            <p className="text-gray-500">Be the first to comment on this video!</p>
          </div>
        )}
      </div>
    </div>
  )
}
