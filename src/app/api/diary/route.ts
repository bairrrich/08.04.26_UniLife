import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// ─── Types ───────────────────────────────────────────────────────────────────

interface DiaryEntryRow {
  id: string;
  userId: string;
  date: Date;
  title: string | null;
  content: string;
  mood: number | null;
  photos: string; // JSON string
  tags: string; // JSON string
  createdAt: Date;
  updatedAt: Date;
}

interface DiaryEntryJSON {
  id: string;
  userId: string;
  date: string;
  title: string | null;
  content: string;
  mood: number | null;
  photos: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function safeParseJSON<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
}

function serializeEntry(row: DiaryEntryRow): DiaryEntryJSON {
  return {
    id: row.id,
    userId: row.userId,
    date: row.date.toISOString(),
    title: row.title,
    content: row.content,
    mood: row.mood,
    photos: safeParseJSON<string[]>(row.photos, []),
    tags: safeParseJSON<string[]>(row.tags, []),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

const DEMO_USER_ID = "user_demo_001";

// ─── GET /api/diary ──────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month"); // "YYYY-MM"
    const from = searchParams.get("from"); // ISO date string
    const to = searchParams.get("to"); // ISO date string

    // Build the `where` clause incrementally
    const where: Record<string, unknown> = { userId: DEMO_USER_ID };

    if (month) {
      // Parse YYYY-MM into start and end of that month
      const [yearStr, monthStr] = month.split("-");
      const year = parseInt(yearStr, 10);
      const monthIndex = parseInt(monthStr, 10) - 1; // 0-based

      if (isNaN(year) || isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) {
        return NextResponse.json(
          { error: "Invalid month format. Use YYYY-MM." },
          { status: 400 }
        );
      }

      const startDate = new Date(Date.UTC(year, monthIndex, 1, 0, 0, 0, 0));
      const endDate = new Date(Date.UTC(year, monthIndex + 1, 0, 23, 59, 59, 999));

      where.date = { gte: startDate, lte: endDate };
    } else if (from || to) {
      // Date range filter
      const dateFilter: Record<string, Date> = {};

      if (from) {
        const fromDate = new Date(from);
        if (isNaN(fromDate.getTime())) {
          return NextResponse.json(
            { error: "Invalid 'from' date. Use ISO 8601 format." },
            { status: 400 }
          );
        }
        dateFilter.gte = fromDate;
      }

      if (to) {
        const toDate = new Date(to);
        if (isNaN(toDate.getTime())) {
          return NextResponse.json(
            { error: "Invalid 'to' date. Use ISO 8601 format." },
            { status: 400 }
          );
        }
        // Set end-of-day for the "to" date if no time component
        if (toDate.getHours() === 0 && toDate.getMinutes() === 0) {
          toDate.setHours(23, 59, 59, 999);
        }
        dateFilter.lte = toDate;
      }

      where.date = dateFilter;
    }

    const entries = await db.diaryEntry.findMany({
      where,
      orderBy: { date: "desc" },
    });

    const serialized = entries.map(serializeEntry);

    return NextResponse.json({ data: serialized });
  } catch (error) {
    console.error("[GET /api/diary] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch diary entries." },
      { status: 500 }
    );
  }
}

// ─── POST /api/diary ─────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { title, content, mood, date, tags, photos } = body as {
      title?: string;
      content?: string;
      mood?: number;
      date?: string;
      tags?: string[];
      photos?: string[];
    };

    // Validate required fields
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Содержание записи обязательно и должно быть непустой строкой" },
        { status: 400 }
      );
    }

    // Validate mood if provided (must be 1-5)
    if (mood !== undefined) {
      if (typeof mood !== "number" || !Number.isInteger(mood) || mood < 1 || mood > 5) {
        return NextResponse.json(
          { success: false, error: "Настроение должно быть целым числом от 1 до 5" },
          { status: 400 }
        );
      }
    }

    // Validate date if provided
    let entryDate: Date;
    if (date) {
      entryDate = new Date(date);
      if (isNaN(entryDate.getTime())) {
        return NextResponse.json(
          { success: false, error: "Неверный формат даты. Используйте ISO 8601" },
          { status: 400 }
        );
      }
    } else {
      entryDate = new Date();
    }

    // Validate and sanitize tags
    const safeTags = Array.isArray(tags)
      ? tags.filter((t) => typeof t === "string")
      : [];

    // Validate and sanitize photos
    const safePhotos = Array.isArray(photos)
      ? photos.filter((p) => typeof p === "string")
      : [];

    const entry = await db.diaryEntry.create({
      data: {
        userId: DEMO_USER_ID,
        date: entryDate,
        title: typeof title === "string" ? title.trim() : null,
        content: content.trim(),
        mood: mood ?? null,
        photos: JSON.stringify(safePhotos),
        tags: JSON.stringify(safeTags),
      },
    });

    return NextResponse.json({ data: serializeEntry(entry) }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/diary] Error:", error);
    return NextResponse.json(
      { error: "Failed to create diary entry." },
      { status: 500 }
    );
  }
}
