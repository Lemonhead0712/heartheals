import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto py-8">
      <Skeleton className="h-10 w-64 mb-6" />

      <div className="grid gap-8 md:grid-cols-2">
        <div className="p-6 border rounded-lg shadow-sm">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-[300px] w-full rounded" />
        </div>

        <div className="p-6 border rounded-lg shadow-sm">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-[300px] w-full rounded" />
        </div>
      </div>

      <div className="mt-8 p-6 border rounded-lg shadow-sm">
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
        </div>
      </div>
    </div>
  )
}
