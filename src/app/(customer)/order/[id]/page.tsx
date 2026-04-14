type Props = {
  params: Promise<{ id: string }>;
};

export default async function OrderTrackingPage({ params }: Props) {
  const { id } = await params;

  return (
    <div className="container mx-auto px-4 py-6 max-w-lg">
      <h1 className="text-2xl font-bold mb-4">Order Tracking</h1>
      <p className="text-muted-foreground">Order ID: {id}</p>
      <div className="text-center text-muted-foreground py-12">
        Live order status will be displayed here
      </div>
    </div>
  );
}
