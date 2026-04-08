import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { DEMO_USER_ID, apiError, apiServerError } from '@/lib/api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { postId } = body

    if (!postId) {
      return apiError('postId is required')
    }

    // Verify the post exists
    const post = await db.post.findUnique({
      where: { id: postId },
    })

    if (!post) {
      return apiError('Post not found', 404)
    }

    // Check if a like already exists
    const existingLike = await db.like.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: DEMO_USER_ID,
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
          userId: DEMO_USER_ID,
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
    return apiServerError('Failed to toggle like')
  }
}
