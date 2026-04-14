import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ table?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Menu - ${slug}`,
  };
}

export default async function MenuPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { table } = await searchParams;

  return (
    <div className="container mx-auto px-4 py-6 max-w-lg">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Restaurant Menu</h1>
        <p className="text-muted-foreground text-sm">
          {slug} {table ? `- Table ${table}` : ""}
        </p>
      </div>
      <div className="text-center text-muted-foreground py-12">
        Menu will be loaded here
      </div>
    </div>
  );
}
