import { Skeleton } from "@/components/ui/skeleton"

export function ProductsSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-100 py-8 px-4">
      <div className="max-w-[1600px] mx-auto mb-8">
        <div className="bg-white rounded-2xl shadow-md p-4 sm:p-5 flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div className="flex-1 space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>
      </div>
      <div className="max-w-[1600px] mx-auto mb-8">
        <Skeleton className="h-10 w-48" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 max-w-[1600px] mx-auto">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-md flex flex-col">
            <Skeleton className="h-0 aspect-square" style={{ paddingTop: '100%' }} />
            <div className="p-5 flex flex-col flex-grow space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-7 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
