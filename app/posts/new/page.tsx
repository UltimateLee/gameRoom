'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'

export default function NewPostPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const [title, setTitle] = useState('')
  const [contentBlocks, setContentBlocks] = useState<Array<{ type: 'text' | 'image'; content?: string; url?: string }>>([{ type: 'text', content: '' }])
  const [category, setCategory] = useState(searchParams.get('category') || 'general')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)
  const [gameInfo, setGameInfo] = useState({
    gameName: '',
    platform: '',
    genre: '',
    rating: 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
    const categoryParam = searchParams.get('category')
    if (categoryParam) {
      setCategory(categoryParam)
    }
  }, [status, router, searchParams])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, blockIndex: number) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setUploadingIndex(blockIndex)
    try {
      const formData = new FormData()
      Array.from(files).forEach((file) => {
        formData.append('files', file)
      })

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        // 이미지를 해당 위치에 삽입
        const newBlocks = [...contentBlocks]
        const imageBlocks = data.urls.map((url: string) => ({ type: 'image' as const, url }))
        newBlocks.splice(blockIndex + 1, 0, ...imageBlocks)
        setContentBlocks(newBlocks)
      } else {
        setError(data.error || data.details || '이미지 업로드에 실패했습니다.')
      }
    } catch (err: any) {
      setError(err.message || '이미지 업로드 중 오류가 발생했습니다.')
    } finally {
      setUploading(false)
      setUploadingIndex(null)
      // input 초기화
      e.target.value = ''
    }
  }

  const removeBlock = (index: number) => {
    if (contentBlocks.length === 1 && contentBlocks[0].type === 'text') {
      // 마지막 텍스트 블록은 내용만 초기화
      setContentBlocks([{ type: 'text', content: '' }])
    } else {
      setContentBlocks(contentBlocks.filter((_, i) => i !== index))
    }
  }

  const addTextBlock = (index: number) => {
    const newBlocks = [...contentBlocks]
    newBlocks.splice(index + 1, 0, { type: 'text', content: '' })
    setContentBlocks(newBlocks)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // 텍스트만 추출하여 content 생성 (하위 호환성)
      const textContent = contentBlocks
        .filter(block => block.type === 'text')
        .map(block => block.content)
        .join('\n\n')
        .trim()

      if (!textContent) {
        setError('게시글 내용을 입력해주세요.')
        setLoading(false)
        return
      }

      // 이미지 URL 추출
      const images = contentBlocks
        .filter(block => block.type === 'image' && block.url)
        .map(block => block.url!)

      const postData: any = {
        title,
        content: textContent,
        category,
        contentBlocks: JSON.stringify(contentBlocks),
        images: images.length > 0 ? images : undefined,
        tags: tags.length > 0 ? tags : undefined,
      }

      if (category === 'game-recommend' && gameInfo.gameName) {
        postData.gameInfo = gameInfo
      }

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || '게시글 작성에 실패했습니다.')
      } else {
        router.push(`/posts/${data.id}`)
      }
    } catch (err) {
      setError('오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return <div className="container mx-auto px-4 py-8">로딩 중...</div>
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12 max-w-4xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-1 sm:mb-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            새 게시글 작성
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">게임방에 새로운 이야기를 공유해보세요</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 md:p-8 lg:p-10 space-y-4 sm:space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-r-lg text-sm">
              <p className="font-medium">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="category" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
              게시판
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-gray-50 focus:bg-white text-sm sm:text-base"
            >
              <option value="general">일반 게시판</option>
              <option value="game-recommend">게임 추천</option>
            </select>
        </div>

        <div>
            <label htmlFor="title" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
              제목
          </label>
            <input
              id="title"
              type="text"
            required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-gray-50 focus:bg-white text-sm sm:text-base"
              placeholder={category === 'game-recommend' ? '추천할 게임 제목을 입력하세요' : '게시글 제목을 입력하세요'}
          />
        </div>

          {category === 'game-recommend' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl p-4 sm:p-6 space-y-3 sm:space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-sm sm:text-base">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                게임 정보
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">게임명</label>
                  <input
                    type="text"
                    value={gameInfo.gameName}
                    onChange={(e) => setGameInfo({ ...gameInfo, gameName: e.target.value })}
                    className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-sm sm:text-base"
                    placeholder="게임 이름"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">플랫폼</label>
                  <select
                    value={gameInfo.platform}
                    onChange={(e) => setGameInfo({ ...gameInfo, platform: e.target.value })}
                    className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-sm sm:text-base"
                  >
                    <option value="">선택하세요</option>
                    <option value="PC">PC</option>
                    <option value="PlayStation">PlayStation</option>
                    <option value="Xbox">Xbox</option>
                    <option value="Nintendo Switch">Nintendo Switch</option>
                    <option value="모바일">모바일</option>
                    <option value="기타">기타</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">장르</label>
                  <input
                    type="text"
                    value={gameInfo.genre}
                    onChange={(e) => setGameInfo({ ...gameInfo, genre: e.target.value })}
                    className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-sm sm:text-base"
                    placeholder="예: RPG, FPS, 액션"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">평점 (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={gameInfo.rating || ''}
                    onChange={(e) => setGameInfo({ ...gameInfo, rating: parseInt(e.target.value) || 0 })}
                    className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-sm sm:text-base"
                    placeholder="1-10"
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
              태그 (최대 5개)
            </label>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      const tag = tagInput.trim()
                      if (tag && tags.length < 5 && !tags.includes(tag)) {
                        setTags([...tags, tag])
                        setTagInput('')
                      }
                    }
                  }}
                  className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-sm sm:text-base"
                  placeholder="태그를 입력하고 Enter를 누르세요"
                />
                <button
                  type="button"
                  onClick={() => {
                    const tag = tagInput.trim()
                    if (tag && tags.length < 5 && !tags.includes(tag)) {
                      setTags([...tags, tag])
                      setTagInput('')
                    }
                  }}
                  className="px-3 sm:px-4 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors font-medium text-xs sm:text-sm whitespace-nowrap"
                >
                  추가
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs sm:text-sm font-medium"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => setTags(tags.filter((_, i) => i !== index))}
                        className="hover:text-red-600"
                      >
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
              내용 (텍스트와 이미지를 순서대로 배치할 수 있습니다)
            </label>
            <div className="space-y-3 sm:space-y-4">
              {contentBlocks.map((block, index) => (
                <div key={index} className="border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 bg-gray-50">
                  {block.type === 'text' ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500">텍스트 블록</span>
                        <div className="flex gap-1.5 sm:gap-2">
                          <label className="cursor-pointer inline-flex items-center gap-1 px-2 sm:px-3 py-1 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors text-xs sm:text-sm">
                            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="hidden sm:inline">이미지 추가</span>
                            <span className="sm:hidden">이미지</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, index)}
                              className="hidden"
                              disabled={uploading}
                              multiple
                            />
                          </label>
                          {contentBlocks.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeBlock(index)}
                              className="px-2 sm:px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-xs sm:text-sm"
                            >
                              삭제
                            </button>
                          )}
                        </div>
                      </div>
                      <textarea
                        value={block.content || ''}
                        onChange={(e) => {
                          const newBlocks = [...contentBlocks]
                          newBlocks[index] = { ...newBlocks[index], content: e.target.value }
                          setContentBlocks(newBlocks)
                        }}
                        placeholder="내용을 입력하세요..."
                        rows={5}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white resize-none text-sm sm:text-base"
                      />
                      <button
                        type="button"
                        onClick={() => addTextBlock(index)}
                        className="text-xs sm:text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        + 텍스트 블록 추가
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500">이미지 블록</span>
                        <button
                          type="button"
                          onClick={() => removeBlock(index)}
                          className="px-2 sm:px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-xs sm:text-sm"
                        >
                          삭제
                        </button>
                      </div>
                      {block.url && (
                        <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                          {block.url.startsWith('data:') ? (
                            <img
                              src={block.url}
                              alt={`Image ${index + 1}`}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <Image
                              src={block.url}
                              alt={`Image ${index + 1}`}
                              fill
                              className="object-contain"
                              unoptimized={block.url.startsWith('/uploads/')}
                            />
                          )}
                        </div>
                      )}
                      {uploading && uploadingIndex === index && (
                        <div className="flex items-center justify-center py-8">
                          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 sm:px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg sm:rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="hidden sm:inline">게시 중...</span>
                  <span className="sm:hidden">게시 중</span>
                </span>
              ) : (
                '게시하기'
              )}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 sm:px-6 py-3 bg-gray-100 text-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-200 transition-colors font-medium text-sm sm:text-base"
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

