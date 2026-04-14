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
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Welcome back</CardTitle>
        <CardDescription>
          Login to manage your restaurant
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {showEmailNotice && (
          <div className="rounded-md bg-blue-50 border border-blue-200 p-3 text-sm text-blue-900">
            Account created! Please check your email to confirm, then log in.
          </div>
        )}
        <LoginForm />
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-foreground underline">
            Register
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
