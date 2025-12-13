'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface Recommendation {
  gameName: string
  platform: string
  genre: string
  reason: string
  rating: number
}

export default function AIRecommendPage() {
  const { data: session } = useSession()
  const [preferences, setPreferences] = useState('')
  const [platform, setPlatform] = useState('')
  const [genre, setGenre] = useState('')
  const [playStyle, setPlayStyle] = useState('')
  const [loading, setLoading] = useState(false)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setRecommendations([])

    try {
      const response = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferences,
          platform: platform || undefined,
          genre: genre || undefined,
          playStyle: playStyle || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || '게임 추천을 받는 중 오류가 발생했습니다.')
      } else {
        setRecommendations(data.recommendations || [])
      }
    } catch (err: any) {
      setError('오류가 발생했습니다. 다시 시도해주세요.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12 max-w-4xl">
        <div className="mb-6 sm:mb-10">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              AI 게임 추천
            </h1>
          </div>
          <p className="text-gray-600 text-xs sm:text-sm md:text-base">
            당신의 취향에 맞는 게임을 AI가 추천해드립니다
          </p>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 md:p-8 mb-6 sm:mb-8">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                선호도 / 요구사항
              </label>
              <textarea
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                placeholder="예: 액션이 많고 스토리가 좋은 게임, 멀티플레이어 게임, 캐주얼한 게임 등..."
                rows={4}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none text-sm sm:text-base"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                  플랫폼
                </label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm sm:text-base"
                >
                  <option value="">선택 안 함</option>
                  <option value="PC">PC</option>
                  <option value="PlayStation">PlayStation</option>
                  <option value="Xbox">Xbox</option>
                  <option value="Nintendo Switch">Nintendo Switch</option>
                  <option value="모바일">모바일</option>
                  <option value="다양">다양</option>
                </select>
              </div>

              <div>
                <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                  장르
                </label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm sm:text-base"
                >
                  <option value="">선택 안 함</option>
                  <option value="액션">액션</option>
                  <option value="RPG">RPG</option>
                  <option value="전략">전략</option>
                  <option value="시뮬레이션">시뮬레이션</option>
                  <option value="어드벤처">어드벤처</option>
                  <option value="레이싱">레이싱</option>
                  <option value="스포츠">스포츠</option>
                  <option value="퍼즐">퍼즐</option>
                  <option value="다양">다양</option>
                </select>
              </div>

              <div>
                <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                  플레이 스타일
                </label>
                <select
                  value={playStyle}
                  onChange={(e) => setPlayStyle(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm sm:text-base"
                >
                  <option value="">선택 안 함</option>
                  <option value="싱글플레이어">싱글플레이어</option>
                  <option value="멀티플레이어">멀티플레이어</option>
                  <option value="협동">협동</option>
                  <option value="경쟁">경쟁</option>
                  <option value="캐주얼">캐주얼</option>
                  <option value="하드코어">하드코어</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r-lg">
                <p className="font-medium text-sm sm:text-base">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  AI가 게임을 추천하고 있습니다...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  게임 추천 받기
                </span>
              )}
            </button>
          </form>
        </div>

        {recommendations.length > 0 && (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              추천 게임
            </h2>
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start justify-between gap-4 mb-3 sm:mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold text-sm sm:text-base flex-shrink-0">
                        {index + 1}
                      </div>
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                        {rec.gameName}
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 mb-3">
                      <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                        {rec.platform}
                      </span>
                      <span className="px-2 sm:px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                        {rec.genre}
                      </span>
                      {rec.rating > 0 && (
                        <span className="px-2 sm:px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full font-medium flex items-center gap-1">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                          {rec.rating.toFixed(1)}/10
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                      {rec.reason}
                    </p>
                  </div>
                </div>
                {session && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Link
                      href={`/posts/new?category=game-recommend&gameName=${encodeURIComponent(rec.gameName)}&platform=${encodeURIComponent(rec.platform)}&genre=${encodeURIComponent(rec.genre)}`}
                      className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm sm:text-base transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      이 게임 추천 글 작성하기
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!session && recommendations.length > 0 && (
          <div className="mt-6 bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl border border-primary-100 p-4 sm:p-6 text-center">
            <p className="text-gray-700 mb-3 font-medium text-sm sm:text-base">
              추천받은 게임에 대한 글을 작성하고 싶으신가요?
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold transition-colors text-sm sm:text-base"
            >
              로그인하기
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

