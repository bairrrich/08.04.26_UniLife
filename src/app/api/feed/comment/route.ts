import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const USER_ID = 'user_demo_001'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { postId, content } = body

    if (!postId || !content || !content.trim()) {
      return NextResponse.json(
        { success: false, error: 'postId and content are required' },
        { status: 400 }
      )
    }

    if (content.trim().length > 300) {
      return NextResponse.json(
        { success: false, error: 'Comment must be 300 characters or less' },
        { status: 400 }
      )
    }

    // Verify the post exists
    const post = await db.post.findUnique({
      where: { id: postId },
    })

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      )
    }

    const comment = await db.comment.create({
      data: {
        postId,
        userId: USER_ID,
        content: content.trim(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    })

    return NextResponse.json({ success: true, data: comment }, { status: 201 })
  } catch (error) {
    console.error('Comment POST error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}
