'use client';

import {
  FormEvent,
  useEffect,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';

import {
  apiFetch,
  authApiFetch,
} from '@/lib/api';

type Category = {
  id: number;
  name: string;
};

type Ingredient = {
  id: number;
  name: string;
};

type IngredientRow = {
  ingredientId: string;
  quantity: string;
  unit: string;
  note: string;
};

type StepRow = {
  stepNumber: number;
  instruction: string;
};

export function RecipeForm() {
  const router = useRouter();

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [ingredients, setIngredients] =
    useState<Ingredient[]>([]);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] =
    useState('');

  const [categoryId, setCategoryId] =
    useState('');

  const [servings, setServings] =
    useState('2');

  const [prepMinutes, setPrepMinutes] =
    useState('10');

  const [cookMinutes, setCookMinutes] =
    useState('15');

  const [difficulty, setDifficulty] =
    useState('EASY');

  const [status, setStatus] =
    useState('PUBLISHED');

  const [ingredientRows, setIngredientRows] =
    useState<IngredientRow[]>([
      {
        ingredientId: '',
        quantity: '',
        unit: 'g',
        note: '',
      },
    ]);

  const [steps, setSteps] =
    useState<StepRow[]>([
      {
        stepNumber: 1,
        instruction: '',
      },
    ]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    async function loadOptions() {
      try {
        const [
          categoryData,
          ingredientData,
        ] = await Promise.all([
          apiFetch<Category[]>(
            '/categories',
          ),
          apiFetch<Ingredient[]>(
            '/ingredients',
          ),
        ]);

        setCategories(categoryData);
        setIngredients(ingredientData);
      } catch {
        setError(
          'Không thể tải danh mục hoặc nguyên liệu',
        );
      }
    }

    void loadOptions();
  }, []);

  function generateSlug(value: string) {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(
        /[\u0300-\u036f]/g,
        '',
      )
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function changeTitle(value: string) {
    setTitle(value);
    setSlug(generateSlug(value));
  }

  function addIngredientRow() {
    setIngredientRows((rows) => [
      ...rows,
      {
        ingredientId: '',
        quantity: '',
        unit: 'g',
        note: '',
      },
    ]);
  }

  function removeIngredientRow(
    index: number,
  ) {
    setIngredientRows((rows) =>
      rows.filter(
        (_, rowIndex) =>
          rowIndex !== index,
      ),
    );
  }

  function updateIngredientRow(
    index: number,
    field: keyof IngredientRow,
    value: string,
  ) {
    setIngredientRows((rows) =>
      rows.map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...row,
              [field]: value,
            }
          : row,
      ),
    );
  }

  function addStep() {
    setSteps((current) => [
      ...current,
      {
        stepNumber:
          current.length + 1,
        instruction: '',
      },
    ]);
  }

  function removeStep(index: number) {
    setSteps((current) =>
      current
        .filter(
          (_, stepIndex) =>
            stepIndex !== index,
        )
        .map((step, stepIndex) => ({
          ...step,
          stepNumber:
            stepIndex + 1,
        })),
    );
  }

  function updateStep(
    index: number,
    value: string,
  ) {
    setSteps((current) =>
      current.map(
        (step, stepIndex) =>
          stepIndex === index
            ? {
                ...step,
                instruction:
                  value,
              }
            : step,
      ),
    );
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setLoading(true);
    setError(null);

    try {
      await authApiFetch(
        '/recipes',
        {
          method: 'POST',

          body: JSON.stringify({
            title: title.trim(),
            slug: slug.trim(),
            description:
              description.trim() ||
              undefined,

            servings:
              Number(servings),

            prepMinutes:
              prepMinutes
                ? Number(prepMinutes)
                : undefined,

            cookMinutes:
              cookMinutes
                ? Number(cookMinutes)
                : undefined,

            difficulty,
            status,

            categoryId:
              Number(categoryId),

            ingredients:
              ingredientRows.map(
                (row) => ({
                  ingredientId:
                    Number(
                      row.ingredientId,
                    ),

                  quantity:
                    row.quantity
                      ? Number(
                          row.quantity,
                        )
                      : undefined,

                  unit:
                    row.unit.trim(),

                  note:
                    row.note.trim() ||
                    undefined,
                }),
              ),

            steps: steps.map(
              (step) => ({
                stepNumber:
                  step.stepNumber,

                instruction:
                  step.instruction.trim(),
              }),
            ),
          }),
        },
      );

      router.push(
        '/admin/recipes',
      );

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Không thể tạo món ăn',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      <section className="rounded-3xl border border-orange-100 bg-white p-7 shadow-sm">
        <h2 className="text-xl font-bold text-stone-900">
          Thông tin món ăn
        </h2>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium">
              Tên món
            </label>

            <input
              value={title}
              onChange={(event) =>
                changeTitle(
                  event.target.value,
                )
              }
              required
              className="w-full rounded-xl border border-orange-100 px-4 py-3"
              placeholder="Ví dụ: Gà xào sả ớt"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Slug
            </label>

            <input
              value={slug}
              onChange={(event) =>
                setSlug(
                  event.target.value,
                )
              }
              required
              className="w-full rounded-xl border border-orange-100 px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Danh mục
            </label>

            <select
              value={categoryId}
              onChange={(event) =>
                setCategoryId(
                  event.target.value,
                )
              }
              required
              className="w-full rounded-xl border border-orange-100 px-4 py-3"
            >
              <option value="">
                Chọn danh mục
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={
                      category.id
                    }
                    value={
                      category.id
                    }
                  >
                    {category.name}
                  </option>
                ),
              )}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium">
              Mô tả
            </label>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value,
                )
              }
              rows={4}
              className="w-full rounded-xl border border-orange-100 px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Khẩu phần
            </label>

            <input
              type="number"
              min="1"
              value={servings}
              onChange={(event) =>
                setServings(
                  event.target.value,
                )
              }
              required
              className="w-full rounded-xl border border-orange-100 px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Độ khó
            </label>

            <select
              value={difficulty}
              onChange={(event) =>
                setDifficulty(
                  event.target.value,
                )
              }
              className="w-full rounded-xl border border-orange-100 px-4 py-3"
            >
              <option value="EASY">
                Dễ
              </option>
              <option value="MEDIUM">
                Trung bình
              </option>
              <option value="HARD">
                Khó
              </option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Chuẩn bị (phút)
            </label>

            <input
              type="number"
              min="0"
              value={prepMinutes}
              onChange={(event) =>
                setPrepMinutes(
                  event.target.value,
                )
              }
              className="w-full rounded-xl border border-orange-100 px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Nấu (phút)
            </label>

            <input
              type="number"
              min="0"
              value={cookMinutes}
              onChange={(event) =>
                setCookMinutes(
                  event.target.value,
                )
              }
              className="w-full rounded-xl border border-orange-100 px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Trạng thái
            </label>

            <select
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value,
                )
              }
              className="w-full rounded-xl border border-orange-100 px-4 py-3"
            >
              <option value="DRAFT">
                Bản nháp
              </option>
              <option value="PUBLISHED">
                Công khai
              </option>
              <option value="ARCHIVED">
                Lưu trữ
              </option>
            </select>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-orange-100 bg-white p-7 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">
            Nguyên liệu
          </h2>

          <button
            type="button"
            onClick={addIngredientRow}
            className="rounded-xl border border-orange-200 px-4 py-2 text-sm font-semibold text-orange-600"
          >
            + Thêm nguyên liệu
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {ingredientRows.map(
            (row, index) => (
              <div
                key={index}
                className="grid gap-3 rounded-2xl bg-orange-50/50 p-4 md:grid-cols-12"
              >
                <select
                  value={
                    row.ingredientId
                  }
                  onChange={(event) =>
                    updateIngredientRow(
                      index,
                      'ingredientId',
                      event.target
                        .value,
                    )
                  }
                  required
                  className="rounded-xl border bg-white px-3 py-3 md:col-span-4"
                >
                  <option value="">
                    Chọn nguyên liệu
                  </option>

                  {ingredients.map(
                    (ingredient) => (
                      <option
                        key={
                          ingredient.id
                        }
                        value={
                          ingredient.id
                        }
                      >
                        {
                          ingredient.name
                        }
                      </option>
                    ),
                  )}
                </select>

                <input
                  type="number"
                  step="any"
                  min="0"
                  value={row.quantity}
                  onChange={(event) =>
                    updateIngredientRow(
                      index,
                      'quantity',
                      event.target
                        .value,
                    )
                  }
                  placeholder="Số lượng"
                  className="rounded-xl border bg-white px-3 py-3 md:col-span-2"
                />

                <input
                  value={row.unit}
                  onChange={(event) =>
                    updateIngredientRow(
                      index,
                      'unit',
                      event.target
                        .value,
                    )
                  }
                  placeholder="g / ml..."
                  required
                  className="rounded-xl border bg-white px-3 py-3 md:col-span-2"
                />

                <input
                  value={row.note}
                  onChange={(event) =>
                    updateIngredientRow(
                      index,
                      'note',
                      event.target
                        .value,
                    )
                  }
                  placeholder="Ghi chú"
                  className="rounded-xl border bg-white px-3 py-3 md:col-span-3"
                />

                <button
                  type="button"
                  disabled={
                    ingredientRows.length ===
                    1
                  }
                  onClick={() =>
                    removeIngredientRow(
                      index,
                    )
                  }
                  className="rounded-xl border border-red-200 px-3 py-3 text-red-600 disabled:opacity-30 md:col-span-1"
                >
                  ×
                </button>
              </div>
            ),
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-orange-100 bg-white p-7 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">
            Các bước thực hiện
          </h2>

          <button
            type="button"
            onClick={addStep}
            className="rounded-xl border border-orange-200 px-4 py-2 text-sm font-semibold text-orange-600"
          >
            + Thêm bước
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {steps.map(
            (step, index) => (
              <div
                key={index}
                className="flex gap-4 rounded-2xl bg-orange-50/50 p-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500 font-bold text-white">
                  {step.stepNumber}
                </div>

                <textarea
                  value={
                    step.instruction
                  }
                  onChange={(event) =>
                    updateStep(
                      index,
                      event.target
                        .value,
                    )
                  }
                  required
                  rows={3}
                  placeholder="Mô tả bước thực hiện..."
                  className="min-w-0 flex-1 rounded-xl border bg-white px-4 py-3"
                />

                <button
                  type="button"
                  disabled={
                    steps.length === 1
                  }
                  onClick={() =>
                    removeStep(index)
                  }
                  className="h-10 rounded-xl border border-red-200 px-3 text-red-600 disabled:opacity-30"
                >
                  ×
                </button>
              </div>
            ),
          )}
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() =>
            router.back()
          }
          className="rounded-xl border border-stone-200 bg-white px-5 py-3 font-semibold text-stone-600"
        >
          Hủy
        </button>

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:opacity-50"
        >
          {loading
            ? 'Đang lưu...'
            : 'Tạo món ăn'}
        </button>
      </div>
    </form>
  );
}