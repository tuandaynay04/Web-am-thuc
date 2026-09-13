import Link from 'next/link';

import type { Recipe } from '@/types/recipe';

type RecipeCardProps = {
  recipe: Recipe;
};

export function RecipeCard({
  recipe,
}: RecipeCardProps) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="flex aspect-[16/10] items-center justify-center bg-gradient-to-br from-orange-100 via-amber-50 to-yellow-100 text-6xl">
        🍲
      </div>

      <div className="p-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
            {recipe.category.name}
          </span>

          <span className="text-xs text-stone-400">
            {recipe.difficulty}
          </span>
        </div>

        <h2 className="text-xl font-bold text-stone-900 transition group-hover:text-orange-600">
          {recipe.title}
        </h2>

        <p className="mt-3 line-clamp-2 text-sm leading-6 text-stone-600">
          {recipe.description}
        </p>

        <div className="mt-5 flex items-center gap-4 text-sm text-stone-500">
          <span>
            ⏱ {recipe.prepMinutes ?? 0} phút
          </span>

          <span>
            🍳 {recipe.cookMinutes ?? 0} phút
          </span>
        </div>

        <Link
    href={`/recipes/${recipe.slug}`}
    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold !text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-600 hover:!text-white hover:shadow-md"
    >
    Xem công thức
    <span aria-hidden="true">
        →
    </span>
    </Link>
      </div>
    </article>
  );
}