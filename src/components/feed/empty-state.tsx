import { Rss, PenLine } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ModuleEmptyState } from '@/components/shared'

interface EmptyStateProps {
  onOpenDialog: () => void
}

export function FeedEmptyState({ onOpenDialog }: EmptyStateProps) {
  return (
    <ModuleEmptyState
      icon={Rss}
      title="Лента пуста"
      description="Поделитесь первым постом — расскажите о своих мыслях, достижениях или моментах дня"
      accent="emerald"
    >
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
    </ModuleEmptyState>
  )
}
