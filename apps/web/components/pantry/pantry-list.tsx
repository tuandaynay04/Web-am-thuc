'use client';

import {
  useCallback,
  useEffect,
  useState,
} from 'react';
import Link from 'next/link';

import { authApiFetch } from '@/lib/api';
import { AddPantryItemForm } from './add-pantry-item-form';

type PantryItem = {
  id: number;
  ingredientId: number;
  quantity: string | null;
  unit: string | null;
  expiresAt: string | null;

  ingredient: {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
  };
};

export function PantryList() {
  const [items, setItems] =
    useState<PantryItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [editQuantity, setEditQuantity] =
    useState('');

  const [editUnit, setEditUnit] =
    useState('');

  const [editExpiresAt, setEditExpiresAt] =
    useState('');

  const [saving, setSaving] =
    useState(false);

  const loadPantry = useCallback(
    async () => {
      try {
        setError(null);

        const data =
          await authApiFetch<PantryItem[]>(
            '/pantry/me',
          );

        setItems(data);
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
    void loadPantry();
  }, [loadPantry]);

  function startEdit(item: PantryItem) {
    setEditingId(item.id);

    setEditQuantity(
      item.quantity ?? '',
    );

    setEditUnit(
      item.unit ?? '',
    );

    setEditExpiresAt(
      item.expiresAt
        ? item.expiresAt.slice(0, 10)
        : '',
    );
  }

  function cancelEdit() {
    setEditingId(null);
    setEditQuantity('');
    setEditUnit('');
    setEditExpiresAt('');
  }

  async function saveEdit(id: number) {
    setSaving(true);
    setError(null);

    try {
      await authApiFetch(
        `/pantry/${id}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            quantity:
              editQuantity === ''
                ? undefined
                : Number(editQuantity),

            unit:
              editUnit.trim() === ''
                ? undefined
                : editUnit.trim(),

            expiresAt:
              editExpiresAt === ''
                ? undefined
                : editExpiresAt,
          }),
        },
      );

      cancelEdit();
      await loadPantry();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Không thể cập nhật nguyên liệu',
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteItem(
    id: number,
    ingredientName: string,
  ) {
    const confirmed =
      window.confirm(
        `Bạn có chắc muốn xóa "${ingredientName}" khỏi bếp không?`,
      );

    if (!confirmed) {
      return;
    }

    setError(null);

    try {
      await authApiFetch(
        `/pantry/${id}`,
        {
          method: 'DELETE',
        },
      );

      await loadPantry();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Không thể xóa nguyên liệu',
      );
    }
  }

  return (
    <div className="space-y-8">
      <AddPantryItemForm
        onAdded={() => {
          void loadPantry();
        }}
      />

      {loading && (
        <p className="text-gray-500">
          Đang tải nguyên liệu...
        </p>
      )}

      {!loading && error && (
        <div className="rounded-xl border p-5">
          <p className="text-red-600">
            {error}
          </p>

          <Link
            href="/login"
            className="mt-3 inline-block underline"
          >
            Đăng nhập
          </Link>
        </div>
      )}

      {!loading &&
        !error &&
        items.length === 0 && (
          <div className="rounded-xl border p-6">
            <p>
              Bếp của bạn chưa có nguyên liệu nào.
            </p>
          </div>
        )}

      {!loading &&
        !error &&
        items.length > 0 && (
          <div className="grid gap-4">
            {items.map((item) => {
              const isEditing =
                editingId === item.id;

              return (
                <article
                  key={item.id}
                  className="rounded-2xl border p-5"
                >
                  <div className="flex items-start justify-between gap-6">
                    <div>
                      <h2 className="text-lg font-semibold">
                        {item.ingredient.name}
                      </h2>

                      {item.ingredient.description && (
                        <p className="mt-1 text-sm text-gray-500">
                          {
                            item.ingredient
                              .description
                          }
                        </p>
                      )}

                      {!isEditing &&
                        item.expiresAt && (
                          <p className="mt-2 text-sm">
                            Hạn sử dụng:{' '}
                            {new Date(
                              item.expiresAt,
                            ).toLocaleDateString(
                              'vi-VN',
                            )}
                          </p>
                        )}
                    </div>

                    {!isEditing && (
                      <div className="shrink-0 text-lg font-semibold">
                        {item.quantity ?? '-'}{' '}
                        {item.unit ?? ''}
                      </div>
                    )}
                  </div>

                  {isEditing && (
                    <div className="mt-5 grid gap-4 md:grid-cols-3">
                      <div>
                        <label
                          htmlFor={`quantity-${item.id}`}
                          className="mb-2 block text-sm font-medium"
                        >
                          Số lượng
                        </label>

                        <input
                          id={`quantity-${item.id}`}
                          type="number"
                          min="0"
                          step="any"
                          value={editQuantity}
                          onChange={(event) =>
                            setEditQuantity(
                              event.target.value,
                            )
                          }
                          className="w-full rounded-xl border px-4 py-3"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor={`unit-${item.id}`}
                          className="mb-2 block text-sm font-medium"
                        >
                          Đơn vị
                        </label>

                        <input
                          id={`unit-${item.id}`}
                          type="text"
                          value={editUnit}
                          onChange={(event) =>
                            setEditUnit(
                              event.target.value,
                            )
                          }
                          className="w-full rounded-xl border px-4 py-3"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor={`expires-${item.id}`}
                          className="mb-2 block text-sm font-medium"
                        >
                          Hạn sử dụng
                        </label>

                        <input
                          id={`expires-${item.id}`}
                          type="date"
                          value={editExpiresAt}
                          onChange={(event) =>
                            setEditExpiresAt(
                              event.target.value,
                            )
                          }
                          className="w-full rounded-xl border px-4 py-3"
                        />
                      </div>
                    </div>
                  )}

                  <div className="mt-5 flex gap-3">
                    {!isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            startEdit(item)
                          }
                          className="rounded-lg border px-4 py-2 text-sm font-medium"
                        >
                          Sửa
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            void deleteItem(
                              item.id,
                              item.ingredient
                                .name,
                            )
                          }
                          className="rounded-lg border px-4 py-2 text-sm font-medium text-red-600"
                        >
                          Xóa
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() =>
                            void saveEdit(
                              item.id,
                            )
                          }
                          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                        >
                          {saving
                            ? 'Đang lưu...'
                            : 'Lưu'}
                        </button>

                        <button
                          type="button"
                          disabled={saving}
                          onClick={cancelEdit}
                          className="rounded-lg border px-4 py-2 text-sm font-medium"
                        >
                          Hủy
                        </button>
                      </>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
    </div>
  );
}