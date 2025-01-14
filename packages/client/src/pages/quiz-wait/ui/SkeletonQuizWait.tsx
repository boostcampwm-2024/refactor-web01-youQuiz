import Skeleton from '@/shared/ui/skeleton/Skeleton';

export default function SkeletonQuizWait() {
  return (
    <div className="flex justify-center gap-4 pt-8">
      <div className="flex flex-col gap-6 justify-center items-center">
        <div className="w-full bg-white rounded-xl shadow-md p-6">
          <div className="relative flex items-center justify-between mb-4 gap-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-32 rounded-xl" />
              <Skeleton className="h-10 w-32 rounded-xl" />
            </div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-6 bg-gray-100 rounded-md animate-pulse" />
            <div className="flex items-center gap-6">
              <Skeleton className="h-10 w-24 rounded-2xl" />
              <Skeleton className="h-10 w-32 rounded-md" />
            </div>
          </div>

          <div className="w-full bg-gray-50 rounded-xl shadow-md">
            <div className="grid grid-cols-8 gap-16 p-8">
              {Array.from({ length: 32 }).map((_, index) => (
                <div key={index} className="flex flex-col items-center animate-pulse">
                  <Skeleton className="w-20 h-20 rounded-full" />
                  <Skeleton className="w-16 h-4 bg-gray-200 rounded-md mt-2" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative flex justify-end min-w-full">
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
