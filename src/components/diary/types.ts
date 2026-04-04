export interface DiaryEntry {
  id: string
  userId: string
  date: string
  title: string | null
  content: string
  mood: number | null
  photos: string[]
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface EntryFormData {
  title: string
  content: string
  mood: number
  date: Date
  tags: string[]
}

export interface CalendarCell {
  day: number
  month: 'prev' | 'current' | 'next'
  date: Date
}
