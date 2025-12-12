import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const tag = searchParams.get('tag') || ''
    const sort = searchParams.get('sort') || 'latest' // latest, popular, likes
    const perPage = 10
    const skip = (page - 1) * perPage

    const where: any = {}
    
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
      ]
    }
    
    if (category) {
      where.category = category
    }

    if (tag) {
      where.tags = { contains: `"${tag}"` }
    }

    let orderBy: any = { createdAt: 'desc' }
    if (sort === 'popular') {
      orderBy = { viewCount: 'desc' }
    } else if (sort === 'likes') {
      orderBy = { likeCount: 'desc' }
    }

    const [posts, totalCount] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: {
            select: {
              name: true,
              email: true,
              image: true,
            },
          },
          comments: true,
        },
        orderBy,
        skip,
        take: perPage,
      }),
      prisma.post.count({ where }),
    ])

    return NextResponse.json({
      posts,
      pagination: {
        page,
        perPage,
        totalCount,
        totalPages: Math.ceil(totalCount / perPage),
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: '게시글을 불러올 수 없습니다.' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, content, contentBlocks, category, images, tags, gameInfo } = postSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        contentBlocks: contentBlocks || null,
        category: category || 'general',
        images: images ? JSON.stringify(images) : null,
        tags: tags ? JSON.stringify(tags) : null,
        gameInfo: gameInfo ? JSON.stringify(gameInfo) : null,
        authorId: user.id,
      },
    })

    return NextResponse.json(post)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '입력값이 올바르지 않습니다.' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: '게시글 작성에 실패했습니다.' },
      { status: 500 }
    )
  }
}

