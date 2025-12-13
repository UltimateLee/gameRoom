'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface DeletePostButtonProps {
  postId: string
}

export default function DeletePostButton({ postId }: DeletePostButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = async () => {
    if (!confirm('정말 이 게시글을 삭제하시겠습니까?')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/posts/${postId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.error || '게시글 삭제에 실패했습니다.')
      }
    } catch (err) {
      alert('오류가 발생했습니다.')
    } finally {
      setLoading(false)
      setShowConfirm(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-red-600 hover:text-red-700 text-sm disabled:opacity-50"
    >
      {loading ? '삭제 중...' : '삭제'}
    </button>
  )
}

