'use client';

import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  apiFetch,
  authApiFetch,
} from '@/lib/api';

type Ingredient = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export function AdminIngredients() {
  const [ingredients, setIngredients] =
    useState<Ingredient[]>([]);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] =
    useState('');

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const loadIngredients = useCallback(
    async () => {
      try {
        setError(null);

        const data =
          await apiFetch<Ingredient[]>(
            '/ingredients',
          );

        setIngredients(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Không thể tải nguyên liệu',
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void loadIngredients();
  }, [loadIngredients]);

  function generateSlug(value: string) {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function changeName(value: string) {
    setName(value);

    if (editingId === null) {
      setSlug(generateSlug(value));
    }
  }

  function resetForm() {
    setEditingId(null);
    setName('');
    setSlug('');
    setDescription('');
  }

  function startEdit(
    ingredient: Ingredient,
  ) {
    setEditingId(ingredient.id);
    setName(ingredient.name);
    setSlug(ingredient.slug);
    setDescription(
      ingredient.description ?? '',
    );
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setSaving(true);
    setError(null);

    try {
      const body = JSON.stringify({
        name: name.trim(),
        slug: slug.trim(),
        description:
          description.trim() || undefined,
      });

      if (editingId === null) {
        await authApiFetch(
          '/ingredients',
          {
            method: 'POST',
            body,
          },
        );
      } else {
        await authApiFetch(
          `/ingredients/${editingId}`,
          {
            method: 'PATCH',
            body,
          },
        );
      }

      resetForm();
      await loadIngredients();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Không thể lưu nguyên liệu',
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteIngredient(
    ingredient: Ingredient,
  ) {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa nguyên liệu "${ingredient.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    setError(null);

    try {
      await authApiFetch(
        `/ingredients/${ingredient.id}`,
        {
          method: 'DELETE',
        },
      );

      if (
        editingId === ingredient.id
      ) {
        resetForm();
      }

      await loadIngredients();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Không thể xóa nguyên liệu',
      );
    }
  }

  return (
    <div>
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-orange-500">
          Nội dung
        </p>

        <h1 className="mt-2 text-3xl font-bold text-stone-900">
          Quản lý nguyên liệu
        </h1>

        <p className="mt-2 text-stone-500">
          Tạo và quản lý nguyên liệu dùng
          trong các công thức.
        </p>
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[360px_1fr]">
        <form
          onSubmit={handleSubmit}
          className="h-fit rounded-3xl border border-orange-100 bg-white p-6 shadow-sm"
        >
          <h2 className="text-xl font-bold text-stone-900">
            {editingId === null
              ? 'Thêm nguyên liệu'
              : 'Sửa nguyên liệu'}
          </h2>

          <div className="mt-5">
            <label
              htmlFor="ingredient-name"
              className="mb-2 block text-sm font-medium"
            >
              Tên nguyên liệu
            </label>

            <input
              id="ingredient-name"
              value={name}
              onChange={(event) =>
                changeName(
                  event.target.value,
                )
              }
              required
              className="w-full rounded-xl border border-orange-100 px-4 py-3"
              placeholder="Ví dụ: Trứng gà"
            />
          </div>

          <div className="mt-4">
            <label
              htmlFor="ingredient-slug"
              className="mb-2 block text-sm font-medium"
            >
              Slug
            </label>

            <input
              id="ingredient-slug"
              value={slug}
              onChange={(event) =>
                setSlug(
                  event.target.value,
                )
              }
              required
              className="w-full rounded-xl border border-orange-100 px-4 py-3"
              placeholder="trung-ga"
            />
          </div>

          <div className="mt-4">
            <label
              htmlFor="ingredient-description"
              className="mb-2 block text-sm font-medium"
            >
              Mô tả
            </label>

            <textarea
              id="ingredient-description"
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value,
                )
              }
              rows={4}
              className="w-full rounded-xl border border-orange-100 px-4 py-3"
              placeholder="Mô tả ngắn về nguyên liệu..."
            />
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="mt-5 flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
            >
              {saving
                ? 'Đang lưu...'
                : editingId === null
                  ? 'Thêm nguyên liệu'
                  : 'Lưu thay đổi'}
            </button>

            {editingId !== null && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-stone-200 px-5 py-3 text-sm font-semibold text-stone-600"
              >
                Hủy
              </button>
            )}
          </div>
        </form>

        <div className="overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm">
          <div className="border-b border-orange-100 px-6 py-5">
            <h2 className="font-bold text-stone-900">
              Danh sách nguyên liệu
            </h2>

            <p className="mt-1 text-sm text-stone-500">
              {ingredients.length} nguyên liệu
            </p>
          </div>

          {loading && (
            <div className="p-8 text-stone-500">
              Đang tải nguyên liệu...
            </div>
          )}

          {!loading &&
            ingredients.length === 0 && (
              <div className="p-8 text-stone-500">
                Chưa có nguyên liệu nào.
              </div>
            )}

          {!loading &&
            ingredients.length > 0 && (
              <div className="divide-y divide-stone-100">
                {ingredients.map(
                  (ingredient) => (
                    <div
                      key={ingredient.id}
                      className="flex items-center justify-between gap-5 px-6 py-5"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-stone-900">
                          {
                            ingredient.name
                          }
                        </p>

                        <p className="mt-1 text-xs text-stone-400">
                          {
                            ingredient.slug
                          }
                        </p>

                        {ingredient.description && (
                          <p className="mt-2 text-sm text-stone-500">
                            {
                              ingredient.description
                            }
                          </p>
                        )}
                      </div>

                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            startEdit(
                              ingredient,
                            )
                          }
                          className="rounded-lg border border-orange-200 px-3 py-2 text-sm font-medium text-orange-600 hover:bg-orange-50"
                        >
                          Sửa
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            void deleteIngredient(
                              ingredient,
                            )
                          }
                          className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}