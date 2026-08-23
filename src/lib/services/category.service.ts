import { getDataSource } from "@/lib/db/data-source";
import { Category } from "@/lib/db/entities/category.entity";

export async function listCategories(): Promise<Category[]> {
  const ds = await getDataSource();
  return ds.getRepository(Category).find({ order: { sortOrder: "ASC" } });
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const ds = await getDataSource();
  return ds.getRepository(Category).findOne({ where: { slug } });
}
