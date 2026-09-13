import { EditRecipeForm } from '@/components/admin/edit-recipe-form';

type EditRecipePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditRecipePage({
  params,
}: EditRecipePageProps) {
  const { id } = await params;

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-wider text-orange-500">
        Món ăn
      </p>

      <h1 className="mt-2 text-3xl font-bold text-stone-900">
        Chỉnh sửa món ăn
      </h1>

      <p className="mt-2 text-stone-500">
        Cập nhật thông tin, nguyên liệu và các bước nấu.
      </p>

      <div className="mt-8">
        <EditRecipeForm
          recipeId={Number(id)}
        />
      </div>
    </div>
  );
}