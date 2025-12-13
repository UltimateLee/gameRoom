import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

const ADMIN_EMAIL = 'admin@game.com'
const ADMIN_PASSWORD = 'admin123'

export async function ensureAdminExists() {
  try {
    // 기존 어드민 계정 확인
    const existingAdmin = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL },
    })

    if (existingAdmin) {
      // 이미 존재하면 어드민 권한만 확인하고 업데이트
      if (!existingAdmin.isAdmin) {
        await prisma.user.update({
          where: { email: ADMIN_EMAIL },
          data: { isAdmin: true },
        })
      }
      return { created: false, exists: true }
    }

    // 어드민 계정이 없으면 생성
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10)

    await prisma.user.create({
      data: {
        email: ADMIN_EMAIL,
        password: hashedPassword,
        name: '관리자',
        isAdmin: true,
      },
    })

    return { created: true, exists: false }
  } catch (error) {
    console.error('어드민 계정 생성 실패:', error)
    return { created: false, exists: false, error }
  }
}

