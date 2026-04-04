import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card'

export function SkeletonCard() {
  return (
    <Card className="rounded-xl border">
      <CardHeader className="pb-2">
        <div className="skeleton-shimmer h-4 w-24 rounded-md" />
      </CardHeader>
      <CardContent>
        <div className="skeleton-shimmer mb-2 h-8 w-32 rounded-md" />
        <div className="skeleton-shimmer h-3 w-20 rounded-md" />
      </CardContent>
    </Card>
  )
}

export function SkeletonChart() {
  return (
    <Card className="rounded-xl border">
      <CardHeader className="pb-2">
        <div className="skeleton-shimmer h-4 w-36 rounded-md" />
      </CardHeader>
      <CardContent>
        <div className="skeleton-shimmer h-[250px] w-full rounded-lg" />
      </CardContent>
    </Card>
  )
}
