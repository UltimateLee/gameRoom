'use client'

import { useState, useEffect, useCallback, memo } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface BookmarkButtonProps {
  postId: string
  initialBookmarked: boolean
}

function BookmarkButton({ postId, initialBookmarked }: BookmarkButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [bookmarked, setBookmarked] = useState(initialBookmarked)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const checkBookmark = async () => {
      if (!session) return
      try {
        const response = await fetch(`/api/posts/${postId}/bookmark`)
        const data = await response.json()
        setBookmarked(data.bookmarked)
      } catch (error) {
        // Ignore error
      }
    }
    checkBookmark()
  }, [postId, session])

  const handleBookmark = useCallback(async () => {
    if (!session) {
      router.push('/login')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/posts/${postId}/bookmark`, {
        method: 'POST',
      })

      const data = await response.json()

      if (response.ok) {
        setBookmarked(data.bookmarked)
      }
    } catch (error) {
      // Ignore error
    } finally {
      setLoading(false)
    }
  }, [session, router, postId])

  return (
    <button
      onClick={handleBookmark}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
        bookmarked
          ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      } disabled:opacity-50`}
      title={bookmarked ? '북마크 취소' : '북마크 추가'}
    >
      <svg
        className={`w-5 h-5 ${bookmarked ? 'fill-current' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
        />
      </svg>
      <span className="hidden sm:inline">{bookmarked ? '북마크됨' : '북마크'}</span>
    </button>
  )
}

export default memo(BookmarkButton)



