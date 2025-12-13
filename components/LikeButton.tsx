'use client'

import { useState, useEffect, useCallback, memo } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface LikeButtonProps {
  postId: string
  initialLiked: boolean
  initialCount: number
}

function LikeButton({ postId, initialLiked, initialCount }: LikeButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const checkLike = async () => {
      if (!session) return
      try {
        const response = await fetch(`/api/posts/${postId}/like`)
        const data = await response.json()
        setLiked(data.liked)
      } catch (error) {
        // Ignore error
      }
    }
    checkLike()
  }, [postId, session])

  const handleLike = useCallback(async () => {
    if (!session) {
      router.push('/login')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
      })

      const data = await response.json()

      if (response.ok) {
        setLiked(data.liked)
        setCount((prev) => (data.liked ? prev + 1 : prev - 1))
      }
    } catch (error) {
      // Ignore error
    } finally {
      setLoading(false)
    }
  }, [session, router, postId])

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
        liked
          ? 'bg-red-50 text-red-600 hover:bg-red-100'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      } disabled:opacity-50`}
    >
      <svg
        className={`w-5 h-5 ${liked ? 'fill-current' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      <span>{count}</span>
    </button>
  )
}

export default memo(LikeButton)



