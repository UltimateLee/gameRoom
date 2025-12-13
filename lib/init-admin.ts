import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

const ADMIN_EMAIL = 'admin@game.com'
const ADMIN_PASSWORD = 'admin123'

export async function ensureAdminExists() {
  try {
    // 먼저 isAdmin 컬럼이 있는지 확인
    try {
      // 기존 어드민 계정 확인
      const existingAdmin = await prisma.user.findUnique({
        where: { email: ADMIN_EMAIL },
        select: {
          id: true,
          email: true,
          isAdmin: true,
        },
      })

      if (existingAdmin) {
        // 이미 존재하면 어드민 권한만 확인하고 업데이트
        if (existingAdmin.isAdmin === false) {
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
    } catch (dbError: any) {
      // isAdmin 컬럼이 없는 경우 (마이그레이션 미실행)
      if (dbError.code === 'P2022' || dbError.message?.includes('isAdmin')) {
        console.warn('⚠️ isAdmin 컬럼이 데이터베이스에 없습니다. 마이그레이션을 실행해주세요:')
        console.warn('   npx prisma migrate dev --name add_admin_field')
        console.warn('   또는: npx prisma db push')
        
        // isAdmin 없이 계정만 생성 시도
        try {
          const existingAdmin = await prisma.user.findUnique({
            where: { email: ADMIN_EMAIL },
          })

          if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10)
            await prisma.user.create({
              data: {
                email: ADMIN_EMAIL,
                password: hashedPassword,
                name: '관리자',
              },
            })
            console.warn('⚠️ 어드민 계정이 생성되었지만, isAdmin 필드가 없어 일반 사용자로 생성되었습니다.')
            console.warn('⚠️ 마이그레이션 후 데이터베이스에서 수동으로 isAdmin을 true로 설정해주세요.')
            return { created: true, exists: false, needsMigration: true }
          }
        } catch (createError) {
          console.error('어드민 계정 생성 실패:', createError)
          return { created: false, exists: false, error: createError, needsMigration: true }
        }
      }
      throw dbError
    }
  } catch (error) {
    console.error('어드민 계정 생성 실패:', error)
    return { created: false, exists: false, error }
  }
}

