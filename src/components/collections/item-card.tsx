import { Card, CardContent } from '@/components/ui/card'
import { Star, CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CollectionItem, CollectionType } from './types'
import { TYPE_ICONS_LARGE, TYPE_ICONS, TYPE_ICON_BG, TYPE_COLORS, getCoverGradient, parseTags, formatDaysAgo } from './constants'

// ─── Type-specific gradient overlays ─────────────────────────────────────────

const TYPE_OVERLAY_GRADIENT: Record<CollectionType, string> = {
  BOOK: 'from-blue-500/5 to-transparent',
  MOVIE: 'from-purple-500/5 to-transparent',
  ANIME: 'from-pink-500/5 to-transparent',
  SERIES: 'from-sky-500/5 to-transparent',
  MUSIC: 'from-violet-500/5 to-transparent',
  RECIPE: 'from-orange-500/5 to-transparent',
  SUPPLEMENT: 'from-green-500/5 to-transparent',
  PRODUCT: 'from-rose-500/5 to-transparent',
  PLACE: 'from-amber-500/5 to-transparent',
}

interface ItemCardProps {
  item: CollectionItem
  onClick: (item: CollectionItem) => void
  isFavorite?: boolean
}

export function ItemCard({ item, onClick, isFavorite }: ItemCardProps) {
  const type = item.type as CollectionType

  return (
    <Card
      className="overflow-hidden cursor-pointer group hover-lift active-press"
      onClick={() => onClick(item)}
    >
      {/* Cover placeholder with type-specific overlay */}
      <div className="relative">
        <div
          className={`h-32 bg-gradient-to-br ${getCoverGradient(item.id)} flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-[1.03]`}
        >
          <div className="text-white/80 transition-transform duration-300 group-hover:scale-110">
            {TYPE_ICONS_LARGE[type]}
          </div>
          {/* Holographic shine effect on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-white/0 via-white/25 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          {/* Type-specific gradient overlay */}
          <div className={`absolute inset-0 bg-gradient-to-t ${TYPE_OVERLAY_GRADIENT[type]} pointer-events-none`} />
          {/* Type badge */}
          <div className="absolute top-2 right-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${TYPE_COLORS[type]}`}
            >
              {item.type}
            </span>
          </div>
          {/* Type icon in top-left corner */}
          <div className={cn(
            'absolute top-2 left-2 flex h-7 w-7 items-center justify-center rounded-lg text-white shadow-sm',
            TYPE_ICON_BG[type]
          )}>
            {TYPE_ICONS[type]}
          </div>
          {/* Favorite indicator */}
          {isFavorite && (
            <div className="absolute bottom-2 left-2">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400 drop-shadow-md" />
            </div>
          )}
        </div>
      </div>
      <div className="p-3 space-y-1.5">
        <h3 className="text-sm font-medium line-clamp-2 leading-snug">
          {item.title}
        </h3>
        {item.author && (
          <p className="text-xs text-muted-foreground truncate">
            {item.author}
          </p>
        )}
        {/* Notes preview */}
        {item.notes && (
          <p className="text-[11px] text-muted-foreground/70 line-clamp-1 italic">
            {item.notes}
          </p>
        )}
        {item.rating && (
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'h-3 w-3 transition-colors',
                  i < item.rating!
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-muted-foreground/30'
                )}
              />
            ))}
            <span className="text-[11px] font-semibold tabular-nums text-amber-500 dark:text-amber-400 ml-1">
              {item.rating}.0
            </span>
          </div>
        )}
        <div className="flex gap-1.5 flex-wrap">
          {parseTags(item.tags).slice(0, 2).map((tag, idx) => (
            <span
              key={tag}
              className={cn(
                'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border-l-2',
                idx % 2 === 0
                  ? 'bg-gradient-to-r from-emerald-50 to-emerald-100/80 text-emerald-700 border-l-emerald-400 dark:from-emerald-950/40 dark:to-emerald-900/30 dark:text-emerald-400 dark:border-l-emerald-500'
                  : 'bg-gradient-to-r from-violet-50 to-violet-100/80 text-violet-700 border-l-violet-400 dark:from-violet-950/40 dark:to-violet-900/30 dark:text-violet-400 dark:border-l-violet-500',
              )}
            >
              {tag}
            </span>
          ))}
        </div>
        {/* Date added badge */}
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60 pt-0.5">
          <CalendarDays className="h-2.5 w-2.5" />
          <span>{formatDaysAgo(item.createdAt)}</span>
        </div>
      </div>
    </Card>
  )
}
