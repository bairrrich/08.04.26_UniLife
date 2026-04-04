import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const USER_ID = 'user_demo_001'

const VALID_TYPES = ['BOOK', 'MOVIE', 'RECIPE', 'SUPPLEMENT', 'PRODUCT']
const VALID_STATUSES = ['WANT', 'IN_PROGRESS', 'COMPLETED']

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verify the item belongs to the user
    const existing = await db.collectionItem.findUnique({
      where: { id },
    })

    if (!existing || existing.userId !== USER_ID) {
      return NextResponse.json(
        { success: false, error: 'Collection item not found' },
        { status: 404 }
      )
    }

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

    if (type && !VALID_TYPES.includes(type)) {
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

    const item = await db.collectionItem.update({
      where: { id },
      data: {
        ...(type && { type }),
        ...(title && { title }),
        ...(author !== undefined && { author: author ?? null }),
        ...(description !== undefined && { description: description ?? null }),
        ...(coverUrl !== undefined && { coverUrl: coverUrl ?? null }),
        ...(rating !== undefined && { rating: rating ?? null }),
        ...(status && { status }),
        ...(date !== undefined && { date: date ? new Date(date) : null }),
        ...(tags !== undefined && { tags: tags ? JSON.stringify(tags) : '[]' }),
        ...(notes !== undefined && { notes: notes ?? null }),
      },
    })

    return NextResponse.json({ success: true, data: item })
  } catch (error) {
    console.error('Collections PUT error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update collection item' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verify the item belongs to the user
    const existing = await db.collectionItem.findUnique({
      where: { id },
    })

    if (!existing || existing.userId !== USER_ID) {
      return NextResponse.json(
        { success: false, error: 'Collection item not found' },
        { status: 404 }
      )
    }

    await db.collectionItem.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: 'Collection item deleted' })
  } catch (error) {
    console.error('Collections DELETE error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete collection item' },
      { status: 500 }
    )
  }
}
