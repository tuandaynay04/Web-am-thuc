'use client';

import Link from 'next/link';
import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import { apiFetch } from '@/lib/api';
import type { Recipe } from '@/types/recipe';

export function AdminRecipes() {
  const [recipes, setRecipes] =
    useState<Recipe[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const loadRecipes = useCallback(
    async () => {
      try {
        setError(null);

        const data =
          await apiFetch<Recipe[]>(
            '/recipes',
          );

        setRecipes(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Không thể tải danh sách món ăn',
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void loadRecipes();
  }, [loadRecipes]);

  return (
    <div>
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-orange-500">
            Nội dung
          </p>

          <h1 className="mt-2 text-3xl font-bold text-stone-900">
            Quản lý món ăn
          </h1>

          <p className="mt-2 text-stone-500">
            Thêm, chỉnh sửa và quản lý các công thức
            trên website.
          </p>
        </div>

        <Link
          href="/admin/recipes/new"
          className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold !text-white shadow-sm transition hover:bg-orange-600"
        >
          + Thêm món ăn
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm">
        {loading && (
          <div className="p-8 text-stone-500">
            Đang tải món ăn...
          </div>
        )}

        {error && (
          <div className="p-8 text-red-600">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          recipes.length === 0 && (
            <div className="p-10 text-center">
              <div className="text-5xl">
                🍲
              </div>

              <h2 className="mt-4 font-bold text-stone-900">
                Chưa có món ăn
              </h2>

              <p className="mt-2 text-sm text-stone-500">
                Hãy thêm món ăn đầu tiên.
              </p>
            </div>
          )}

        {!loading &&
          !error &&
          recipes.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-orange-100 bg-orange-50/60">
                  <tr className="text-left text-sm text-stone-600">
                    <th className="px-6 py-4 font-semibold">
                      Món ăn
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Danh mục
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Độ khó
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Trạng thái
                    </th>

                    <th className="px-6 py-4 text-right font-semibold">
                      Thao tác
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {recipes.map((recipe) => (
                    <tr
                      key={recipe.id}
                      className="border-b border-stone-100 last:border-0"
                    >
                      <td className="px-6 py-5">
                        <div className="font-semibold text-stone-900">
                          {recipe.title}
                        </div>

                        <div className="mt-1 text-xs text-stone-400">
                          /recipes/{recipe.slug}
                        </div>
                      </td>

                      <td className="px-6 py-5 text-sm text-stone-600">
                        {recipe.category?.name ??
                          '—'}
                      </td>

                      <td className="px-6 py-5 text-sm text-stone-600">
                        {recipe.difficulty ??
                          '—'}
                      </td>

                      <td className="px-6 py-5">
                        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                          {recipe.status ??
                            'PUBLISHED'}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/recipes/${recipe.slug}`}
                            className="rounded-lg border border-stone-200 px-3 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-50"
                          >
                            Xem
                          </Link>

                          <Link
                            href={`/admin/recipes/${recipe.id}/edit`}
                            className="rounded-lg border border-orange-200 px-3 py-2 text-sm font-medium text-orange-600 transition hover:bg-orange-50"
                          >
                            Sửa
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </div>
  );
}