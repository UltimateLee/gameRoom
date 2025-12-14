import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale/ko'
import Link from 'next/link'

export default async function PatchNotePage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const resolvedParams = await Promise.resolve(params)
  
  const patchNote = await prisma.patchNote.findUnique({
    where: { id: resolvedParams.id },
    select: {
      id: true,
      game: true,
      title: true,
      summary: true,
      originalUrl: true,
      originalContent: true,
      publishedAt: true,
      createdAt: true,
    },
  })

  if (!patchNote) {
    notFound()
  }

  const gameNames: Record<string, { name: string; color: string; bgColor: string }> = {
    lol: { name: '리그 오브 레전드', color: 'text-yellow-800', bgColor: 'bg-yellow-100' },
    valorant: { name: '발로란트', color: 'text-red-800', bgColor: 'bg-red-100' },
    pubg: { name: '배틀그라운드', color: 'text-green-800', bgColor: 'bg-green-100' },
  }
  const gameInfo = gameNames[patchNote.game] || { name: patchNote.game, color: 'text-gray-800', bgColor: 'bg-gray-100' }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12 max-w-4xl">
        {/* 뒤로가기 버튼 */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm sm:text-base">목록으로</span>
        </Link>

        {/* 패치노트 카드 */}
        <article className="bg-white rounded-lg sm:rounded-xl p-6 sm:p-8 shadow-lg border border-gray-100">
          {/* 헤더 */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-3 sm:px-4 py-1.5 text-sm sm:text-base font-semibold rounded-full ${gameInfo.bgColor} ${gameInfo.color}`}>
                {gameInfo.name}
              </span>
              <span className="text-xs sm:text-sm text-gray-500">
                {format(new Date(patchNote.publishedAt), 'yyyy년 M월 d일', { locale: ko })}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {patchNote.title}
            </h1>
          </div>

          {/* AI 요약 */}
          <div className="mb-8 pb-8 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">AI 요약</h2>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 sm:p-6">
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm sm:text-base">
                  {patchNote.summary || '요약 정보가 없습니다.'}
                </div>
              </div>
            </div>
          </div>

          {/* 원문 링크 */}
          <div className="mb-6">
            <a
              href={patchNote.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm sm:text-base transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              원문 보기
            </a>
          </div>

          {/* 메타 정보 */}
          <div className="pt-6 border-t border-gray-200">
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-500">
              <span>크롤링 일시: {format(new Date(patchNote.createdAt), 'yyyy년 M월 d일 HH:mm', { locale: ko })}</span>
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}

