import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale/ko'
import DeletePostButton from '@/components/admin/DeletePostButton'

interface PostsPageProps {
  searchParams: Promise<{ page?: string; search?: string }>
}

export default async function AdminPostsPage({ searchParams }: PostsPageProps) {
  await requireAdmin()
  const resolvedSearchParams = await Promise.resolve(searchParams)
  
  const page = parseInt(resolvedSearchParams.page || '1')
  const search = resolvedSearchParams.search || ''
  const perPage = 20
  const skip = (page - 1) * perPage

  const where: any = {}
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { content: { contains: search } },
    ]
  }

  const [posts, totalCount] = await Promise.all([
    prisma.post.findMany({
      where,
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: perPage,
    }),
    prisma.post.count({ where }),
  ])

  const totalPages = Math.ceil(totalCount / perPage)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12 max-w-7xl">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/admin"
              className="text-gray-600 hover:text-primary-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900">
              게시글 관리
            </h1>
          </div>
          <p className="text-gray-600 text-sm sm:text-base">모든 게시글을 관리하세요</p>
        </div>

        {/* 검색 */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6 mb-6">
          <form method="get" className="flex gap-2">
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="제목 또는 내용으로 검색..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              검색
            </button>
          </form>
        </div>

        {/* 게시글 목록 */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제목</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작성자</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작성일</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">조회수</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">좋아요</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {posts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      게시글이 없습니다
                    </td>
                  </tr>
                ) : (
                  posts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Link
                          href={`/posts/${post.id}`}
                          className="font-medium text-gray-900 hover:text-primary-600 line-clamp-1"
                        >
                          {post.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {post.author.name || post.author.email}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {format(new Date(post.createdAt), 'yyyy-MM-dd HH:mm', { locale: ko })}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {post.viewCount || 0}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {post.likeCount || 0}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/posts/${post.id}/edit`}
                            className="text-primary-600 hover:text-primary-700 text-sm"
                          >
                            수정
                          </Link>
                          <DeletePostButton postId={post.id} />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                총 {totalCount}개 중 {skip + 1}-{Math.min(skip + perPage, totalCount)}개
              </div>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link
                    href={`/admin/posts?page=${page - 1}${search ? `&search=${encodeURIComponent(search)}` : ''}`}
                    className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm"
                  >
                    이전
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={`/admin/posts?page=${page + 1}${search ? `&search=${encodeURIComponent(search)}` : ''}`}
                    className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm"
                  >
                    다음
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

