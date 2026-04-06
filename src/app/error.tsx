'use client'

import { AlertTriangle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

export default function ErrorPage({
  reset,
  error,
}: {
  reset: () => void
  error: Error & { digest?: string }
}) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md rounded-xl border border-border/50 shadow-lg">
        <CardContent className="flex flex-col items-center p-8 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="mb-2 text-lg font-semibold">
            Что-то пошло не так
          </h2>
          <p className="mb-6 max-w-sm text-sm text-muted-foreground">
            {error?.message || 'Произошла непредвиденная ошибка. Попробуйте обновить страницу.'}
          </p>
          <Button onClick={reset} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Попробовать снова
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
