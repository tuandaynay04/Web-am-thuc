export default function AdminPage() {
  return (
    <div>
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-orange-500">
          Dashboard
        </p>

        <h1 className="mt-2 text-3xl font-bold text-stone-900">
          Tổng quan hệ thống
        </h1>

        <p className="mt-2 text-stone-500">
          Quản lý nội dung và hoạt động của Bếp Việt.
        </p>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
          <div className="text-3xl">
            🍲
          </div>

          <p className="mt-4 text-sm text-stone-500">
            Món ăn
          </p>

          <p className="mt-1 text-3xl font-bold text-stone-900">
            —
          </p>
        </div>

        <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
          <div className="text-3xl">
            📁
          </div>

          <p className="mt-4 text-sm text-stone-500">
            Danh mục
          </p>

          <p className="mt-1 text-3xl font-bold text-stone-900">
            —
          </p>
        </div>

        <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
          <div className="text-3xl">
            👥
          </div>

          <p className="mt-4 text-sm text-stone-500">
            Người dùng
          </p>

          <p className="mt-1 text-3xl font-bold text-stone-900">
            —
          </p>
        </div>

        <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
          <div className="text-3xl">
            ⭐
          </div>

          <p className="mt-4 text-sm text-stone-500">
            Đánh giá
          </p>

          <p className="mt-1 text-3xl font-bold text-stone-900">
            —
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-3xl border border-orange-100 bg-white p-8 shadow-sm">
        <h2 className="text-xl font-bold text-stone-900">
          Chào mừng đến trang quản trị 👋
        </h2>

        <p className="mt-2 leading-7 text-stone-600">
          Tại đây quản trị viên có thể quản lý món ăn,
          danh mục, nguyên liệu, người dùng và đánh giá.
        </p>
      </div>
    </div>
  );
}