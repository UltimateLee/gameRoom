'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'

export default function EditProfilePage() {
  const router = useRouter()
  const params = useParams()
  const { data: session, status } = useSession()
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [image, setImage] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const userEmail = params?.email ? decodeURIComponent(params.email as string) : ''

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch(`/api/users/${encodeURIComponent(userEmail)}`)
      if (response.ok) {
        const user = await response.json()
        setName(user.name || '')
        setBio(user.bio || '')
        setImage(user.image || null)
        setImagePreview(user.image || null)
      }
    } catch (err) {
      setError('프로필을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }, [userEmail])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated' && session?.user?.email !== userEmail) {
      router.push(`/users/${encodeURIComponent(session.user.email || '')}`)
      return
    }

    if (status === 'authenticated' && userEmail) {
      fetchProfile()
    }
  }, [status, session, userEmail, router, fetchProfile])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드 가능합니다.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('이미지 크기는 5MB 이하여야 합니다.')
      return
    }

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('files', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '이미지 업로드에 실패했습니다.')
      }

      if (data.urls && data.urls.length > 0) {
        const imageUrl = data.urls[0]
        setImage(imageUrl)
        setImagePreview(imageUrl)
      }
    } catch (err: any) {
      setError(err.message || '이미지 업로드에 실패했습니다.')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setImage(null)
    setImagePreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const response = await fetch(`/api/users/${encodeURIComponent(userEmail)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name?.trim() || null,
          bio: bio?.trim() || null,
          image: image || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '프로필 업데이트에 실패했습니다.')
      }

      router.push(`/users/${encodeURIComponent(userEmail)}`)
      router.refresh()
    } catch (err: any) {
      setError(err.message || '프로필 업데이트에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!session || session.user?.email !== userEmail) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12 max-w-2xl">
        <div className="mb-4 sm:mb-6">
          <Link
            href={`/users/${encodeURIComponent(userEmail)}`}
            className="inline-flex items-center gap-1.5 sm:gap-2 text-gray-600 hover:text-primary-600 transition-colors text-sm sm:text-base"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            프로필로 돌아가기
          </Link>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 md:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">프로필 편집</h1>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* 프로필 이미지 */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                프로필 이미지
              </label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                <div className="relative flex-shrink-0">
                  {imagePreview ? (
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-gray-200">
                      <Image
                        src={imagePreview}
                        alt="프로필 이미지"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xl sm:text-2xl font-bold border-2 border-gray-200">
                      {(name || userEmail)[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 w-full sm:w-auto">
                  <label className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors cursor-pointer text-xs sm:text-sm">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {uploading ? '업로드 중...' : '이미지 업로드'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs sm:text-sm"
                    >
                      이미지 제거
                    </button>
                  )}
                </div>
              </div>
              <p className="mt-2 text-xs sm:text-sm text-gray-500">
                이미지를 업로드하지 않으면 이니셜 아이콘이 표시됩니다.
              </p>
            </div>

            {/* 닉네임 */}
            <div>
              <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                닉네임
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={50}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base"
                placeholder="닉네임을 입력하세요"
              />
              <p className="mt-1 text-xs sm:text-sm text-gray-500">
                {name.length}/50
              </p>
            </div>

            {/* 자기소개 */}
            <div>
              <label htmlFor="bio" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                자기소개
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={200}
                rows={4}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none text-sm sm:text-base"
                placeholder="자기소개를 입력하세요"
              />
              <p className="mt-1 text-xs sm:text-sm text-gray-500">
                {bio.length}/200
              </p>
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs sm:text-sm">
                {error}
              </div>
            )}

            {/* 버튼 */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="hidden sm:inline">저장 중...</span>
                    <span className="sm:hidden">저장 중</span>
                  </span>
                ) : (
                  '저장하기'
                )}
              </button>
              <Link
                href={`/users/${encodeURIComponent(userEmail)}`}
                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-center text-sm sm:text-base"
              >
                취소
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

