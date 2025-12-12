'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale/ko'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface Comment {
  id: string
  content: string
  createdAt: Date
  author: {
    name: string | null
    email: string
    image?: string | null
  }
}

interface CommentSectionProps {
  postId: string
  comments: Comment[]
}

export default function CommentSection({ postId, comments: initialComments }: CommentSectionProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [comments, setComments] = useState(initialComments)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session) {
      router.push('/login')
      return
    }

    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, postId }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || '댓글 작성에 실패했습니다.')
      } else {
        setComments([...comments, data])
        setContent('')
        router.refresh()
      }
    } catch (err) {
      setError('오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 md:p-8 lg:p-10">
      <div className="flex items-center gap-2 mb-6 sm:mb-8">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">댓글 <span className="text-primary-600">{comments.length}</span></h2>
      </div>

      {session ? (
        <form onSubmit={handleSubmit} className="mb-6 sm:mb-10">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-r-lg mb-3 sm:mb-4 text-xs sm:text-sm">
              <p className="font-medium">{error}</p>
            </div>
          )}
          <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200 focus-within:border-primary-300 focus-within:ring-2 focus-within:ring-primary-100 transition-all">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="댓글을 입력하세요..."
              rows={4}
              className="w-full bg-transparent border-0 focus:ring-0 resize-none text-gray-700 placeholder-gray-400 text-sm sm:text-base"
              required
            />
          </div>
          <div className="flex justify-end mt-3 sm:mt-4">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="hidden sm:inline">작성 중...</span>
                  <span className="sm:hidden">중...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="hidden sm:inline">댓글 작성</span>
                  <span className="sm:hidden">작성</span>
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-6 sm:mb-10 p-4 sm:p-6 bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg sm:rounded-xl border border-primary-100 text-center">
          <p className="text-gray-700 mb-2 sm:mb-3 font-medium text-sm sm:text-base">댓글을 작성하려면 로그인이 필요합니다</p>
          <a
            href="/login"
            className="inline-flex items-center gap-1.5 sm:gap-2 text-primary-600 hover:text-primary-700 font-semibold transition-colors text-sm sm:text-base"
          >
            로그인하기
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      )}

      <div className="space-y-4 sm:space-y-6">
        {comments.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-100 mb-3 sm:mb-4">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm sm:text-base">아직 댓글이 없습니다</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="group border-l-4 border-transparent hover:border-primary-300 pl-4 sm:pl-6 py-3 sm:py-4 rounded-r-lg hover:bg-gray-50 transition-all duration-200">
              <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                {comment.author.image ? (
                  <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={comment.author.image}
                      alt={comment.author.name || comment.author.email}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                    {(comment.author.name || comment.author.email)[0].toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                    <span className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                      {comment.author.name || comment.author.email}
                    </span>
                    <span className="text-xs text-gray-400">
                      {format(new Date(comment.createdAt), 'M월 d일 HH:mm', { locale: ko })}
                    </span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm sm:text-base">{comment.content}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

