export type Category = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
};

export type Ingredient = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
};

export type RecipeIngredient = {
  id: number;
  ingredientId: number;
  quantity: string | null;
  unit: string | null;
  note: string | null;
  ingredient: Ingredient;
};

export type RecipeStep = {
  id: number;
  stepNumber: number;
  instruction: string;
  imageUrl: string | null;
};

export type Recipe = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  servings: number;
  prepMinutes: number | null;
  cookMinutes: number | null;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  category: Category;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
};