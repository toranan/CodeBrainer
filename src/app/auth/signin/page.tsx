"use client";

import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const providers = [
  { id: "google", name: "Google" },
  { id: "azure-ad", name: "Microsoft" },
];

export default function SignInPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-12">
      <Card className="w-full max-w-md border-primary/20 shadow-lg">
        <CardHeader className="space-y-3 text-center">
          <CardTitle className="text-2xl font-semibold text-slate-900">
            CodeBrainer 로그인
          </CardTitle>
          <CardDescription className="text-sm text-slate-600">
            Google 또는 Microsoft 계정으로 로그인해 진행 상황을 저장하세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {providers.map((provider) => (
            <Button
              key={provider.id}
              className="w-full"
              onClick={() => signIn(provider.id, { callbackUrl })}
            >
              {provider.name} 계정으로 로그인
            </Button>
          ))}
          <div className="pt-2 text-center text-sm text-muted-foreground">
            <Link href="/" className="text-primary hover:underline">
              메인으로 돌아가기
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

