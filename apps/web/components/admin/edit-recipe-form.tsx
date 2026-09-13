'use client';

import {
  FormEvent,
  useEffect,
  useState,
} from 'react';
import {
  useRouter,
} from 'next/navigation';

import {
  apiFetch,
  authApiFetch,
} from '@/lib/api';

type Category = {
  id: number;
  name: string;
};

type IngredientOption = {
  id: number;
  name: string;
};

type RecipeIngredient = {
  id: number;
  ingredientId: number;
  quantity: string | null;
  unit: string | null;
  note: string | null;
};

type RecipeStep = {
  id: number;
  stepNumber: number;
  instruction: string;
  imageUrl: string | null;
};

type RecipeDetail = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;

  servings: number;
  prepMinutes: number | null;
  cookMinutes: number | null;

  difficulty:
    | 'EASY'
    | 'MEDIUM'
    | 'HARD';

  status:
    | 'DRAFT'
    | 'PUBLISHED'
    | 'ARCHIVED';

  categoryId: number;

  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
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

type EditRecipeFormProps = {
  recipeId: number;
};

export function EditRecipeForm({
  recipeId,
}: EditRecipeFormProps) {
  const router = useRouter();

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [
    ingredientOptions,
    setIngredientOptions,
  ] = useState<IngredientOption[]>([]);

  const [title, setTitle] =
    useState('');

  const [slug, setSlug] =
    useState('');

  const [description, setDescription] =
    useState('');

  const [categoryId, setCategoryId] =
    useState('');

  const [servings, setServings] =
    useState('1');

  const [
    prepMinutes,
    setPrepMinutes,
  ] = useState('');

  const [
    cookMinutes,
    setCookMinutes,
  ] = useState('');

  const [
    difficulty,
    setDifficulty,
  ] = useState<
    'EASY' | 'MEDIUM' | 'HARD'
  >('EASY');

  const [status, setStatus] =
    useState<
      'DRAFT'
      | 'PUBLISHED'
      | 'ARCHIVED'
    >('DRAFT');

  const [
    ingredientRows,
    setIngredientRows,
  ] = useState<IngredientRow[]>([]);

  const [steps, setSteps] =
    useState<StepRow[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [
          recipe,
          categoryData,
          ingredientData,
        ] = await Promise.all([
          apiFetch<RecipeDetail>(
            `/recipes/${recipeId}`,
          ),

          apiFetch<Category[]>(
            '/categories',
          ),

          apiFetch<IngredientOption[]>(
            '/ingredients',
          ),
        ]);

        setCategories(categoryData);
        setIngredientOptions(
          ingredientData,
        );

        setTitle(recipe.title);
        setSlug(recipe.slug);

        setDescription(
          recipe.description ?? '',
        );

        setCategoryId(
          String(recipe.categoryId),
        );

        setServings(
          String(recipe.servings),
        );

        setPrepMinutes(
          recipe.prepMinutes === null
            ? ''
            : String(
                recipe.prepMinutes,
              ),
        );

        setCookMinutes(
          recipe.cookMinutes === null
            ? ''
            : String(
                recipe.cookMinutes,
              ),
        );

        setDifficulty(
          recipe.difficulty,
        );

        setStatus(recipe.status);

        setIngredientRows(
          recipe.ingredients.map(
            (item) => ({
              ingredientId:
                String(
                  item.ingredientId,
                ),

              quantity:
                item.quantity ?? '',

              unit:
                item.unit ?? '',

              note:
                item.note ?? '',
            }),
          ),
        );

        setSteps(
          [...recipe.steps]
            .sort(
              (a, b) =>
                a.stepNumber -
                b.stepNumber,
            )
            .map((step) => ({
              stepNumber:
                step.stepNumber,

              instruction:
                step.instruction,
            })),
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Không thể tải món ăn',
        );
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, [recipeId]);

  function addIngredient() {
    setIngredientRows(
      (current) => [
        ...current,
        {
          ingredientId: '',
          quantity: '',
          unit: 'g',
          note: '',
        },
      ],
    );
  }

  function updateIngredient(
    index: number,
    field: keyof IngredientRow,
    value: string,
  ) {
    setIngredientRows(
      (current) =>
        current.map(
          (item, itemIndex) =>
            itemIndex === index
              ? {
                  ...item,
                  [field]:
                    value,
                }
              : item,
        ),
    );
  }

  function removeIngredient(
    index: number,
  ) {
    setIngredientRows(
      (current) =>
        current.filter(
          (_, itemIndex) =>
            itemIndex !== index,
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

  function updateStep(
    index: number,
    instruction: string,
  ) {
    setSteps((current) =>
      current.map(
        (step, stepIndex) =>
          stepIndex === index
            ? {
                ...step,
                instruction,
              }
            : step,
      ),
    );
  }

  function removeStep(
    index: number,
  ) {
    setSteps((current) =>
      current
        .filter(
          (_, stepIndex) =>
            stepIndex !== index,
        )
        .map(
          (step, stepIndex) => ({
            ...step,
            stepNumber:
              stepIndex + 1,
          }),
        ),
    );
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      ingredientRows.length === 0
    ) {
      setError(
        'Món ăn phải có ít nhất một nguyên liệu',
      );
      return;
    }

    if (steps.length === 0) {
      setError(
        'Món ăn phải có ít nhất một bước thực hiện',
      );
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await authApiFetch(
        `/recipes/${recipeId}`,
        {
          method: 'PATCH',

          body: JSON.stringify({
            title: title.trim(),
            slug: slug.trim(),

            description:
              description.trim() ||
              undefined,

            servings:
              Number(servings),

            prepMinutes:
              prepMinutes === ''
                ? undefined
                : Number(
                    prepMinutes,
                  ),

            cookMinutes:
              cookMinutes === ''
                ? undefined
                : Number(
                    cookMinutes,
                  ),

            difficulty,
            status,

            categoryId:
              Number(categoryId),

            ingredients:
              ingredientRows.map(
                (item) => ({
                  ingredientId:
                    Number(
                      item.ingredientId,
                    ),

                  quantity:
                    item.quantity === ''
                      ? undefined
                      : Number(
                          item.quantity,
                        ),

                  unit:
                    item.unit.trim(),

                  note:
                    item.note.trim() ||
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
          : 'Không thể cập nhật món ăn',
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-orange-100 bg-white p-8 shadow-sm">
        Đang tải món ăn...
      </div>
    );
  }

  if (error && !title) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-600">
        {error}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      <section className="rounded-3xl border border-orange-100 bg-white p-7 shadow-sm">
        <h2 className="text-xl font-bold">
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
                setTitle(
                  event.target.value,
                )
              }
              required
              className="w-full rounded-xl border border-orange-100 px-4 py-3"
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
              {categories.map(
                (category) => (
                  <option
                    key={category.id}
                    value={category.id}
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
                  event.target
                    .value as
                    | 'EASY'
                    | 'MEDIUM'
                    | 'HARD',
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
              Chuẩn bị
            </label>

            <input
              type="number"
              min="1"
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
              Nấu
            </label>

            <input
              type="number"
              min="1"
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
                  event.target
                    .value as
                    | 'DRAFT'
                    | 'PUBLISHED'
                    | 'ARCHIVED',
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
            onClick={addIngredient}
            className="rounded-xl border border-orange-200 px-4 py-2 text-sm font-semibold text-orange-600"
          >
            + Thêm nguyên liệu
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {ingredientRows.map(
            (item, index) => (
              <div
                key={index}
                className="grid gap-3 rounded-2xl bg-orange-50/50 p-4 md:grid-cols-12"
              >
                <select
                  value={
                    item.ingredientId
                  }
                  onChange={(event) =>
                    updateIngredient(
                      index,
                      'ingredientId',
                      event.target.value,
                    )
                  }
                  required
                  className="rounded-xl border bg-white px-3 py-3 md:col-span-4"
                >
                  <option value="">
                    Chọn nguyên liệu
                  </option>

                  {ingredientOptions.map(
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
                  min="0"
                  step="any"
                  value={item.quantity}
                  onChange={(event) =>
                    updateIngredient(
                      index,
                      'quantity',
                      event.target.value,
                    )
                  }
                  placeholder="Số lượng"
                  className="rounded-xl border bg-white px-3 py-3 md:col-span-2"
                />

                <input
                  value={item.unit}
                  onChange={(event) =>
                    updateIngredient(
                      index,
                      'unit',
                      event.target.value,
                    )
                  }
                  placeholder="Đơn vị"
                  required
                  className="rounded-xl border bg-white px-3 py-3 md:col-span-2"
                />

                <input
                  value={item.note}
                  onChange={(event) =>
                    updateIngredient(
                      index,
                      'note',
                      event.target.value,
                    )
                  }
                  placeholder="Ghi chú"
                  className="rounded-xl border bg-white px-3 py-3 md:col-span-3"
                />

                <button
                  type="button"
                  onClick={() =>
                    removeIngredient(
                      index,
                    )
                  }
                  disabled={
                    ingredientRows.length <=
                    1
                  }
                  className="rounded-xl border border-red-200 text-red-600 disabled:opacity-30 md:col-span-1"
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
                      event.target.value,
                    )
                  }
                  rows={3}
                  required
                  className="min-w-0 flex-1 rounded-xl border bg-white px-4 py-3"
                />

                <button
                  type="button"
                  onClick={() =>
                    removeStep(index)
                  }
                  disabled={
                    steps.length <= 1
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
          disabled={saving}
          className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white shadow-sm hover:bg-orange-600 disabled:opacity-50"
        >
          {saving
            ? 'Đang lưu...'
            : 'Lưu thay đổi'}
        </button>
      </div>
    </form>
  );
}