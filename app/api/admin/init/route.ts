import { NextResponse } from 'next/server'
import { ensureAdminExists } from '@/lib/init-admin'

export async function POST() {
  try {
    const result = await ensureAdminExists()
    
    if (result.created) {
      return NextResponse.json({
        success: true,
        message: '어드민 계정이 생성되었습니다.',
        email: 'admin@game.com',
        password: 'admin123',
      })
    } else if (result.exists) {
      return NextResponse.json({
        success: true,
        message: '어드민 계정이 이미 존재합니다.',
        email: 'admin@game.com',
      })
    } else {
      return NextResponse.json(
        { error: '어드민 계정 생성에 실패했습니다.' },
        { status: 500 }
      )
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '어드민 계정 생성에 실패했습니다.' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const result = await ensureAdminExists()
    
    return NextResponse.json({
      success: true,
      created: result.created,
      exists: result.exists,
      email: 'admin@game.com',
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

