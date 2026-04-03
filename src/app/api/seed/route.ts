import { NextResponse } from 'next/server'
import { seed, seedHabits } from '@/lib/seed'

export async function POST() {
  try {
    await seed()
    await seedHabits()
    return NextResponse.json({ success: true, message: 'Database seeded successfully' })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
