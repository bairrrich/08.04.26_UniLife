import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DEMO_USER_ID, apiSuccess, apiError, apiServerError } from "@/lib/api";

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

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// ─── GET /api/shifts/stats ──────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month"); // YYYY-MM (required)

    if (!month) {
      return apiError("month parameter is required (YYYY-MM).");
    }

    const [yearStr, monthStr] = month.split("-");
    const year = parseInt(yearStr, 10);
    const monthIndex = parseInt(monthStr, 10) - 1;

    if (isNaN(year) || isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) {
      return apiError("Invalid month format. Use YYYY-MM.");
    }

    const startDate = new Date(Date.UTC(year, monthIndex, 1, 0, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, monthIndex + 1, 0, 23, 59, 59, 999));

    const shifts = await db.shift.findMany({
      where: {
        userId: DEMO_USER_ID,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: "asc" },
    });

    // Count by status
    let completedCount = 0;
    let scheduledCount = 0;
    let cancelledCount = 0;

    // Accumulate totals from completed shifts
    let totalHours = 0;
    let totalEarnings = 0;
    let totalTips = 0;
    const workedDaysSet = new Set<string>();

    // Per-day hours for overtime calculation
    const dailyHoursMap = new Map<string, number>();

    for (const s of shifts) {
      if (s.status === "completed") {
        completedCount++;
        const hours = calcShiftHours(s.startTime, s.endTime, s.breakMin);
        totalHours += hours;
        totalEarnings += hours * (s.payRate ?? 0) + (s.tips ?? 0);
        totalTips += s.tips ?? 0;

        const dayStr = toDateStr(new Date(s.date));
        workedDaysSet.add(dayStr);
        dailyHoursMap.set(dayStr, (dailyHoursMap.get(dayStr) ?? 0) + hours);
      } else if (s.status === "scheduled") {
        scheduledCount++;
      } else if (s.status === "cancelled") {
        cancelledCount++;
      }
    }

    // Calculate overtime (hours beyond 8 per day)
    let overtimeHours = 0;
    for (const [, hours] of dailyHoursMap) {
      if (hours > 8) {
        overtimeHours += hours - 8;
      }
    }

    // Averages based on completed count
    const avgHoursPerShift = completedCount > 0 ? Math.round((totalHours / completedCount) * 100) / 100 : 0;
    const avgEarningsPerShift = completedCount > 0 ? Math.round((totalEarnings / completedCount) * 100) / 100 : 0;

    return NextResponse.json({
      success: true,
      data: {
        totalHours: Math.round(totalHours * 100) / 100,
        totalEarnings: Math.round(totalEarnings * 100) / 100,
        completedCount,
        scheduledCount,
        cancelledCount,
        avgHoursPerShift,
        avgEarningsPerShift,
        totalTips: Math.round(totalTips * 100) / 100,
        workedDays: workedDaysSet.size,
        overtimeHours: Math.round(overtimeHours * 100) / 100,
      },
    });
  } catch (error) {
    console.error("[GET /api/shifts/stats] Error:", error);
    return apiServerError("Failed to fetch shift stats.");
  }
}
