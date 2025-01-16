export default function SkeletonQuizList() {
  return (
    <div className="w-full min-h-[calc(100vh-80px)] px-8 flex flex-col gap-6 mt-6 mx-auto">
      <div className="flex justify-between items-center min-w-content h-20 bg-gray-50 shadow-sm border rounded-base p-6 animate-pulse">
        <div className="flex flex-col">
          <span className="text-lg font-semibold" />
          <span className="text-sm font-semibold text-gray-500" />
        </div>

        <div className="w-32 h-9 rounded-sm bg-gray-100 mr-8"></div>
      </div>
    </div>
  );
}
