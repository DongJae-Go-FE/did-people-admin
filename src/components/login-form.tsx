"use client";

import { useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { getStoredUser } from "@/lib/auth";
import type { DioceseConfig } from "@/config/dioceses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

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
    if (loading) return; // 진행 중 재제출(엔터/더블클릭) 차단
    setError("");
    setLoading(true);
    try {
      // diocese.code는 'incheon' | 'jeju' | 'super' (login URL 기반)
      await login(username, password, diocese.code as 'incheon' | 'jeju' | 'super');
      // login() 이 saveUser 까지 마치므로 getStoredUser 가 최신값을 반환
      const fresh = getStoredUser();
      if (fresh?.isFirstLogin) {
        router.push('/change-password');
        return;
      }
      // /login/super는 master 전용 → /all/members로 진입, 그 외는 해당 region
      const fallback = diocese.code === 'super' ? '/all/members' : `/${diocese.code}/members`;
      const redirectTo = getSafeRedirect(searchParams.get("from"), fallback);
      router.push(redirectTo);
      // 성공 시 loading 유지 — 네비게이션 동안 버튼 비활성으로 재제출 방지
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.");
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
            {error && (
              <p role="alert" className="text-sm text-red-500">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Spinner size="sm" className="border-white border-t-transparent" /> : "로그인"}
            </Button>
          </form>
          <div className="mt-6 border-t pt-4 text-center text-xs text-muted-foreground">
            <p>비밀번호를 잊으셨거나 로그인 관련 문의는 아래 메일로 연락해주세요.</p>
            <a
              href="mailto:masterforce999@naver.com"
              className="mt-1 inline-block font-medium text-gray-700 hover:underline"
            >
              masterforce999@naver.com
            </a>
          </div>
        </CardContent>
      </Card>
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
