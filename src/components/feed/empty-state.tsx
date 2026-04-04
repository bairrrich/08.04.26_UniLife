import { Rss, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  onOpenDialog: () => void
}

export function FeedEmptyState({ onOpenDialog }: EmptyStateProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="py-20 text-center">
        <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full float-animation">
          <div className="absolute h-24 w-24 rounded-full bg-gradient-to-br from-emerald-400/30 via-primary/20 to-amber-400/20 animate-pulse-soft" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400/30 to-primary/20">
            <Rss className="h-8 w-8 text-primary/70" />
          </div>
        </div>
        <p className="text-muted-foreground font-semibold text-xl mb-2">
          Лента пуста
        </p>
        <p className="text-muted-foreground/70 text-sm max-w-sm mx-auto leading-relaxed">
          Начните делиться своими мыслями, достижениями и моментами дня с друзьями
        </p>
        <Button
          size="lg"
          className="mt-6 gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
          onClick={onOpenDialog}
        >
          <Sparkles className="h-4 w-4" />
          Создать первую запись
        </Button>
      </CardContent>
    </Card>
  )
}
