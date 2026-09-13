'use client';

import {
  useEffect,
  useState,
} from 'react';

import { authApiFetch } from '@/lib/api';

type Favorite = {
  id: number;
  recipeId: number;
};

type FavoriteButtonProps = {
  recipeId: number;
};

export function FavoriteButton({
  recipeId,
}: FavoriteButtonProps) {
  const [mounted, setMounted] =
    useState(false);

  const [isFavorite, setIsFavorite] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    setMounted(true);

    async function loadFavoriteState() {
      setLoading(true);

      try {
        const favorites =
          await authApiFetch<Favorite[]>(
            '/favorites/me',
          );

        setIsFavorite(
          favorites.some(
            (item) =>
              item.recipeId === recipeId,
          ),
        );
      } catch {
        // Chưa đăng nhập:
        // vẫn cho trang công thức hiển thị bình thường.
        setIsFavorite(false);
      } finally {
        setLoading(false);
      }
    }

    void loadFavoriteState();
  }, [recipeId]);

  async function toggleFavorite() {
    setLoading(true);
    setError(null);

    try {
      if (isFavorite) {
        await authApiFetch(
          `/favorites/recipe/${recipeId}`,
          {
            method: 'DELETE',
          },
        );

        setIsFavorite(false);
      } else {
        await authApiFetch(
          '/favorites',
          {
            method: 'POST',
            body: JSON.stringify({
              recipeId,
            }),
          },
        );

        setIsFavorite(true);
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Không thể cập nhật yêu thích',
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * Quan trọng:
   * Server và lần render đầu tiên ở browser
   * phải tạo ra HTML giống nhau.
   */
  if (!mounted) {
    return (
      <div>
        <button
          type="button"
          disabled
          className="rounded-xl border border-orange-200 bg-white px-5 py-3 font-medium text-stone-500 opacity-70"
        >
          ♡ Yêu thích
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() =>
          void toggleFavorite()
        }
        disabled={loading}
        className={
          isFavorite
            ? 'rounded-xl border border-orange-200 bg-orange-50 px-5 py-3 font-semibold text-orange-600 transition hover:bg-orange-100 disabled:opacity-50'
            : 'rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:opacity-50'
        }
      >
        {loading
          ? 'Đang xử lý...'
          : isFavorite
            ? '♥ Đã yêu thích'
            : '♡ Thêm vào yêu thích'}
      </button>

      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}