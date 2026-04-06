import { Rss, Sparkles, PenLine } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  onOpenDialog: () => void
}

export function FeedEmptyState({ onOpenDialog }: EmptyStateProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="py-14 text-center px-4">
        {/* Gradient icon */}
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl float-animation">
          <div className="absolute h-20 w-20 rounded-2xl bg-gradient-to-br from-emerald-400/30 via-primary/20 to-amber-400/20 animate-pulse-soft" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30">
            <Rss className="h-8 w-8 text-white" />
          </div>
        </div>

        <p className="text-foreground font-semibold text-lg mb-2">
          Лента пуста
        </p>
        <p className="text-muted-foreground/70 text-sm max-w-sm mx-auto leading-relaxed mb-6">
          Поделитесь первым постом — расскажите о своих мыслях, достижениях или моментах дня
        </p>

        {/* Step-by-step guide */}
        <div className="max-w-sm mx-auto mb-6">
          <div className="flex items-start gap-3 text-left mb-3">
            <div className="shrink-0 h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-xs font-bold text-emerald-600 dark:text-emerald-400">1</div>
            <div>
              <p className="text-sm font-medium">Опишите свой день</p>
              <p className="text-xs text-muted-foreground">Расскажите о мыслях, достижениях или моментах</p>
            </div>
          </div>
          <div className="flex items-start gap-3 text-left mb-3">
            <div className="shrink-0 h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-xs font-bold text-emerald-600 dark:text-emerald-400">2</div>
            <div>
              <p className="text-sm font-medium">Добавьте настроение</p>
              <p className="text-xs text-muted-foreground">Выберите эмодзи и теги для контекста</p>
            </div>
          </div>
          <div className="flex items-start gap-3 text-left">
            <div className="shrink-0 h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-xs font-bold text-emerald-600 dark:text-emerald-400">3</div>
            <div>
              <p className="text-sm font-medium">Опубликуйте</p>
              <p className="text-xs text-muted-foreground">Ваши записи увидят другие пользователи</p>
            </div>
          </div>
        </div>

        <Button
          size="lg"
          className="mt-2 gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:from-emerald-600 hover:to-teal-600 transition-all active-press"
          onClick={onOpenDialog}
        >
          <PenLine className="h-4 w-4" />
          Поделитесь первым постом
        </Button>
      </CardContent>
    </Card>
  )
}
