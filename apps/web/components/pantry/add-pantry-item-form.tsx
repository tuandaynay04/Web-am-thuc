'use client';

import {
  FormEvent,
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
};

type AddPantryItemFormProps = {
  onAdded: () => void;
};

export function AddPantryItemForm({
  onAdded,
}: AddPantryItemFormProps) {
  const [ingredients, setIngredients] =
    useState<Ingredient[]>([]);

  const [ingredientId, setIngredientId] =
    useState('');

  const [quantity, setQuantity] =
    useState('');

  const [unit, setUnit] =
    useState('');

  const [expiresAt, setExpiresAt] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    async function loadIngredients() {
      try {
        const data =
          await apiFetch<Ingredient[]>(
            '/ingredients',
          );

        setIngredients(data);
      } catch {
        setError(
          'Không thể tải danh sách nguyên liệu',
        );
      }
    }

    void loadIngredients();
  }, []);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!ingredientId) {
      setError('Hãy chọn nguyên liệu');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await authApiFetch('/pantry', {
        method: 'POST',
        body: JSON.stringify({
          ingredientId: Number(ingredientId),

          quantity:
            quantity === ''
              ? undefined
              : Number(quantity),

          unit:
            unit.trim() === ''
              ? undefined
              : unit.trim(),

          expiresAt:
            expiresAt === ''
              ? undefined
              : expiresAt,
        }),
      });

      setIngredientId('');
      setQuantity('');
      setUnit('');
      setExpiresAt('');

      onAdded();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Không thể thêm nguyên liệu',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border p-6"
    >
      <h2 className="text-xl font-bold">
        Thêm nguyên liệu
      </h2>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div>
          <label
            htmlFor="ingredient"
            className="mb-2 block text-sm font-medium"
          >
            Nguyên liệu
          </label>

          <select
            id="ingredient"
            value={ingredientId}
            onChange={(event) =>
              setIngredientId(
                event.target.value,
              )
            }
            required
            className="w-full rounded-xl border px-4 py-3"
          >
            <option value="">
              Chọn nguyên liệu
            </option>

            {ingredients.map(
              (ingredient) => (
                <option
                  key={ingredient.id}
                  value={ingredient.id}
                >
                  {ingredient.name}
                </option>
              ),
            )}
          </select>
        </div>

        <div>
          <label
            htmlFor="quantity"
            className="mb-2 block text-sm font-medium"
          >
            Số lượng
          </label>

          <input
            id="quantity"
            type="number"
            min="0"
            step="any"
            value={quantity}
            onChange={(event) =>
              setQuantity(event.target.value)
            }
            className="w-full rounded-xl border px-4 py-3"
            placeholder="Ví dụ: 500"
          />
        </div>

        <div>
          <label
            htmlFor="unit"
            className="mb-2 block text-sm font-medium"
          >
            Đơn vị
          </label>

          <input
            id="unit"
            type="text"
            value={unit}
            onChange={(event) =>
              setUnit(event.target.value)
            }
            className="w-full rounded-xl border px-4 py-3"
            placeholder="g, kg, ml..."
          />
        </div>

        <div>
          <label
            htmlFor="expiresAt"
            className="mb-2 block text-sm font-medium"
          >
            Hạn sử dụng
          </label>

          <input
            id="expiresAt"
            type="date"
            value={expiresAt}
            onChange={(event) =>
              setExpiresAt(
                event.target.value,
              )
            }
            className="w-full rounded-xl border px-4 py-3"
          />
        </div>
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-5 rounded-xl bg-black px-5 py-3 font-medium text-white disabled:opacity-50"
      >
        {loading
          ? 'Đang thêm...'
          : 'Thêm vào bếp'}
      </button>
    </form>
  );
}