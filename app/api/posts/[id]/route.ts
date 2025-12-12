import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const postSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  contentBlocks: z.string().optional(), // JSON string
  category: z.enum(['general', 'game-recommend']).optional(),
  images: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  gameInfo: z.object({
    gameName: z.string().optional(),
    platform: z.string().optional(),
    genre: z.string().optional(),
    rating: z.number().optional(),
  }).optional(),
})

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const post = await prisma.post.findUnique({
      where: { id: resolvedParams.id },
        include: {
          author: {
            select: {
              name: true,
              email: true,
            },
          },
          comments: {
            include: {
              author: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
    })

    if (!post) {
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json(post)
  } catch (error) {
    return NextResponse.json(
      { error: '게시글을 불러올 수 없습니다.' },
      { status: 500 }
    )
  }
}

export async function PUT(
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
    const post = await prisma.post.findUnique({
      where: { id: resolvedParams.id },
      include: {
        author: true,
      },
    })

    if (!post) {
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (post.author.email !== session.user.email) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, content, contentBlocks, category, images, tags, gameInfo } = postSchema.parse(body)

    const updatedPost = await prisma.post.update({
      where: { id: resolvedParams.id },
      data: {
        title,
        content,
        contentBlocks: contentBlocks || undefined,
        category: category || 'general',
        images: images ? JSON.stringify(images) : undefined,
        tags: tags ? JSON.stringify(tags) : undefined,
        gameInfo: gameInfo ? JSON.stringify(gameInfo) : undefined,
      },
    })

    return NextResponse.json(updatedPost)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '입력값이 올바르지 않습니다.' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: '게시글 수정에 실패했습니다.' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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
    const post = await prisma.post.findUnique({
      where: { id: resolvedParams.id },
      include: {
        author: true,
      },
    })

    if (!post) {
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (post.author.email !== session.user.email) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      )
    }

    await prisma.post.delete({
      where: { id: resolvedParams.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: '게시글 삭제에 실패했습니다.' },
      { status: 500 }
    )
  }
}

