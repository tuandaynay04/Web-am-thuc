import { RecipeForm } from '@/components/admin/recipe-form';

export default function NewRecipePage() {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-wider text-orange-500">
        Món ăn
      </p>

      <h1 className="mt-2 text-3xl font-bold text-stone-900">
        Thêm món ăn
      </h1>

      <p className="mt-2 text-stone-500">
        Tạo công thức mới để hiển thị trên website.
      </p>

      <div className="mt-8">
        <RecipeForm />
      </div>
    </div>
  );
}
