import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await requireAdmin()
    const resolvedParams = await Promise.resolve(params)

    // 자신의 권한을 변경할 수 없도록 방지
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (currentUser?.id === resolvedParams.id) {
      return NextResponse.json(
        { error: '자신의 권한은 변경할 수 없습니다.' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: resolvedParams.id },
    })

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const updatedUser = await prisma.user.update({
      where: { id: resolvedParams.id },
      data: {
        isAdmin: !user.isAdmin,
      },
    })

    return NextResponse.json({ 
      success: true,
      isAdmin: updatedUser.isAdmin 
    })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: '권한 변경에 실패했습니다.' },
      { status: 500 }
    )
  }
}

