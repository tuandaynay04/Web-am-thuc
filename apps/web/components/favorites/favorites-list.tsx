'use client';

import Link from 'next/link';
import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import { authApiFetch } from '@/lib/api';

type Favorite = {
  id: number;
  recipeId: number;
  createdAt: string;

  recipe: {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    servings: number;
    prepMinutes: number | null;
    cookMinutes: number | null;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';

    category: {
      id: number;
      name: string;
      slug: string;
    };
  };
};

export function FavoritesList() {
  const [favorites, setFavorites] =
    useState<Favorite[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const loadFavorites = useCallback(
    async () => {
      try {
        setError(null);

        const data =
          await authApiFetch<Favorite[]>(
            '/favorites/me',
          );

        setFavorites(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Không thể tải món yêu thích',
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void loadFavorites();
  }, [loadFavorites]);

  async function removeFavorite(
    recipeId: number,
    title: string,
  ) {
    const confirmed = window.confirm(
      `Bỏ "${title}" khỏi danh sách yêu thích?`,
    );

    if (!confirmed) return;

    try {
      await authApiFetch(
        `/favorites/recipe/${recipeId}`,
        {
          method: 'DELETE',
        },
      );

      await loadFavorites();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Không thể bỏ yêu thích',
      );
    }
  }

  if (loading) {
    return (
      <p className="text-gray-500">
        Đang tải món yêu thích...
      </p>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border p-5">
        <p className="text-red-600">
          {error}
        </p>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="rounded-2xl border p-8 text-center">
        <h2 className="text-xl font-semibold">
          Chưa có món yêu thích
        </h2>

        <p className="mt-2 text-gray-500">
          Hãy khám phá món ăn và lưu những
          công thức bạn muốn thử.
        </p>

        <Link
          href="/"
          className="mt-5 inline-block rounded-xl bg-black px-5 py-3 text-white"
        >
          Khám phá món ăn
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {favorites.map((favorite) => (
        <article
          key={favorite.id}
          className="rounded-2xl border p-6"
        >
          <p className="text-sm text-gray-500">
            {favorite.recipe.category.name}
          </p>

          <h2 className="mt-2 text-xl font-bold">
            {favorite.recipe.title}
          </h2>

          {favorite.recipe.description && (
            <p className="mt-3 text-gray-600">
              {favorite.recipe.description}
            </p>
          )}

          <div className="mt-4 text-sm text-gray-500">
            {favorite.recipe.prepMinutes ?? 0}
            {' '}phút chuẩn bị ·{' '}
            {favorite.recipe.cookMinutes ?? 0}
            {' '}phút nấu
          </div>

          <div className="mt-5 flex gap-3">
            <Link
            href={`/recipes/${favorite.recipe.slug}`}
            className="rounded-lg bg-blue px-4 py-2 text-sm font-medium text-white"
            >
            Xem công thức
            </Link>

            <button
              type="button"
              onClick={() =>
                void removeFavorite(
                  favorite.recipeId,
                  favorite.recipe.title,
                )
              }
              className="rounded-lg border px-4 py-2 text-sm font-medium text-red-600"
            >
              Bỏ yêu thích
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}