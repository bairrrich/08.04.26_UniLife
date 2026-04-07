import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DEMO_USER_ID, apiServerError } from "@/lib/api";

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// GET /api/diary/stats
export async function GET() {
  try {
    // Fetch ALL entries (without date filter) for aggregate stats
    const allEntries = await db.diaryEntry.findMany({
      where: { userId: DEMO_USER_ID },
      orderBy: { date: "desc" },
    });

    // Total entries
    const totalEntries = allEntries.length;

    // This month entries
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthEntries = allEntries.filter(
      (e) => new Date(e.date) >= monthStart
    ).length;

    // Current streak (consecutive days ending today or yesterday)
    const uniqueDates = new Set(
      allEntries.map((e) => toDateStr(new Date(e.date)))
    );
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = toDateStr(today);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = toDateStr(yesterday);

    let streak = 0;
    if (uniqueDates.has(todayStr) || uniqueDates.has(yesterdayStr)) {
      const checkDate = uniqueDates.has(todayStr)
        ? new Date(today)
        : new Date(yesterday);
      while (uniqueDates.has(toDateStr(checkDate))) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }
    const currentStreak = Math.min(streak, 30);

    // Average words per entry
    let averageWords = 0;
    if (totalEntries > 0) {
      const totalWords = allEntries.reduce(
        (sum, e) => sum + countWords(e.content),
        0
      );
      averageWords = Math.round(totalWords / totalEntries);
    }

    // Longest entry
    let longestEntry: { title: string; wordCount: number } | null = null;
    if (totalEntries > 0) {
      let maxWords = 0;
      let maxTitle = "";
      for (const entry of allEntries) {
        const wc = countWords(entry.content);
        if (wc > maxWords) {
          maxWords = wc;
          maxTitle = entry.title || entry.content.slice(0, 40);
        }
      }
      longestEntry = { title: maxTitle, wordCount: maxWords };
    }

    return NextResponse.json({
      data: {
        totalEntries,
        thisMonthEntries,
        currentStreak,
        averageWords,
        longestEntry,
      },
    });
  } catch (error) {
    console.error("[GET /api/diary/stats] Error:", error);
    return apiServerError("Failed to fetch diary stats.");
  }
}
