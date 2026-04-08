import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DEMO_USER_ID, apiSuccess, apiError, apiServerError, apiSuccessMessage } from "@/lib/api";

// ─── PUT /api/shifts/[id] ───────────────────────────────────────────────────

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await db.shift.findUnique({ where: { id } });
    if (!existing || existing.userId !== DEMO_USER_ID) {
      return apiError("Shift not found.", 404);
    }

    const body = (await request.json()) as {
      date?: string;
      startTime?: string;
      endTime?: string;
      breakMin?: number;
      location?: string;
      note?: string;
      status?: string;
      payRate?: number | null;
      tips?: number | null;
    };

    const updateData: Record<string, unknown> = {};

    if (body.date !== undefined) {
      const d = new Date(body.date);
      if (isNaN(d.getTime())) {
        return apiError("Invalid date format.");
      }
      updateData.date = d;
    }

    if (body.startTime !== undefined) {
      if (!/^\d{2}:\d{2}$/.test(body.startTime)) {
        return apiError("Invalid startTime format. Use HH:mm.");
      }
      updateData.startTime = body.startTime;
    }

    if (body.endTime !== undefined) {
      if (!/^\d{2}:\d{2}$/.test(body.endTime)) {
        return apiError("Invalid endTime format. Use HH:mm.");
      }
      updateData.endTime = body.endTime;
    }

    if (body.breakMin !== undefined) {
      if (typeof body.breakMin !== "number" || body.breakMin < 0) {
        return apiError("breakMin must be a non-negative number.");
      }
      updateData.breakMin = body.breakMin;
    }

    if (body.location !== undefined) {
      updateData.location = typeof body.location === "string" ? body.location.trim() || null : null;
    }

    if (body.note !== undefined) {
      updateData.note = typeof body.note === "string" ? body.note.trim() || null : null;
    }

    if (body.status !== undefined) {
      const validStatuses = ["scheduled", "completed", "cancelled"];
      if (!validStatuses.includes(body.status)) {
        return apiError("Invalid status. Must be scheduled, completed, or cancelled.");
      }
      updateData.status = body.status;
    }

    if (body.payRate !== undefined) {
      updateData.payRate = body.payRate !== null && typeof body.payRate === "number" && body.payRate >= 0
        ? body.payRate
        : null;
    }

    if (body.tips !== undefined) {
      updateData.tips = body.tips !== null && typeof body.tips === "number" && body.tips >= 0
        ? body.tips
        : null;
    }

    const updated = await db.shift.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        userId: updated.userId,
        date: updated.date.toISOString(),
        startTime: updated.startTime,
        endTime: updated.endTime,
        breakMin: updated.breakMin,
        location: updated.location,
        note: updated.note,
        status: updated.status,
        payRate: updated.payRate,
        tips: updated.tips,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("[PUT /api/shifts/:id] Error:", error);
    return apiServerError("Failed to update shift.");
  }
}

// ─── DELETE /api/shifts/[id] ─────────────────────────────────────────────────

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await db.shift.findUnique({ where: { id } });
    if (!existing || existing.userId !== DEMO_USER_ID) {
      return apiError("Shift not found.", 404);
    }

    await db.shift.delete({ where: { id } });

    return apiSuccessMessage("Shift deleted.");
  } catch (error) {
    console.error("[DELETE /api/shifts/:id] Error:", error);
    return apiServerError("Failed to delete shift.");
  }
}
