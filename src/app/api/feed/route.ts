import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const USER_ID = 'user_demo_001'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(Math.max(Number(searchParams.get('limit')) || 20, 1), 100)
    const offset = Math.max(Number(searchParams.get('offset')) || 0, 0)

    const posts = await db.post.findMany({
      where: { userId: USER_ID },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        likes: {
          select: { id: true },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })

    const postsWithCounts = posts.map((post) => ({
      ...post,
      _count: { likes: post.likes.length },
    }))

    return NextResponse.json({ success: true, data: postsWithCounts })
  } catch (error) {
    console.error('Feed GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch feed posts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { entityType, entityId, caption } = body

    if (!entityType || !entityId) {
      return NextResponse.json(
        { success: false, error: 'entityType and entityId are required' },
        { status: 400 }
      )
    }

    const post = await db.post.create({
      data: {
        userId: USER_ID,
        entityType,
        entityId,
        caption: caption ?? null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        likes: {
          select: { id: true },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    const postWithCount = {
      ...post,
      _count: { likes: post.likes.length },
    }

    return NextResponse.json({ success: true, data: postWithCount }, { status: 201 })
  } catch (error) {
    console.error('Feed POST error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create post' },
      { status: 500 }
    )
  }
}
