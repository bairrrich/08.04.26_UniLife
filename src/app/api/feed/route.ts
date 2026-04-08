import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { parseBody, DEMO_USER_ID } from '@/lib/api'

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

const createPostSchema = z.object({
  entityType: z.string().min(1, 'Тип сущности обязателен'),
  entityId: z.string().min(1, 'ID сущности обязателен'),
  caption: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(Math.max(Number(searchParams.get('limit')) || 20, 1), 100)
    const offset = Math.max(Number(searchParams.get('offset')) || 0, 0)

    const posts = await db.post.findMany({
      where: { userId: DEMO_USER_ID },
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
    const data = await parseBody(request, createPostSchema)
    if (!data) return

    const { entityType, entityId, caption, tags } = data

    const post = await db.post.create({
      data: {
        userId: DEMO_USER_ID,
        entityType,
        entityId,
        caption: caption ?? null,
        tags: tags && Array.isArray(tags) ? JSON.stringify(tags) : '[]',
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

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('id')

    if (!postId) {
      return NextResponse.json(
        { success: false, error: 'Post ID is required' },
        { status: 400 }
      )
    }

    // Verify post exists and belongs to the user
    const existingPost = await db.post.findFirst({
      where: { id: postId, userId: DEMO_USER_ID },
    })

    if (!existingPost) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      )
    }

    // Delete the post (cascade will remove likes and comments)
    await db.post.delete({
      where: { id: postId },
    })

    return NextResponse.json({ success: true, message: 'Post deleted' })
  } catch (error) {
    console.error('Feed DELETE error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete post' },
      { status: 500 }
    )
  }
}
