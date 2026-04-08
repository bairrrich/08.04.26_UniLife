import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { parseBody, DEMO_USER_ID, safeParseJSON, collectionTypeSchema } from '@/lib/api'

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

const updateCollectionSchema = z.object({
  type: collectionTypeSchema.optional(),
  title: z.string().optional(),
  author: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  coverUrl: z.string().optional().nullable(),
  rating: z.number().int().min(1).max(5).optional().nullable(),
  date: z.string().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional().nullable(),
  details: z.record(z.string(), z.unknown()).optional(),
})

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

    if (!existing || existing.userId !== DEMO_USER_ID) {
      return NextResponse.json(
        { success: false, error: 'Collection item not found' },
        { status: 404 }
      )
    }

    const data = await parseBody(request, updateCollectionSchema)
    if (!data) return

    const {
      type,
      title,
      author,
      description,
      coverUrl,
      rating,
      date,
      tags,
      notes,
      details,
    } = data

    const item = await db.collectionItem.update({
      where: { id },
      data: {
        ...(type && { type }),
        ...(title && { title }),
        ...(author !== undefined && { author: author ?? null }),
        ...(description !== undefined && { description: description ?? null }),
        ...(coverUrl !== undefined && { coverUrl: coverUrl ?? null }),
        ...(rating !== undefined && { rating: rating ?? null }),
        ...(date !== undefined && { date: date ? new Date(date) : null }),
        ...(tags !== undefined && { tags: tags ? JSON.stringify(tags) : '[]' }),
        ...(notes !== undefined && { notes: notes ?? null }),
        ...(details !== undefined && { details: details && Object.keys(details).length > 0 ? JSON.stringify(details) : '{}' }),
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

    if (!existing || existing.userId !== DEMO_USER_ID) {
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
