import { Skeleton } from "@/components/ui/skeleton"

/**
 * Loading skeleton for content creator components.
 * Matches the layout of creator forms (title input, textarea, buttons).
 */
export function ContentCreatorSkeleton() {
  return (
    <div className="space-y-4" aria-label="Loading content creator" role="status">
      {/* Title input skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>

      {/* Main textarea skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>

      {/* Character count skeleton */}
      <Skeleton className="h-4 w-32 ml-auto" />

      {/* Button row skeleton */}
      <div className="flex items-center justify-between pt-4">
        <div className="flex gap-3">
          <Skeleton className="h-12 w-32 rounded-xl" />
          <Skeleton className="h-12 w-24 rounded-xl" />
        </div>
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>

      {/* Screen reader text */}
      <span className="sr-only">Loading content creator, please wait...</span>
    </div>
  )
}
