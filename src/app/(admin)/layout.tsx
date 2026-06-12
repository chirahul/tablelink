// Pass-through layout for the /admin segment. The gate + control-panel chrome
// live in admin/(panel)/layout.tsx, so /admin/login can render un-gated.
export default function AdminSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
