import { NextResponse } from "next/server";
import { listCategories } from "@/lib/services/category.service";

export async function GET() {
  const categories = await listCategories();
  return NextResponse.json(
    categories.map((c) => ({ slug: c.slug, name: c.name })),
  );
}
