import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchMenuBySlug } from "@/lib/fetch-menu";
import { MenuBrowser } from "@/components/customer/menu-browser";
import { WelcomeGate } from "@/components/customer/welcome-gate";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ table?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await fetchMenuBySlug(slug);
  if (!data) return { title: "Menu" };
  return {
    title: `${data.restaurant.name} - Menu`,
    description: data.restaurant.description ?? `Menu for ${data.restaurant.name}`,
  };
}

export default async function MenuPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { table } = await searchParams;

  const data = await fetchMenuBySlug(slug, table);
  if (!data) notFound();

  if (data.categories.length === 0 || data.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <h1 className="text-xl font-bold mb-2">{data.restaurant.name}</h1>
          <p className="text-muted-foreground">
            This menu is still being set up. Please check back soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <WelcomeGate
      restaurantName={data.restaurant.name}
      tableNumber={data.table?.table_number ?? null}
    >
      <MenuBrowser
        restaurant={data.restaurant}
        categories={data.categories}
        items={data.items}
        table={data.table}
      />
    </WelcomeGate>
  );
}
