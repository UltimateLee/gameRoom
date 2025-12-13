import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  adminInitialized?: boolean
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// 어드민 계정 자동 생성 (서버 시작 시 한 번만 실행)
if (!globalForPrisma.adminInitialized && typeof window === 'undefined') {
  globalForPrisma.adminInitialized = true
  
  // 비동기로 실행 (블로킹하지 않음)
  import('./init-admin').then(({ ensureAdminExists }) => {
    ensureAdminExists().catch((error) => {
      console.error('어드민 계정 초기화 실패:', error)
    })
  })
}

