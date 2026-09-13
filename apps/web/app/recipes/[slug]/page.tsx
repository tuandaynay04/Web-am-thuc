import Link from 'next/link';
import { FavoriteButton } from '@/components/recipes/favorite-button';
import { notFound } from 'next/navigation';
import { ReviewsSection } from '@/components/reviews/reviews-section';

import { apiFetch } from '@/lib/api';
import type { Recipe } from '@/types/recipe';

type RecipeDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function RecipeDetailPage({
  params,
}: RecipeDetailPageProps) {
  const { slug } = await params;

  let recipe: Recipe;

  try {
    recipe = await apiFetch<Recipe>(
      `/recipes/slug/${encodeURIComponent(slug)}`,
    );
  } catch {
    notFound();
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-10">
      <Link
        href="/"
        className="text-sm font-medium underline"
      >
        ← Quay lại danh sách món
      </Link>

      <section className="mt-8">
        <p className="text-sm font-medium text-gray-500">
          {recipe.category.name}
        </p>

        <h1 className="mt-2 text-4xl font-bold">
          {recipe.title}
        </h1>

        {recipe.description && (
          <p className="mt-4 text-lg text-gray-600">
            {recipe.description}
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-4 text-sm">
          <span>
            Khẩu phần: {recipe.servings}
          </span>

          <span>
            Chuẩn bị: {recipe.prepMinutes ?? 0} phút
          </span>

          <span>
            Nấu: {recipe.cookMinutes ?? 0} phút
          </span>

          <span>
            Độ khó: {recipe.difficulty}
          </span>
        </div>
            <div className="mt-6">
    <FavoriteButton
        recipeId={recipe.id}
    />
</div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold">
          Nguyên liệu
        </h2>

        <div className="mt-5 space-y-3">
          {recipe.ingredients.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-6 rounded-xl border p-4"
            >
              <div>
                <p className="font-medium">
                  {item.ingredient.name}
                </p>

                {item.note && (
                  <p className="mt-1 text-sm text-gray-500">
                    {item.note}
                  </p>
                )}
              </div>

              <p className="shrink-0 font-medium">
                {item.quantity ?? ''}
                {item.unit ? ` ${item.unit}` : ''}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold">
          Các bước thực hiện
        </h2>

        <div className="mt-6 space-y-6">
          {recipe.steps.map((step) => (
            <article
              key={step.id}
              className="flex gap-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border font-bold">
                {step.stepNumber}
              </div>

              <div className="pt-2">
                <p>{step.instruction}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <ReviewsSection
  recipeId={recipe.id}
/>
    </main>
  );
}