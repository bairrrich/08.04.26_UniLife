import { Rss, Sparkles, PenLine } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  onOpenDialog: () => void
}

export function FeedEmptyState({ onOpenDialog }: EmptyStateProps) {
  return (
    <Card className="rounded-xl overflow-hidden border-0 bg-gradient-to-b from-muted/30 to-background">
      <CardContent className="py-20 text-center">
        {/* Gradient icon */}
        <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full float-animation">
          <div className="absolute h-24 w-24 rounded-full bg-gradient-to-br from-emerald-400/30 via-primary/20 to-amber-400/20 animate-pulse-soft" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30">
            <Rss className="h-8 w-8 text-white" />
          </div>
        </div>

        <p className="text-foreground font-semibold text-xl mb-2">
          Лента пуста
        </p>
        <p className="text-muted-foreground/70 text-sm max-w-sm mx-auto leading-relaxed">
          Поделитесь первым постом — расскажите о своих мыслях, достижениях или моментах дня
        </p>
        <Button
          size="lg"
          className="mt-6 gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:from-emerald-600 hover:to-teal-600 transition-all"
          onClick={onOpenDialog}
        >
          <PenLine className="h-4 w-4" />
          Поделитесь первым постом
        </Button>
      </CardContent>
    </Card>
  )
}
