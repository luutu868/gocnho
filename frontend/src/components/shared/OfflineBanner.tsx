// Offline banner shown when user loses internet connection (PWA)

export function OfflineBanner() {
  return (
    <div className="bg-yellow-500 text-white text-center py-2 px-4 text-sm font-medium" role="alert">
      ⚠️ Bạn đang offline — menu đã xem vẫn hiển thị, nhưng không thể đặt món mới
    </div>
  );
}
