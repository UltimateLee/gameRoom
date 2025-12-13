'use client'

import { memo, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale/ko'
import Image from 'next/image'

interface PostCardProps {
  post: {
    id: string
    title: string
    content: string
    category?: string
    tags?: string
    createdAt: Date
    viewCount?: number
    likeCount?: number
    author: {
      name: string | null
      email: string
      image?: string | null
    }
    comments: Array<{ id: string }>
  }
}

function PostCard({ post }: PostCardProps) {
  const router = useRouter()
  
  const preview = useMemo(() => {
    return post.content.length > 200 
      ? post.content.substring(0, 200) + '...' 
      : post.content
  }, [post.content])

  const tags = useMemo(() => {
    return post.tags ? (typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags) : []
  }, [post.tags])

  const formattedDate = useMemo(() => {
    return format(new Date(post.createdAt), 'M월 d일', { locale: ko })
  }, [post.createdAt])

  const handleCardClick = useCallback(() => {
    router.push(`/posts/${post.id}`)
  }, [router, post.id])

  const handleTagClick = useCallback((e: React.MouseEvent, tag: string) => {
    e.stopPropagation()
    router.push(`/posts?tag=${encodeURIComponent(tag)}`)
  }, [router])

  const handleCardClick = () => {
    router.push(`/posts/${post.id}`)
  }

  const handleTagClick = (e: React.MouseEvent, tag: string) => {
    e.stopPropagation()
    router.push(`/posts?tag=${encodeURIComponent(tag)}`)
  }

  return (
    <article 
      onClick={handleCardClick}
      className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-xl hover:border-primary-200 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-3 sm:gap-4 mb-2 sm:mb-3">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 flex-1">
          {post.title}
        </h2>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3">
          {tags.slice(0, 3).map((tag: string, index: number) => (
            <button
              key={index}
              onClick={(e) => handleTagClick(e, tag)}
              className="inline-flex items-center px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full text-xs font-medium hover:bg-primary-100 transition-colors"
            >
              #{tag}
            </button>
          ))}
          {tags.length > 3 && (
            <span className="text-xs text-gray-500">+{tags.length - 3}</span>
          )}
        </div>
      )}
        <p className="text-gray-600 mb-3 sm:mb-4 line-clamp-2 leading-relaxed text-xs sm:text-sm">
          {preview}
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 pt-3 sm:pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 sm:gap-3 text-xs text-gray-500 flex-wrap">
            <div className="flex items-center gap-1 sm:gap-1.5">
              {post.author.image ? (
                <div className="relative w-5 h-5 sm:w-6 sm:h-6 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={post.author.image}
                    alt={post.author.name || post.author.email}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 20px, 24px"
                    loading="lazy"
                  />
                </div>
              ) : (
                <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                  {(post.author.name || post.author.email)[0].toUpperCase()}
                </span>
              )}
              <span className="font-medium text-gray-700 text-xs sm:text-sm truncate max-w-[100px] sm:max-w-none">{post.author.name || post.author.email}</span>
            </div>
            {post.category === 'game-recommend' && (
              <>
                <span className="text-gray-300 hidden sm:inline">•</span>
                <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="hidden sm:inline">게임 추천</span>
                  <span className="sm:hidden">게임</span>
                </span>
              </>
            )}
            <span className="text-gray-300 hidden sm:inline">•</span>
            <span className="text-gray-500 text-xs">
              {format(new Date(post.createdAt), 'M월 d일', { locale: ko })}
            </span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 text-xs">
            <div className="flex items-center gap-1 text-red-500">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{post.likeCount || 0}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{post.viewCount || 0}</span>
            </div>
            <div className="flex items-center gap-1 text-primary-600 font-medium">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{post.comments.length}</span>
            </div>
          </div>
        </div>
      </article>
  )
}

export default memo(PostCard)

