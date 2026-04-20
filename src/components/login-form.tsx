"use client";

import { useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import type { DioceseConfig } from "@/config/dioceses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function getSafeRedirect(from: string | null, fallback: string): string {
  if (!from) return fallback;
  if (from.startsWith("/") && !from.startsWith("//") && !from.includes(":")) {
    return from;
  }
  return fallback;
}

function LoginFormInner({ diocese }: { diocese: DioceseConfig }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password, diocese.code);
      const fallback = `/${diocese.code}/members`;
      const redirectTo = getSafeRedirect(searchParams.get("from"), fallback);
      router.push(redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">DID DB Admin</CardTitle>
          <p className="text-sm text-muted-foreground">{diocese.loginSubtitle}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">아이디</Label>
              <Input
                id="username"
                type="text"
                placeholder="아이디 입력"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="비밀번호 입력"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Spinner size="sm" className="border-white border-t-transparent" /> : "로그인"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <AlertDialog open={!!error} onOpenChange={(open) => !open && setError("")}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>로그인 실패</AlertDialogTitle>
            <AlertDialogDescription>{error}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setError("")}>확인</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function LoginForm({ diocese }: { diocese: DioceseConfig }) {
  return (
    <Suspense>
      <LoginFormInner diocese={diocese} />
    </Suspense>
  );
}
