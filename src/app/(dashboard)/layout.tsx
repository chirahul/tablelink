import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSuperAdmin } from "@/lib/is-super-admin";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const cookieStore = await cookies();
  const initialCollapsed = cookieStore.get("sidebar_collapsed")?.value === "1";
  const superAdmin = await isSuperAdmin();

  return (
    <DashboardShell
      userEmail={user.email ?? null}
      initialCollapsed={initialCollapsed}
      isSuperAdmin={superAdmin}
    >
      {children}
    </DashboardShell>
  );
}
