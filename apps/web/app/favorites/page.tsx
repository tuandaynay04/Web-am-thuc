import { FavoritesList } from '@/components/favorites/favorites-list';

export default function FavoritesPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Món yêu thích
        </h1>

        <p className="mt-2 text-gray-600">
          Những công thức bạn đã lưu để
          xem lại sau.
        </p>
      </div>

      <FavoritesList />
    </main>
  );
}