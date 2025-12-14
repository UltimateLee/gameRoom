/**
 * 어드민 계정 설정 스크립트
 * 
 * 사용법:
 *   node scripts/setup-admin.js
 * 
 * 또는:
 *   npx tsx scripts/setup-admin.js
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

const ADMIN_EMAIL = 'admin@game.com'
const ADMIN_PASSWORD = 'admin123'

async function setupAdmin() {
  try {
    console.log('어드민 계정 설정을 시작합니다...')

    // 기존 계정 확인
    const existingAdmin = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL },
    })

    if (existingAdmin) {
      // isAdmin 필드가 있는지 확인
      if ('isAdmin' in existingAdmin) {
        if (existingAdmin.isAdmin) {
          console.log('✅ 어드민 계정이 이미 존재합니다.')
          console.log(`   이메일: ${ADMIN_EMAIL}`)
          return
        } else {
          // 어드민 권한 부여
          await prisma.user.update({
            where: { email: ADMIN_EMAIL },
            data: { isAdmin: true },
          })
          console.log('✅ 기존 계정에 어드민 권한이 부여되었습니다.')
          console.log(`   이메일: ${ADMIN_EMAIL}`)
          return
        }
      } else {
        console.log('⚠️  isAdmin 필드가 데이터베이스에 없습니다.')
        console.log('⚠️  먼저 마이그레이션을 실행해주세요:')
        console.log('   npx prisma migrate dev --name add_admin_field')
        console.log('   또는: npx prisma db push')
        return
      }
    }

    // 새 계정 생성
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10)
    
    const userData = {
      email: ADMIN_EMAIL,
      password: hashedPassword,
      name: '관리자',
    }

    // isAdmin 필드가 있는지 확인
    try {
      const testUser = await prisma.user.findFirst()
      if (testUser && 'isAdmin' in testUser) {
        userData.isAdmin = true
      }
    } catch (e) {
      // isAdmin 필드가 없으면 일반 사용자로 생성
      console.log('⚠️  isAdmin 필드가 없어 일반 사용자로 생성됩니다.')
      console.log('⚠️  마이그레이션 후 데이터베이스에서 수동으로 isAdmin을 true로 설정해주세요.')
    }

    await prisma.user.create({
      data: userData,
    })

    console.log('✅ 어드민 계정이 생성되었습니다!')
    console.log(`   이메일: ${ADMIN_EMAIL}`)
    console.log(`   비밀번호: ${ADMIN_PASSWORD}`)
    
    if (!userData.isAdmin) {
      console.log('\n⚠️  주의: isAdmin 필드가 없어 일반 사용자로 생성되었습니다.')
      console.log('⚠️  마이그레이션 후 다음 SQL을 실행하세요:')
      console.log(`   UPDATE "User" SET "isAdmin" = true WHERE email = '${ADMIN_EMAIL}';`)
    }
  } catch (error) {
    console.error('❌ 어드민 계정 설정 실패:', error.message)
    
    if (error.message.includes('isAdmin') || error.code === 'P2022') {
      console.error('\n⚠️  데이터베이스에 isAdmin 컬럼이 없습니다.')
      console.error('⚠️  먼저 마이그레이션을 실행해주세요:')
      console.error('   npx prisma migrate dev --name add_admin_field')
      console.error('   또는: npx prisma db push')
    }
    
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

setupAdmin()



