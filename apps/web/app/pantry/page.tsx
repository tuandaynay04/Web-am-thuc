import { PantryList } from '@/components/pantry/pantry-list';

export default function PantryPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Bếp của tôi
        </h1>

        <p className="mt-2 text-gray-600">
          Quản lý những nguyên liệu hiện có
          trong bếp của bạn.
        </p>
      </div>

      <PantryList />
    </main>
  );
}