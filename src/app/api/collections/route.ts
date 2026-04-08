import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { parseBody, DEMO_USER_ID, collectionTypeSchema } from '@/lib/api'

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

const createCollectionSchema = z.object({
  type: collectionTypeSchema,
  title: z.string().min(1, 'Название обязательно'),
  author: z.string().optional(),
  description: z.string().optional(),
  coverUrl: z.string().optional(),
  rating: z.number().int().min(1).max(5).optional().nullable(),
  date: z.string().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
  details: z.record(z.string(), z.unknown()).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    const where: Record<string, unknown> = { userId: DEMO_USER_ID }

    if (type) {
      where.type = type
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
    const data = await parseBody(request, createCollectionSchema)
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

    const item = await db.collectionItem.create({
      data: {
        userId: DEMO_USER_ID,
        type,
        title,
        author: author ?? null,
        description: description ?? null,
        coverUrl: coverUrl ?? null,
        rating: rating ?? null,
        date: date ? new Date(date) : null,
        tags: tags ? JSON.stringify(tags) : '[]',
        notes: notes ?? null,
        details: details && Object.keys(details).length > 0 ? JSON.stringify(details) : '{}',
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
