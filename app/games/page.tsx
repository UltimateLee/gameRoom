import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'

interface GameStats {
  gameName: string
  platform: string
  postCount: number
  totalLikes: number
  totalViews: number
  avgRating: number
  latestPost: {
    id: string
    title: string
    createdAt: Date
  } | null
}

export default async function GamesPage() {
  try {
    // 게임 추천 게시글만 가져오기
    const gamePosts = await prisma.post.findMany({
      where: {
        category: 'game-recommend',
        gameInfo: { not: null },
      },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

  // 게임별 통계 계산
  const gameStatsMap = new Map<string, GameStats>()

  gamePosts.forEach((post) => {
    if (!post.gameInfo) return
    try {
      const gameInfo = JSON.parse(post.gameInfo)
      const gameName = gameInfo.gameName
      const platform = gameInfo.platform || '기타'
      const key = `${gameName}_${platform}`

      if (!gameStatsMap.has(key)) {
        gameStatsMap.set(key, {
          gameName,
          platform,
          postCount: 0,
          totalLikes: 0,
          totalViews: 0,
          avgRating: 0,
          latestPost: null,
        })
      }

      const stats = gameStatsMap.get(key)!
      stats.postCount++
      stats.totalLikes += post.likeCount || 0
      stats.totalViews += post.viewCount || 0
      if (gameInfo.rating && gameInfo.rating > 0) {
        stats.avgRating = (stats.avgRating * (stats.postCount - 1) + gameInfo.rating) / stats.postCount
      }

      if (!stats.latestPost || new Date(post.createdAt) > new Date(stats.latestPost.createdAt)) {
        stats.latestPost = {
          id: post.id,
          title: post.title,
          createdAt: post.createdAt,
        }
      }
    } catch {
      // Ignore invalid gameInfo
    }
  })

  // 인기순으로 정렬 (좋아요 + 조회수 기준)
  const gameStats = Array.from(gameStatsMap.values())
    .map((stats) => ({
      ...stats,
      popularity: stats.totalLikes * 2 + stats.totalViews,
    }))
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 20)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12 max-w-6xl">
        <div className="mb-6 sm:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-1 sm:mb-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                인기 게임 차트
              </h1>
              <p className="text-gray-600 text-xs sm:text-sm md:text-base">게이머들이 가장 많이 추천하는 게임을 확인하세요</p>
            </div>
            <Link
              href="/games/ai-recommend"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span className="hidden sm:inline">AI 게임 추천</span>
              <span className="sm:hidden">AI 추천</span>
            </Link>
          </div>
        </div>

        {gameStats.length === 0 ? (
          <div className="text-center py-12 sm:py-20 bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-100">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 mb-4 sm:mb-6">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-600 text-base sm:text-lg mb-2">아직 게임 추천이 없습니다</p>
            <Link
              href="/posts/new?category=game-recommend"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium mt-3 sm:mt-4 transition-colors text-sm sm:text-base"
            >
              첫 게임 추천을 작성해보세요!
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6">
            {gameStats.map((game, index) => (
              <Link
                key={`${game.gameName}_${game.platform}`}
                href={`/games/${encodeURIComponent(game.gameName)}?platform=${encodeURIComponent(game.platform)}`}
                className="block group"
              >
                <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-xl hover:border-primary-200 transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-start justify-between gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                        <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 text-white font-bold text-lg sm:text-xl flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors truncate">
                            {game.gameName}
                          </h2>
                          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1 truncate">{game.platform}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                        <div className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="font-semibold">{game.postCount}</span>개 추천
                        </div>
                        <div className="flex items-center gap-1 text-red-500">
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          <span className="font-semibold">{game.totalLikes}</span> 좋아요
                        </div>
                        <div className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span className="font-semibold">{game.totalViews}</span> 조회
                        </div>
                        {game.avgRating > 0 && (
                          <div className="flex items-center gap-1 text-yellow-500">
                            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                            <span className="font-semibold">{game.avgRating.toFixed(1)}</span>/10
                          </div>
                        )}
                      </div>
                      {game.latestPost && (
                        <p className="text-xs sm:text-sm text-gray-500 truncate">
                          최신 추천: <span className="text-primary-600 font-medium">{game.latestPost.title}</span>
                        </p>
                      )}
                    </div>
                    <div className="flex items-center text-primary-600 group-hover:translate-x-1 transition-transform flex-shrink-0">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
  } catch (error) {
    console.error('Games page error:', error)
    throw error
  }
}

