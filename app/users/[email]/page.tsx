import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale/ko'
import PostCard from '@/components/PostCard'
import Link from 'next/link'
import Image from 'next/image'

export default async function UserProfilePage({ params }: { params: Promise<{ email: string }> | { email: string } }) {
  const session = await getServerSession(authOptions)
  const resolvedParams = await Promise.resolve(params)
  const userEmail = decodeURIComponent(resolvedParams.email)

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    include: {
      _count: {
        select: {
          posts: true,
          comments: true,
          likes: true,
        },
      },
    },
  })

  if (!user) {
    notFound()
  }

  const [posts, likedPosts, bookmarkedPosts] = await Promise.all([
    prisma.post.findMany({
      where: { authorId: user.id },
      include: {
        author: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
        comments: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    }),
    session?.user?.email === userEmail
      ? prisma.post.findMany({
          where: {
            likes: {
              some: {
                userId: user.id,
              },
            },
          },
          include: {
            author: {
              select: {
                name: true,
                email: true,
                image: true,
              },
            },
            comments: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        })
      : [],
    session?.user?.email === userEmail
      ? prisma.post.findMany({
          where: {
            bookmarks: {
              some: {
                userId: user.id,
              },
            },
          },
          include: {
            author: {
              select: {
                name: true,
                email: true,
                image: true,
              },
            },
            comments: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        })
      : [],
  ])

  const isOwnProfile = session?.user?.email === userEmail

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12 max-w-6xl">
        {/* 프로필 헤더 */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 md:p-8 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            {user.image ? (
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
                <Image
                  src={user.image}
                  alt={user.name || userEmail}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xl sm:text-2xl font-bold flex-shrink-0">
                {(user.name || user.email)[0].toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
                  {user.name || user.email}
                </h1>
                {isOwnProfile && (
                  <Link
                    href={`/users/${encodeURIComponent(userEmail)}/edit`}
                    className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 text-xs sm:text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors w-fit"
                  >
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    편집
                  </Link>
                )}
              </div>
              {user.bio && (
                <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">{user.bio}</p>
              )}
              <div className="flex flex-wrap gap-4 sm:gap-6 text-xs sm:text-sm text-gray-500">
                <div>
                  <span className="font-semibold text-gray-900">{user._count.posts}</span> 게시글
                </div>
                <div>
                  <span className="font-semibold text-gray-900">{user._count.comments}</span> 댓글
                </div>
                <div>
                  <span className="font-semibold text-gray-900">{user._count.likes}</span> 좋아요
                </div>
                <div className="w-full sm:w-auto">
                  가입일: {format(new Date(user.createdAt), 'yyyy년 M월 d일', { locale: ko })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 탭 */}
        <div className="flex gap-2 sm:gap-4 mb-4 sm:mb-6 border-b border-gray-200 overflow-x-auto">
          <Link
            href={`/users/${encodeURIComponent(userEmail)}`}
            className="px-3 sm:px-4 py-2 font-semibold text-primary-600 border-b-2 border-primary-600 text-sm sm:text-base whitespace-nowrap"
          >
            작성한 게시글
          </Link>
          {isOwnProfile && (
            <>
              <Link
                href={`/users/${encodeURIComponent(userEmail)}/liked`}
                className="px-3 sm:px-4 py-2 text-gray-600 hover:text-primary-600 transition-colors text-sm sm:text-base whitespace-nowrap"
              >
                좋아요한 게시글
              </Link>
              <Link
                href={`/users/${encodeURIComponent(userEmail)}/bookmarked`}
                className="px-3 sm:px-4 py-2 text-gray-600 hover:text-primary-600 transition-colors text-sm sm:text-base whitespace-nowrap"
              >
                북마크한 게시글
              </Link>
            </>
          )}
        </div>

        {/* 게시글 목록 */}
        {posts.length === 0 ? (
          <div className="text-center py-12 sm:py-16 bg-white rounded-xl shadow-lg border border-gray-100">
            <p className="text-gray-500 text-sm sm:text-base">아직 작성한 게시글이 없습니다.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={{
                  ...post,
                  likeCount: (post as any).likeCount || 0,
                  tags: post.tags ?? undefined,
                  category: post.category ?? undefined,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

