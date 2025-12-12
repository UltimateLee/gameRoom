import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
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
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const post = await prisma.post.findUnique({
      where: { id: resolvedParams.id },
    })

    if (!post) {
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId: resolvedParams.id,
          userId: user.id,
        },
      },
    })

    if (existingLike) {
      // 좋아요 취소
      await prisma.like.delete({
        where: { id: existingLike.id },
      })

      await prisma.post.update({
        where: { id: resolvedParams.id },
        data: { likeCount: { decrement: 1 } },
      })

      return NextResponse.json({ liked: false })
    } else {
      // 좋아요 추가
      await prisma.like.create({
        data: {
          postId: resolvedParams.id,
          userId: user.id,
        },
      })

      await prisma.post.update({
        where: { id: resolvedParams.id },
        data: { likeCount: { increment: 1 } },
      })

      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    return NextResponse.json(
      { error: '좋아요 처리에 실패했습니다.' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const resolvedParams = await Promise.resolve(params)

    if (!session?.user?.email) {
      return NextResponse.json({ liked: false })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ liked: false })
    }

    const like = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId: resolvedParams.id,
          userId: user.id,
        },
      },
    })

    return NextResponse.json({ liked: !!like })
  } catch (error) {
    return NextResponse.json({ liked: false })
  }
}

