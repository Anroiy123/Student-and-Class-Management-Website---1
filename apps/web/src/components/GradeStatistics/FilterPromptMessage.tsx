export function FilterPromptMessage() {
  return (
    <div className="nb-card text-center py-12">
      <svg
        className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"
        />
      </svg>
      <h3 className="text-lg font-bold mb-2">Vui lòng chọn bộ lọc</h3>
      <p className="text-sm opacity-70 max-w-md mx-auto">
        Chọn lớp hoặc môn học để xem dữ liệu điểm và thống kê.
        <br />
        Học kỳ và năm là tùy chọn (có thể bỏ trống để xem tất cả).
      </p>
    </div>
  );
}
