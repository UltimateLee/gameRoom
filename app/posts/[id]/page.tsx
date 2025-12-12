import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale/ko'
import CommentSection from '@/components/CommentSection'
import DeleteButton from '@/components/DeleteButton'
import LikeButton from '@/components/LikeButton'
import BookmarkButton from '@/components/BookmarkButton'
import ShareButton from '@/components/ShareButton'
import Link from 'next/link'
import Image from 'next/image'

export default async function PostPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const session = await getServerSession(authOptions)
  const resolvedParams = await Promise.resolve(params)
  
  // 조회수 증가
  await prisma.post.update({
    where: { id: resolvedParams.id },
    data: { viewCount: { increment: 1 } },
  })

  const post = await prisma.post.findUnique({
    where: { id: resolvedParams.id },
    include: {
      author: {
        select: {
          name: true,
          email: true,
          image: true,
        },
      },
      comments: {
        include: {
          author: {
            select: {
              name: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  })

  if (!post) {
    notFound()
  }

  const isAuthor = session?.user?.email === post.author.email
  const images = post.images ? JSON.parse(post.images) : []
  const contentBlocks = (post as any).contentBlocks ? JSON.parse((post as any).contentBlocks) : null
  const gameInfo = post.gameInfo ? JSON.parse(post.gameInfo) : null
  const tags = (post as any).tags ? JSON.parse((post as any).tags) : []
  const userBookmarked = session?.user?.email
    ? await (async () => {
        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
        })
        if (!user) return false
        const bookmark = await prisma.bookmark.findUnique({
          where: {
            postId_userId: {
              postId: resolvedParams.id,
              userId: user.id,
            },
          },
        })
        return !!bookmark
      })()
    : false
  let userLiked = null
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })
    if (user) {
      userLiked = await prisma.like.findUnique({
        where: {
          postId_userId: {
            postId: resolvedParams.id,
            userId: user.id,
          },
        },
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12 max-w-4xl">
        <article className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 md:p-8 lg:p-10 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 flex-1 leading-tight">{post.title}</h1>
            {isAuthor && (
              <div className="flex gap-2 w-full sm:w-auto">
                <Link
                  href={`/posts/${post.id}/edit`}
                  className="inline-flex items-center gap-1.5 text-primary-600 hover:text-primary-700 text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg hover:bg-primary-50 transition-all duration-200 font-medium border border-primary-200 flex-1 sm:flex-initial justify-center"
                >
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  수정
                </Link>
                <DeleteButton postId={post.id} />
              </div>
            )}
          </div>

          {tags.length > 0 && (
            <div className="mb-4 sm:mb-6 flex flex-wrap gap-1.5 sm:gap-2">
              {tags.map((tag: string, index: number) => (
                <Link
                  key={index}
                  href={`/posts?tag=${encodeURIComponent(tag)}`}
                  className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs sm:text-sm font-medium hover:bg-primary-200 transition-colors"
                >
                  <span>#</span>
                  {tag}
                </Link>
              ))}
            </div>
          )}

          {post.category === 'game-recommend' && gameInfo && (
            <div className="mb-4 sm:mb-6 p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg sm:rounded-xl border border-blue-200">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <h3 className="font-bold text-base sm:text-lg text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  게임 정보
                </h3>
                {gameInfo.gameName && (
                  <Link
                    href={`/games/${encodeURIComponent(gameInfo.gameName)}${gameInfo.platform ? `?platform=${encodeURIComponent(gameInfo.platform)}` : ''}`}
                    className="text-xs sm:text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                  >
                    더보기
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {gameInfo.gameName && (
                  <div>
                    <span className="text-sm text-gray-600">게임명</span>
                    <p className="font-semibold text-gray-900">{gameInfo.gameName}</p>
                  </div>
                )}
                {gameInfo.platform && (
                  <div>
                    <span className="text-sm text-gray-600">플랫폼</span>
                    <p className="font-semibold text-gray-900">{gameInfo.platform}</p>
                  </div>
                )}
                {gameInfo.genre && (
                  <div>
                    <span className="text-sm text-gray-600">장르</span>
                    <p className="font-semibold text-gray-900">{gameInfo.genre}</p>
                  </div>
                )}
                {gameInfo.rating > 0 && (
                  <div>
                    <span className="text-sm text-gray-600">평점</span>
                    <p className="font-semibold text-gray-900 flex items-center gap-1">
                      {gameInfo.rating}/10
                      <span className="text-yellow-500">★</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-gray-100">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
              <Link href={`/users/${post.author.email}`} className="flex items-center gap-1.5 sm:gap-2 hover:opacity-80 transition-opacity flex-shrink-0">
                {post.author.image ? (
                  <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={post.author.image}
                      alt={post.author.name || post.author.email}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                    {(post.author.name || post.author.email)[0].toUpperCase()}
                  </div>
                )}
                <span className="font-medium text-gray-700 text-xs sm:text-sm whitespace-nowrap truncate max-w-[80px] sm:max-w-none">{post.author.name || post.author.email}</span>
              </Link>
              <span className="text-gray-300 hidden sm:inline flex-shrink-0">•</span>
              <div className="flex items-center gap-1 sm:gap-1.5 text-gray-500 flex-shrink-0">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="whitespace-nowrap text-xs sm:text-sm">
                  {format(new Date(post.createdAt), 'M월 d일 HH:mm', { locale: ko })}
                </span>
              </div>
              <span className="text-gray-300 hidden sm:inline flex-shrink-0">•</span>
              <div className="flex items-center gap-1 sm:gap-1.5 text-gray-500 flex-shrink-0">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="whitespace-nowrap text-xs sm:text-sm">조회 {post.viewCount || 0}</span>
              </div>
              <span className="text-gray-300 hidden sm:inline flex-shrink-0">•</span>
              <div className="flex items-center gap-1 sm:gap-1.5 text-primary-600 font-medium flex-shrink-0">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="whitespace-nowrap text-xs sm:text-sm">댓글 {post.comments.length}</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <LikeButton
                postId={post.id}
                initialLiked={!!userLiked}
                initialCount={post.likeCount || 0}
              />
              <BookmarkButton
                postId={post.id}
                initialBookmarked={userBookmarked}
              />
              <ShareButton
                postId={post.id}
                title={post.title}
              />
            </div>
          </div>

          {contentBlocks ? (
            <div className="space-y-6">
              {contentBlocks.map((block: any, index: number) => (
                <div key={index}>
                  {block.type === 'text' ? (
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-base">
                      {block.content}
                    </div>
                  ) : (
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                      {block.url && (
                        <Image
                          src={block.url}
                          alt={`Image ${index + 1}`}
                          fill
                          className="object-contain"
                        />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <>
              {images.length > 0 && (
                <div className="mb-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {images.map((url: string, index: number) => (
                      <div key={index} className="relative aspect-video rounded-lg overflow-hidden border border-gray-200">
                        <Image
                          src={url}
                          alt={`Image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-base">
                  {post.content}
                </div>
              </div>
            </>
          )}
        </article>

        <CommentSection postId={post.id} comments={post.comments} />
      </div>
    </div>
  )
}

