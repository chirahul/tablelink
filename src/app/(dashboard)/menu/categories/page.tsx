import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentRestaurant } from "@/lib/get-current-restaurant";
import { CategoriesManager } from "./categories-manager";
import type { Category } from "@/lib/types";

export const metadata: Metadata = {
  title: "Categories",
};

export default async function CategoriesPage() {
  const restaurant = await getCurrentRestaurant();
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .order("sort_order", { ascending: true });

  return (
    <div>
      <Link
        href="/menu"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
      >
        <ArrowLeft className="w-3 h-3" /> Back to menu
      </Link>
      <h1 className="text-2xl font-bold mb-1">Categories</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Group your menu items into categories like Starters, Mains, Beverages.
      </p>
      <CategoriesManager categories={(categories ?? []) as Category[]} />
    </div>
  );
}
