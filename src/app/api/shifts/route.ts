import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { DEMO_USER_ID, parseBody, apiSuccess, apiError, apiServerError } from "@/lib/api";

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

const createShiftSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Формат даты: YYYY-MM-DD"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Формат времени: HH:mm"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Формат времени: HH:mm"),
  breakMin: z.number().int().min(0).optional().default(0),
  location: z.string().optional(),
  note: z.string().optional(),
  payRate: z.number().min(0).optional(),
  tips: z.number().min(0).optional(),
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Calculate shift working hours from startTime/endTime/breakMin.
 * Handles night shifts where endTime <= startTime (e.g. 22:00–06:00).
 */
function calcShiftHours(startTime: string, endTime: string, breakMin: number): number {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  let startMinutes = sh * 60 + sm;
  let endMinutes = eh * 60 + em;

  // Night shift: end time is next day
  if (endMinutes <= startMinutes) {
    endMinutes += 24 * 60;
  }

  const totalMinutes = endMinutes - startMinutes - breakMin;
  return Math.max(0, totalMinutes / 60);
}

/**
 * Calculate aggregate stats from a list of shifts.
 * Only completed shifts count toward totals.
 */
function calcStats(shifts: {
  startTime: string;
  endTime: string;
  breakMin: number;
  status: string;
  payRate: number | null;
  tips: number | null;
}[]) {
  let totalHours = 0;
  let totalEarnings = 0;
  let completedCount = 0;
  let scheduledCount = 0;

  for (const s of shifts) {
    if (s.status === "completed") {
      const hours = calcShiftHours(s.startTime, s.endTime, s.breakMin);
      totalHours += hours;
      totalEarnings += hours * (s.payRate ?? 0) + (s.tips ?? 0);
      completedCount++;
    }
    if (s.status === "scheduled") {
      scheduledCount++;
    }
  }

  return {
    totalHours: Math.round(totalHours * 100) / 100,
    totalEarnings: Math.round(totalEarnings * 100) / 100,
    completedCount,
    scheduledCount,
  };
}

function serializeShift(s: {
  id: string;
  userId: string;
  date: Date;
  startTime: string;
  endTime: string;
  breakMin: number;
  location: string | null;
  note: string | null;
  status: string;
  payRate: number | null;
  tips: number | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: s.id,
    userId: s.userId,
    date: s.date.toISOString(),
    startTime: s.startTime,
    endTime: s.endTime,
    breakMin: s.breakMin,
    location: s.location,
    note: s.note,
    status: s.status,
    payRate: s.payRate,
    tips: s.tips,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}

// ─── GET /api/shifts ─────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month"); // YYYY-MM
    const weekFrom = searchParams.get("weekFrom"); // ISO date
    const weekTo = searchParams.get("weekTo"); // ISO date
    const date = searchParams.get("date"); // YYYY-MM-DD
    const status = searchParams.get("status");

    const where: Record<string, unknown> = { userId: DEMO_USER_ID };

    // Month filter
    if (month) {
      const [yearStr, monthStr] = month.split("-");
      const year = parseInt(yearStr, 10);
      const monthIndex = parseInt(monthStr, 10) - 1;

      if (isNaN(year) || isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) {
        return apiError("Invalid month format. Use YYYY-MM.");
      }

      const startDate = new Date(Date.UTC(year, monthIndex, 1, 0, 0, 0, 0));
      const endDate = new Date(Date.UTC(year, monthIndex + 1, 0, 23, 59, 59, 999));
      where.date = { gte: startDate, lte: endDate };
    }
    // Week range filter
    else if (weekFrom || weekTo) {
      const dateFilter: Record<string, Date> = {};

      if (weekFrom) {
        const fromDate = new Date(weekFrom);
        if (isNaN(fromDate.getTime())) {
          return apiError("Invalid weekFrom date. Use ISO format.");
        }
        dateFilter.gte = fromDate;
      }

      if (weekTo) {
        const toDate = new Date(weekTo);
        if (isNaN(toDate.getTime())) {
          return apiError("Invalid weekTo date. Use ISO format.");
        }
        if (toDate.getHours() === 0 && toDate.getMinutes() === 0) {
          toDate.setHours(23, 59, 59, 999);
        }
        dateFilter.lte = toDate;
      }

      where.date = dateFilter;
    }
    // Specific date filter
    else if (date) {
      const startDate = new Date(`${date}T00:00:00.000Z`);
      const endDate = new Date(`${date}T23:59:59.999Z`);
      if (isNaN(startDate.getTime())) {
        return apiError("Invalid date format. Use YYYY-MM-DD.");
      }
      where.date = { gte: startDate, lte: endDate };
    }

    // Status filter
    if (status) {
      where.status = status;
    }

    const shifts = await db.shift.findMany({
      where,
      orderBy: { date: "asc" },
    });

    const stats = calcStats(shifts);
    const data = shifts.map(serializeShift);

    return NextResponse.json({ success: true, data, stats });
  } catch (error) {
    console.error("[GET /api/shifts] Error:", error);
    return apiServerError("Failed to fetch shifts.");
  }
}

// ─── POST /api/shifts ────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const data = await parseBody(request, createShiftSchema);
    if (!data) return;

    const { date, startTime, endTime, breakMin, location, note, payRate, tips } = data;

    const shiftDate = new Date(`${date}T10:00:00.000Z`);

    const shift = await db.shift.create({
      data: {
        userId: DEMO_USER_ID,
        date: shiftDate,
        startTime,
        endTime,
        breakMin: breakMin ?? 0,
        location: location?.trim() || null,
        note: note?.trim() || null,
        payRate: payRate ?? null,
        tips: tips ?? null,
        status: "scheduled",
      },
    });

    return NextResponse.json({ success: true, data: serializeShift(shift) }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/shifts] Error:", error);
    return apiServerError("Failed to create shift.");
  }
}
