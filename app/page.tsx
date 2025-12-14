import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import PostCard from '@/components/PostCard'

// ISR: 1시간마다 재검증
export const revalidate = 3600

export default async function Home() {
  const session = await getServerSession(authOptions)
  
  const [latestPosts, popularPosts, patchNotes] = await Promise.all([
    prisma.post.findMany({
      select: {
        id: true,
        title: true,
        content: true,
        category: true,
        tags: true,
        createdAt: true,
        viewCount: true,
        likeCount: true,
        author: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    }),
    prisma.post.findMany({
      select: {
        id: true,
        title: true,
        content: true,
        category: true,
        tags: true,
        createdAt: true,
        viewCount: true,
        likeCount: true,
        author: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: {
        likeCount: 'desc',
      },
      take: 5,
    }),
    prisma.patchNote.findMany({
      select: {
        id: true,
        game: true,
        title: true,
        summary: true,
        originalUrl: true,
        publishedAt: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 3,
    }),
  ])

  // 데이터 포맷팅
  const latestPostsWithViewCount = latestPosts.map((post) => ({
    ...post,
    viewCount: post.viewCount || 0,
    likeCount: post.likeCount || 0,
    tags: post.tags ?? undefined,
    category: post.category ?? undefined,
    comments: Array(post._count.comments).fill({ id: '' }).map((_, i) => ({ id: `temp-${i}` })),
  }))

  const popularPostsWithViewCount = popularPosts.map((post) => ({
    ...post,
    viewCount: post.viewCount || 0,
    likeCount: post.likeCount || 0,
    tags: post.tags ?? undefined,
    category: post.category ?? undefined,
    comments: Array(post._count.comments).fill({ id: '' }).map((_, i) => ({ id: `temp-${i}` })),
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12 max-w-6xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-10">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-1 sm:mb-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              최신 게시글
            </h1>
            <p className="text-gray-600 text-xs sm:text-sm md:text-base">게임방의 최신 소식을 확인하세요</p>
          </div>
          {session && (
            <Link
              href="/posts/new"
              className="group relative inline-flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">새 글 작성</span>
              <span className="sm:hidden">작성</span>
            </Link>
          )}
        </div>

        {latestPosts.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-600 text-lg mb-2">아직 게시글이 없습니다</p>
            {session && (
              <Link
                href="/posts/new"
                className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium mt-4 transition-colors"
              >
                첫 게시글을 작성해보세요!
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>
        ) : (
          <>
            {patchNotes.length > 0 && (
              <div className="mb-8 sm:mb-12">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    최신 패치노트
                  </h2>
                </div>
                <div className="grid gap-4 sm:gap-6">
                  {patchNotes.map((note) => {
                    const gameNames: Record<string, { name: string; color: string }> = {
                      lol: { name: '리그 오브 레전드', color: 'bg-yellow-100 text-yellow-800' },
                      valorant: { name: '발로란트', color: 'bg-red-100 text-red-800' },
                      pubg: { name: '배틀그라운드', color: 'bg-green-100 text-green-800' },
                    }
                    const gameInfo = gameNames[note.game] || { name: note.game, color: 'bg-gray-100 text-gray-800' }
                    
                    return (
                      <div
                        key={note.id}
                        className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100"
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold rounded-full ${gameInfo.color}`}>
                              {gameInfo.name}
                            </span>
                            <span className="text-xs sm:text-sm text-gray-500">
                              {new Date(note.publishedAt).toLocaleDateString('ko-KR')}
                            </span>
                          </div>
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3 line-clamp-2">
                          {note.title}
                        </h3>
                        <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4 line-clamp-3">
                          {note.summary}
                        </p>
                        <a
                          href={note.originalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm sm:text-base transition-colors"
                        >
                          원문 보기
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {popularPostsWithViewCount.length > 0 && (
              <div className="mb-8 sm:mb-12">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    인기 게시글
                  </h2>
                </div>
                <div className="grid gap-3 sm:gap-4 mb-6 sm:mb-8">
                  {popularPostsWithViewCount.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">최신 게시글</h2>
              <div className="grid gap-4 sm:gap-6 mb-6 sm:mb-10">
                {latestPostsWithViewCount.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </div>

            <div className="text-center">
              <Link
                href="/posts"
                className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold transition-all duration-200 hover:gap-3"
              >
                전체 게시글 보기
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

