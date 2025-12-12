import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
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

    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        postId_userId: {
          postId: resolvedParams.id,
          userId: user.id,
        },
      },
    })

    if (existingBookmark) {
      // 북마크 취소
      await prisma.bookmark.delete({
        where: { id: existingBookmark.id },
      })

      return NextResponse.json({ bookmarked: false })
    } else {
      // 북마크 추가
      await prisma.bookmark.create({
        data: {
          postId: resolvedParams.id,
          userId: user.id,
        },
      })

      return NextResponse.json({ bookmarked: true })
    }
  } catch (error) {
    return NextResponse.json(
      { error: '북마크 처리에 실패했습니다.' },
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
      return NextResponse.json({ bookmarked: false })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ bookmarked: false })
    }

    const bookmark = await prisma.bookmark.findUnique({
      where: {
        postId_userId: {
          postId: resolvedParams.id,
          userId: user.id,
        },
      },
    })

    return NextResponse.json({ bookmarked: !!bookmark })
  } catch (error) {
    return NextResponse.json({ bookmarked: false })
  }
}

