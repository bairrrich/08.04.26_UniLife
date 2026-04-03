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
  photos: string;
  tags: string;
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

// ─── PUT /api/diary/[id] ────────────────────────────────────────────────────

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verify the entry exists and belongs to the user
    const existing = await db.diaryEntry.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== DEMO_USER_ID) {
      return NextResponse.json(
        { error: "Diary entry not found." },
        { status: 404 }
      );
    }

    const body = await request.json();

    const {
      title,
      content,
      mood,
      date,
      tags,
      photos,
    } = body as {
      title?: string;
      content?: string;
      mood?: number;
      date?: string;
      tags?: string[];
      photos?: string[];
    };

    // Validate content if provided
    if (content !== undefined) {
      if (typeof content !== "string" || content.trim().length === 0) {
        return NextResponse.json(
          { error: "Content is required and must be a non-empty string." },
          { status: 400 }
        );
      }
    }

    // Validate mood if provided (must be 1-5)
    if (mood !== undefined) {
      if (typeof mood !== "number" || !Number.isInteger(mood) || mood < 1 || mood > 5) {
        return NextResponse.json(
          { error: "Mood must be an integer between 1 and 5." },
          { status: 400 }
        );
      }
    }

    // Validate date if provided
    let entryDate: Date | undefined;
    if (date !== undefined) {
      entryDate = new Date(date);
      if (isNaN(entryDate.getTime())) {
        return NextResponse.json(
          { error: "Invalid date format. Use ISO 8601." },
          { status: 400 }
        );
      }
    }

    // Validate and sanitize tags
    const safeTags =
      tags !== undefined
        ? Array.isArray(tags)
          ? tags.filter((t) => typeof t === "string")
          : []
        : undefined;

    // Validate and sanitize photos
    const safePhotos =
      photos !== undefined
        ? Array.isArray(photos)
          ? photos.filter((p) => typeof p === "string")
          : []
        : undefined;

    // Build update data — only include fields that were provided
    const updateData: Record<string, unknown> = {};

    if (title !== undefined) {
      updateData.title = typeof title === "string" ? title.trim() : null;
    }
    if (content !== undefined) {
      updateData.content = content.trim();
    }
    if (mood !== undefined) {
      updateData.mood = mood;
    }
    if (entryDate !== undefined) {
      updateData.date = entryDate;
    }
    if (safeTags !== undefined) {
      updateData.tags = JSON.stringify(safeTags);
    }
    if (safePhotos !== undefined) {
      updateData.photos = JSON.stringify(safePhotos);
    }

    const updated = await db.diaryEntry.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ data: serializeEntry(updated) });
  } catch (error) {
    console.error("[PUT /api/diary/:id] Error:", error);
    return NextResponse.json(
      { error: "Failed to update diary entry." },
      { status: 500 }
    );
  }
}

// ─── DELETE /api/diary/[id] ─────────────────────────────────────────────────

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verify the entry exists and belongs to the user
    const existing = await db.diaryEntry.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== DEMO_USER_ID) {
      return NextResponse.json(
        { error: "Diary entry not found." },
        { status: 404 }
      );
    }

    await db.diaryEntry.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Diary entry deleted." });
  } catch (error) {
    console.error("[DELETE /api/diary/:id] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete diary entry." },
      { status: 500 }
    );
  }
}
