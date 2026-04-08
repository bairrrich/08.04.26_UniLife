import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { apiSuccess, apiError, apiServerError } from '@/lib/api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('postId')

    if (!postId) {
      return apiError('postId query parameter is required')
    }

    const comments = await db.comment.findMany({
      where: { postId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return apiSuccess(comments)
  } catch (error) {
    console.error('Comments GET error:', error)
    return apiServerError('Failed to fetch comments')
  }
}
