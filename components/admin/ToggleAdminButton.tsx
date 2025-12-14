'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ToggleAdminButtonProps {
  userId: string
  isAdmin: boolean
}

export default function ToggleAdminButton({ userId, isAdmin }: ToggleAdminButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    if (!confirm(`정말 이 사용자의 관리자 권한을 ${isAdmin ? '제거' : '부여'}하시겠습니까?`)) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}/toggle-admin`, {
        method: 'PUT',
      })

      if (response.ok) {
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.error || '권한 변경에 실패했습니다.')
      }
    } catch (err) {
      alert('오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`text-sm px-2 py-1 rounded ${
        isAdmin
          ? 'text-red-600 hover:bg-red-50'
          : 'text-blue-600 hover:bg-blue-50'
      } disabled:opacity-50`}
    >
      {loading ? '처리 중...' : isAdmin ? '관리자 해제' : '관리자 지정'}
    </button>
  )
}



