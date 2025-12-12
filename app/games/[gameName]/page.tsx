import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import PostCard from '@/components/PostCard'
import Link from 'next/link'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale/ko'

interface GamePageProps {
  params: Promise<{ gameName: string }> | { gameName: string }
  searchParams: Promise<{ platform?: string }> | { platform?: string }
}

export default async function GameDetailPage({ params, searchParams }: GamePageProps) {
  const resolvedParams = await Promise.resolve(params)
  const resolvedSearchParams = await Promise.resolve(searchParams)
  const gameName = decodeURIComponent(resolvedParams.gameName)
  const platform = resolvedSearchParams.platform ? decodeURIComponent(resolvedSearchParams.platform) : null

  // 해당 게임의 모든 추천 게시글 가져오기
  const posts = await prisma.post.findMany({
    where: {
      category: 'game-recommend',
      gameInfo: {
        contains: `"gameName":"${gameName}"`,
      },
    },
    include: {
      author: {
        select: {
          name: true,
          email: true,
        },
      },
      comments: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // 게임 정보 추출 및 필터링
  const gamePosts = posts
    .map((post) => {
      try {
        const gameInfo = post.gameInfo ? JSON.parse(post.gameInfo) : null
        if (gameInfo?.gameName === gameName) {
          if (!platform || gameInfo?.platform === platform) {
            return { post, gameInfo }
          }
        }
        return null
      } catch {
        return null
      }
    })
    .filter((item): item is { post: typeof posts[0]; gameInfo: any } => item !== null)

  if (gamePosts.length === 0) {
    notFound()
  }

  // 통계 계산
  const stats = {
    totalPosts: gamePosts.length,
    totalLikes: gamePosts.reduce((sum, item) => sum + (item.post.likeCount || 0), 0),
    totalViews: gamePosts.reduce((sum, item) => sum + (item.post.viewCount || 0), 0),
    avgRating: 0,
    platforms: new Set<string>(),
  }

  let ratingSum = 0
  let ratingCount = 0

  gamePosts.forEach(({ gameInfo }) => {
    if (gameInfo?.platform) {
      stats.platforms.add(gameInfo.platform)
    }
    if (gameInfo?.rating && gameInfo.rating > 0) {
      ratingSum += gameInfo.rating
      ratingCount++
    }
  })

  if (ratingCount > 0) {
    stats.avgRating = ratingSum / ratingCount
  }

  const firstGameInfo = gamePosts[0].gameInfo

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12 max-w-6xl">
        {/* 게임 헤더 */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 md:p-8 mb-6 sm:mb-8">
          <div className="flex items-start justify-between gap-4 sm:gap-6 mb-4 sm:mb-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xl sm:text-2xl font-bold flex-shrink-0">
                  🎮
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-1 truncate">
                    {gameName}
                  </h1>
                  {firstGameInfo?.genre && (
                    <p className="text-gray-600 text-sm sm:text-base">{firstGameInfo.genre}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div>
                  <span className="text-xs sm:text-sm text-gray-600">추천 게시글</span>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalPosts}</p>
                </div>
                <div>
                  <span className="text-xs sm:text-sm text-gray-600">총 좋아요</span>
                  <p className="text-xl sm:text-2xl font-bold text-red-600">{stats.totalLikes}</p>
                </div>
                <div>
                  <span className="text-xs sm:text-sm text-gray-600">총 조회수</span>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalViews}</p>
                </div>
                {stats.avgRating > 0 && (
                  <div>
                    <span className="text-xs sm:text-sm text-gray-600">평균 평점</span>
                    <p className="text-xl sm:text-2xl font-bold text-yellow-600 flex items-center gap-1">
                      {stats.avgRating.toFixed(1)}
                      <span className="text-base sm:text-lg">★</span>
                    </p>
                  </div>
                )}
              </div>
              {stats.platforms.size > 0 && (
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  <span className="text-xs sm:text-sm font-medium text-gray-700">플랫폼:</span>
                  {Array.from(stats.platforms).map((p) => (
                    <Link
                      key={p}
                      href={`/games/${encodeURIComponent(gameName)}?platform=${encodeURIComponent(p)}`}
                      className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                        platform === p
                          ? 'bg-primary-600 text-white'
                          : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                      }`}
                    >
                      {p}
                    </Link>
                  ))}
                  {platform && (
                    <Link
                      href={`/games/${encodeURIComponent(gameName)}`}
                      className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                      전체
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 게시글 목록 */}
        <div className="mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
            {platform ? `${platform} 추천 게시글` : '모든 추천 게시글'}
          </h2>
        </div>

        {gamePosts.length === 0 ? (
          <div className="text-center py-10 sm:py-12 bg-white rounded-xl shadow-lg border border-gray-100">
            <p className="text-gray-500 text-sm sm:text-base">해당 플랫폼의 추천 게시글이 없습니다.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6">
            {gamePosts.map(({ post }) => (
              <PostCard
                key={post.id}
                post={{
                  ...post,
                  likeCount: (post as any).likeCount || 0,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

