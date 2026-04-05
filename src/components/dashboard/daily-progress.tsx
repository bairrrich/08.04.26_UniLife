'use client'

interface DailyProgressProps {
  progress: number
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DailyProgress({ progress }: DailyProgressProps) {
  return (
    <div className="mt-3 flex items-center gap-3">
      <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(to right, #10b981, #14b8a6)',
          }}
        />
      </div>
      <span className="text-[11px] font-medium tabular-nums text-muted-foreground shrink-0">
        {progress}%
      </span>
    </div>
  )
}
