import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, Heart, Clock, CheckCircle } from 'lucide-react'
import type { CollectionItem, CollectionType, CollectionStatus } from './types'
import { TYPE_ICONS_LARGE, TYPE_ICONS, STATUS_COLORS, STATUS_LABELS, getCoverGradient, parseTags } from './constants'

interface ItemCardProps {
  item: CollectionItem
  onClick: (item: CollectionItem) => void
}

function StatusIcon({ status }: { status: CollectionStatus }) {
  if (status === 'WANT') return <Heart className="h-2.5 w-2.5" />
  if (status === 'IN_PROGRESS') return <Clock className="h-2.5 w-2.5" />
  return <CheckCircle className="h-2.5 w-2.5" />
}

export function ItemCard({ item, onClick }: ItemCardProps) {
  return (
    <Card
      className="overflow-hidden transition-all duration-200 cursor-pointer group hover:scale-[1.02] hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]"
      onClick={() => onClick(item)}
    >
      {/* Cover placeholder */}
      <div
        className={`h-32 bg-gradient-to-br ${getCoverGradient(item.id)} flex items-center justify-center relative overflow-hidden transition-transform duration-300 group-hover:scale-[1.03]`}
      >
        <div className="text-white/80 transition-transform duration-300 group-hover:scale-110">
          {TYPE_ICONS_LARGE[item.type as CollectionType]}
        </div>
        {/* Status badge */}
        <div className="absolute top-2 right-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[item.status]}`}
          >
            <StatusIcon status={item.status} />
            {STATUS_LABELS[item.status]}
          </span>
        </div>
        {/* Type icon in top-left corner */}
        <div className="absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-md bg-black/20 backdrop-blur-sm text-white/90">
          {TYPE_ICONS[item.type as CollectionType]}
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
        {item.rating && (
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 transition-colors ${
                  i < item.rating!
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-gray-300 dark:text-gray-600'
                }`}
              />
            ))}
          </div>
        )}
        <div className="flex gap-1 flex-wrap">
          {parseTags(item.tags).slice(0, 2).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-[10px] px-1.5 py-0"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </Card>
  )
}
