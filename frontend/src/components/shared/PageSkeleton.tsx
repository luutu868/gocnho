// Loading skeleton shown while page code-splits

export function PageSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-4" />
        <p className="text-gray-500">Đang tải...</p>
      </div>
    </div>
  );
}
