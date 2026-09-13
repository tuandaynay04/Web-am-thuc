import type { Recipe } from '@/types/recipe';
import { RecipeCard } from './recipe-card';

type RecipeGridProps = {
  recipes: Recipe[];
};

export function RecipeGrid({
  recipes,
}: RecipeGridProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
        />
      ))}
    </div>
  );
}