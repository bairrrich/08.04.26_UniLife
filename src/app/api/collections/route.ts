import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const USER_ID = 'user_demo_001'

const VALID_TYPES = ['BOOK', 'MOVIE', 'RECIPE', 'SUPPLEMENT', 'PRODUCT']
const VALID_STATUSES = ['WANT', 'IN_PROGRESS', 'COMPLETED']

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const status = searchParams.get('status')

    const where: Record<string, unknown> = { userId: USER_ID }

    if (type && VALID_TYPES.includes(type)) {
      where.type = type
    }

    if (status && VALID_STATUSES.includes(status)) {
      where.status = status
    }

    const items = await db.collectionItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: items })
  } catch (error) {
    console.error('Collections GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch collection items' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      type,
      title,
      author,
      description,
      coverUrl,
      rating,
      status,
      date,
      tags,
      notes,
    } = body

    if (!type || !title) {
      return NextResponse.json(
        { success: false, error: 'type and title are required' },
        { status: 400 }
      )
    }

    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json(
        {
          success: false,
          error: `type must be one of: ${VALID_TYPES.join(', ')}`,
        },
        { status: 400 }
      )
    }

    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: `status must be one of: ${VALID_STATUSES.join(', ')}`,
        },
        { status: 400 }
      )
    }

    if (rating !== undefined && rating !== null) {
      const r = Number(rating)
      if (!Number.isInteger(r) || r < 1 || r > 5) {
        return NextResponse.json(
          { success: false, error: 'rating must be an integer between 1 and 5' },
          { status: 400 }
        )
      }
    }

    const item = await db.collectionItem.create({
      data: {
        userId: USER_ID,
        type,
        title,
        author: author ?? null,
        description: description ?? null,
        coverUrl: coverUrl ?? null,
        rating: rating ?? null,
        status: status ?? 'WANT',
        date: date ? new Date(date) : null,
        tags: tags ? JSON.stringify(tags) : '[]',
        notes: notes ?? null,
      },
    })

    return NextResponse.json({ success: true, data: item }, { status: 201 })
  } catch (error) {
    console.error('Collections POST error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create collection item' },
      { status: 500 }
    )
  }
}
