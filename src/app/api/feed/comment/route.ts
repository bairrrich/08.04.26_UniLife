import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { DEMO_USER_ID, apiSuccess, apiError, apiServerError } from '@/lib/api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { postId, content } = body

    if (!postId || !content || !content.trim()) {
      return apiError('postId and content are required')
    }

    if (content.trim().length > 300) {
      return apiError('Comment must be 300 characters or less')
    }

    // Verify the post exists
    const post = await db.post.findUnique({
      where: { id: postId },
    })

    if (!post) {
      return apiError('Post not found', 404)
    }

    const comment = await db.comment.create({
      data: {
        postId,
        userId: DEMO_USER_ID,
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

    return apiSuccess(comment, 201)
  } catch (error) {
    console.error('Comment POST error:', error)
    return apiServerError('Failed to create comment')
  }
}
