import { RecipeGrid } from '@/components/recipes/recipe-grid';
import { apiFetch } from '@/lib/api';
import type { Recipe } from '@/types/recipe';

export default async function HomePage() {
  const recipes =
    await apiFetch<Recipe[]>('/recipes');

  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-7xl px-6 pb-10 pt-16">
        <div className="max-w-3xl">
          <span className="inline-flex rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-700">
            🍜 Công thức cho mọi căn bếp
          </span>

          <h1 className="mt-6 text-5xl font-bold leading-tight text-stone-900">
            Nấu ngon hơn,
            <span className="text-orange-500">
              {' '}dễ dàng hơn
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-600">
            Khám phá công thức, quản lý nguyên liệu trong bếp
            và tìm món phù hợp với những gì bạn đang có.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-orange-500">
              Khám phá
            </p>

            <h2 className="mt-2 text-3xl font-bold text-stone-900">
              Món ăn nổi bật
            </h2>
          </div>

          <p className="text-sm text-stone-500">
            {recipes.length} công thức
          </p>
        </div>

        <RecipeGrid recipes={recipes} />
      </section>
    </main>
  );
}