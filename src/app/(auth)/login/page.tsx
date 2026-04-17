import type { Metadata } from "next";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Login",
};

type Props = {
  searchParams: Promise<{ confirmed?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { confirmed } = await searchParams;
  const showEmailNotice = confirmed === "check-email";

  return (
    <Card className="rounded-2xl shadow-lg border-0 bg-card/80 backdrop-blur-sm">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl tracking-tight">Welcome back</CardTitle>
        <CardDescription className="text-base">
          Login to manage your restaurant
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {showEmailNotice && (
          <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-sm text-blue-900">
            Account created! Please check your email to confirm, then log in.
          </div>
        )}
        <LoginForm />
      </CardContent>
      <CardFooter className="justify-center pt-2">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-foreground underline underline-offset-4">
            Register
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
