export default function Loading() {
  return (
    <div className="px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64 relative flex flex-col lg:flex-row gap-16 py-5 animate-pulse min-h-screen">
      {/* Image Skeleton */}
      <div className="w-full lg:w-1/2 lg:sticky top-20 h-[500px] bg-gray-200 rounded-md" />

      {/* Text Skeleton */}
      <div className="w-full lg:w-1/2 flex flex-col gap-6">
        <div className="h-10 bg-gray-200 rounded-md w-3/4" />
        <div className="h-5 bg-gray-200 rounded-md w-full" />
        <div className="h-[2px] bg-gray-100 w-full" />

        <div className="flex items-center gap-4">
          <div className="h-8 bg-gray-200 rounded-md w-1/4" />
          <div className="h-8 bg-gray-200 rounded-md w-1/4" />
        </div>
        <div className="h-[2px] bg-gray-100 w-full" />

        <div className="flex flex-col gap-6">
          {/* Options Skeleton */}
          <div className="flex flex-col gap-4">
            <div className="h-5 bg-gray-200 rounded-md w-1/4" />
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full" />
              <div className="w-8 h-8 bg-gray-200 rounded-full" />
              <div className="w-8 h-8 bg-gray-200 rounded-full" />
            </div>
          </div>

          {/* Quantity Skeleton */}
          <div className="flex flex-col gap-4">
            <div className="h-5 bg-gray-200 rounded-md w-1/4" />
            <div className="flex justify-between items-center">
              <div className="bg-gray-200 py-2 px-4 rounded-3xl flex items-center justify-between w-32">
                <div className="h-5 w-5 bg-gray-300 rounded-md" />
                <div className="h-5 w-5 bg-gray-300 rounded-md" />
                <div className="h-5 w-5 bg-gray-300 rounded-md" />
              </div>
              <div className="h-8 bg-gray-200 rounded-3xl w-36" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
