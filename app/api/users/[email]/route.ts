import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateUserSchema = z.object({
  name: z.string().min(1).max(50).nullable().optional(),
  image: z.union([z.string().url(), z.string().startsWith('/')]).nullable().optional(),
  bio: z.string().max(200).nullable().optional(),
})

export async function GET(
  request: Request,
  { params }: { params: Promise<{ email: string }> | { email: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const userEmail = decodeURIComponent(resolvedParams.email)

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('사용자 조회 오류:', error)
    return NextResponse.json(
      { error: '사용자 조회에 실패했습니다.' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ email: string }> | { email: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const resolvedParams = await Promise.resolve(params)
    const userEmail = decodeURIComponent(resolvedParams.email)

    // 본인만 수정 가능
    if (session.user.email !== userEmail) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, image, bio } = updateUserSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    })

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const updatedUser = await prisma.user.update({
      where: { email: userEmail },
      data: {
        ...(name !== undefined && { name }),
        ...(image !== undefined && { image }),
        ...(bio !== undefined && { bio }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '입력값이 올바르지 않습니다.', details: error.errors },
        { status: 400 }
      )
    }

    console.error('프로필 업데이트 오류:', error)
    return NextResponse.json(
      { error: '프로필 업데이트에 실패했습니다.' },
      { status: 500 }
    )
  }
}

