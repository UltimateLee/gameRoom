'use client'

import { useState, useTransition, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import PostCard from './PostCard'

interface Post {
  id: string
  title: string
  content: string
  createdAt: Date
  viewCount?: number
  likeCount?: number
  category?: string
  tags?: string
  author: {
    name: string | null
    email: string
    image?: string | null
  }
  comments: Array<{ id: string }>
}

interface PostListProps {
  initialPosts: Post[]
  initialPage: number
  initialTotalPages: number
  initialSearch: string
  initialCategory?: string
  initialSort?: string
  initialTag?: string
}

function PostListContent({
  initialPosts,
  initialPage,
  initialTotalPages,
  initialSearch,
  initialCategory = '',
  initialSort = 'latest',
  initialTag = '',
}: PostListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(initialSearch)
  const [sort, setSort] = useState(initialSort)
  const [isPending, startTransition] = useTransition()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (search) {
        params.set('search', search)
      } else {
        params.delete('search')
      }
      if (initialCategory) {
        params.set('category', initialCategory)
      }
      if (sort !== 'latest') {
        params.set('sort', sort)
      } else {
        params.delete('sort')
      }
      if (initialTag) {
        params.set('tag', initialTag)
      }
      params.set('page', '1')
      router.push(`/posts?${params.toString()}`)
    })
  }

  const handleSortChange = (newSort: string) => {
    setSort(newSort)
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (newSort !== 'latest') {
        params.set('sort', newSort)
      } else {
        params.delete('sort')
      }
      params.set('page', '1')
      router.push(`/posts?${params.toString()}`)
    })
  }

  const handlePageChange = (newPage: number) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('page', newPage.toString())
      if (initialCategory) {
        params.set('category', initialCategory)
      }
      if (sort !== 'latest') {
        params.set('sort', sort)
      }
      if (initialTag) {
        params.set('tag', initialTag)
      }
      router.push(`/posts?${params.toString()}`)
    })
  }

  return (
    <div>
      {/* 정렬 및 검색 */}
      <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-medium text-gray-700">정렬:</span>
          <select
            value={sort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-xs sm:text-sm"
          >
            <option value="latest">최신순</option>
            <option value="popular">인기순</option>
            <option value="likes">좋아요순</option>
          </select>
        </div>
      </div>

      {/* 검색 바 */}
      <form onSubmit={handleSearch} className="mb-6 sm:mb-8">
        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-100 p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="flex-1 relative">
              <svg className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="제목 또는 내용으로 검색..."
                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-50 focus:bg-white transition-all text-sm sm:text-base"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200 disabled:opacity-50 font-medium shadow-md shadow-primary-500/30 text-xs sm:text-sm"
              >
                {isPending ? (
                  <>
                    <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="hidden sm:inline">검색 중...</span>
                    <span className="sm:hidden">중...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span className="hidden sm:inline">검색</span>
                    <span className="sm:hidden">검색</span>
                  </>
                )}
              </button>
              {initialSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('')
                    router.push('/posts')
                  }}
                  className="px-3 sm:px-6 py-2 sm:py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium text-xs sm:text-sm"
                >
                  초기화
                </button>
              )}
            </div>
          </div>
        </div>
      </form>

      {/* 게시글 목록 */}
      {initialPosts.length === 0 ? (
        <div className="text-center py-12 sm:py-20 bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-100">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 mb-4 sm:mb-6">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-600 text-base sm:text-lg mb-2">
            {initialSearch ? '검색 결과가 없습니다' : '아직 게시글이 없습니다'}
          </p>
          {initialSearch && (
            <button
              onClick={() => {
                setSearch('')
                const params = new URLSearchParams()
                if (initialCategory) params.set('category', initialCategory)
                if (sort !== 'latest') params.set('sort', sort)
                if (initialTag) params.set('tag', initialTag)
                router.push(`/posts?${params.toString()}`)
              }}
              className="text-primary-600 hover:text-primary-700 font-medium mt-4"
            >
              검색 초기화
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:gap-6 mb-6 sm:mb-8">
            {initialPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {/* 페이지네이션 */}
          {initialTotalPages > 1 && (
            <div className="flex flex-wrap justify-center items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => handlePageChange(initialPage - 1)}
                disabled={initialPage === 1 || isPending}
                className="px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs sm:text-sm"
              >
                이전
              </button>
              {Array.from({ length: initialTotalPages }, (_, i) => i + 1).map((pageNum) => {
                if (
                  pageNum === 1 ||
                  pageNum === initialTotalPages ||
                  (pageNum >= initialPage - 2 && pageNum <= initialPage + 2)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      disabled={isPending}
                      className={`px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 border rounded-lg transition-colors text-xs sm:text-sm ${
                        pageNum === initialPage
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      } disabled:opacity-50`}
                    >
                      {pageNum}
                    </button>
                  )
                } else if (pageNum === initialPage - 3 || pageNum === initialPage + 3) {
                  return <span key={pageNum} className="px-2">...</span>
                }
                return null
              })}
              <button
                onClick={() => handlePageChange(initialPage + 1)}
                disabled={initialPage === initialTotalPages || isPending}
                className="px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs sm:text-sm"
              >
                다음
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function PostList(props: PostListProps) {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <PostListContent {...props} />
    </Suspense>
  )
}

