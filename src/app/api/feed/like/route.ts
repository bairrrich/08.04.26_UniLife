import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const USER_ID = 'user_demo_001'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { postId } = body

    if (!postId) {
      return NextResponse.json(
        { success: false, error: 'postId is required' },
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

    // Check if a like already exists
    const existingLike = await db.like.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: USER_ID,
        },
      },
    })

    let liked: boolean

    if (existingLike) {
      // Unlike: delete the like
      await db.like.delete({
        where: { id: existingLike.id },
      })
      liked = false
    } else {
      // Like: create a new like
      await db.like.create({
        data: {
          postId,
          userId: USER_ID,
        },
      })
      liked = true
    }

    // Get updated like count
    const likeCount = await db.like.count({
      where: { postId },
    })

    return NextResponse.json({ success: true, liked, likeCount })
  } catch (error) {
    console.error('Feed Like POST error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to toggle like' },
      { status: 500 }
    )
  }
}
