import { Skeleton } from "@/components/ui/skeleton"

export function OrdersSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      
      <div className="border rounded-lg divide-y overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
            {/* Left: ID + date */}
            <div className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>

            {/* Middle: item count + badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>

            {/* Right: total + arrow */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-12" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
