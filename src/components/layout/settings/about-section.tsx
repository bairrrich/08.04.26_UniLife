import { Shield } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function AboutSection() {
  return (
    <Card className="rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          О приложении
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Версия</span>
            <span className="font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Стек</span>
            <span className="font-medium">Next.js 16 + Tailwind CSS</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">UI Kit</span>
            <span className="font-medium">shadcn/ui</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
