import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import PostCard from '@/components/PostCard'
import Link from 'next/link'

export default async function UserBookmarkedPostsPage({ params }: { params: Promise<{ email: string }> | { email: string } }) {
  const session = await getServerSession(authOptions)
  const resolvedParams = await Promise.resolve(params)
  const userEmail = decodeURIComponent(resolvedParams.email)

  if (session?.user?.email !== userEmail) {
    notFound()
  }

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
  })

  if (!user) {
    notFound()
  }

  const posts = await prisma.post.findMany({
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
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="mb-6">
          <Link
            href={`/users/${encodeURIComponent(userEmail)}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            프로필로 돌아가기
          </Link>
        </div>

        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <Link
            href={`/users/${encodeURIComponent(userEmail)}`}
            className="px-4 py-2 text-gray-600 hover:text-primary-600 transition-colors"
          >
            작성한 게시글
          </Link>
          <Link
            href={`/users/${encodeURIComponent(userEmail)}/liked`}
            className="px-4 py-2 text-gray-600 hover:text-primary-600 transition-colors"
          >
            좋아요한 게시글
          </Link>
          <Link
            href={`/users/${encodeURIComponent(userEmail)}/bookmarked`}
            className="px-4 py-2 font-semibold text-primary-600 border-b-2 border-primary-600"
          >
            북마크한 게시글
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg border border-gray-100">
            <p className="text-gray-500">북마크한 게시글이 없습니다.</p>
          </div>
        ) : (
          <div className="grid gap-6">
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

