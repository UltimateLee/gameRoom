'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface DeleteUserButtonProps {
  userId: string
  email: string
}

export default function DeleteUserButton({ userId, email }: DeleteUserButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`정말 ${email} 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.error || '사용자 삭제에 실패했습니다.')
      }
    } catch (err) {
      alert('오류가 발생했습니다.')
    } finally {
      setLoading(false)
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


