import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import PostList from '@/components/PostList'

interface PostsPageProps {
  searchParams: Promise<{ page?: string; search?: string; category?: string }>
}

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const session = await getServerSession(authOptions)
  const resolvedSearchParams = await Promise.resolve(searchParams)
  const page = parseInt(resolvedSearchParams.page || '1')
  const search = resolvedSearchParams.search || ''
  const category = resolvedSearchParams.category || ''
  const sort = resolvedSearchParams.sort || 'latest'
  const tag = resolvedSearchParams.tag || ''
  const perPage = 10
  const skip = (page - 1) * perPage

  const where: any = {}
  
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { content: { contains: search } },
    ]
  }
  
  if (category) {
    where.category = category
  }

  if (tag) {
    where.tags = { contains: `"${tag}"` }
  }

  let orderBy: any = { createdAt: 'desc' }
  if (sort === 'popular') {
    orderBy = { viewCount: 'desc' }
  } else if (sort === 'likes') {
    orderBy = { likeCount: 'desc' }
  }

  const [posts, totalCount] = await Promise.all([
    prisma.post.findMany({
      where,
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
      orderBy,
      skip,
      take: perPage,
    }),
    prisma.post.count({ where }),
  ])

  const totalPages = Math.ceil(totalCount / perPage)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12 max-w-6xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-10">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-1 sm:mb-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {category === 'game-recommend' ? '게임 추천' : '일반 게시판'}
            </h1>
            <p className="text-gray-600 text-xs sm:text-sm md:text-base">
              {category === 'game-recommend' ? '게이머들이 추천하는 게임을 확인하세요' : '모든 게시글을 확인하고 검색하세요'}
            </p>
          </div>
          {session && (
            <Link
              href="/posts/new"
              className="group inline-flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">새 글 작성</span>
              <span className="sm:hidden">작성</span>
            </Link>
          )}
        </div>

        <PostList
          initialPosts={posts.map((post) => ({
            ...post,
            likeCount: (post as any).likeCount || 0,
          }))}
          initialPage={page}
          initialTotalPages={totalPages}
          initialSearch={search}
          initialCategory={category}
          initialSort={sort}
          initialTag={tag}
        />
      </div>
    </div>
  )
}

