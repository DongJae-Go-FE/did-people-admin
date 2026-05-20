'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { changePassword } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

const MAX_LEN = 20;

export default function ChangePasswordPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 로그인되지 않은 상태로 접근 시 로그인으로 이동
  // (useSyncExternalStore 기반 user 는 SSR 에선 null, 클라이언트에선 즉시 실제값을 반환)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!user) router.replace('/login');
  }, [user, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!newPassword) {
      setError('새 비밀번호를 입력해주세요.');
      return;
    }
    if (newPassword === currentPassword) {
      setError('현재 비밀번호와 다른 비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      // 백엔드가 토큰을 무효화했으므로 클라이언트 상태도 정리 후 로그인 페이지로
      await logout();
      alert('비밀번호가 변경되었습니다. 새 비밀번호로 다시 로그인해주세요.');
      router.replace('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : '비밀번호 변경에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    // 최초 로그인 강제 변경 흐름에선 취소 = 로그아웃
    await logout();
    router.replace('/login');
  }

  const isForced = user?.isFirstLogin === true;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">비밀번호 변경</CardTitle>
          <p className="text-sm text-muted-foreground">
            {isForced
              ? '최초 로그인입니다. 비밀번호를 변경해야 서비스를 이용할 수 있습니다.'
              : '새 비밀번호로 변경합니다.'}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current">현재 비밀번호</Label>
              <Input
                id="current"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                maxLength={MAX_LEN}
                autoComplete="current-password"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new">바꿀 비밀번호</Label>
              <Input
                id="new"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                maxLength={MAX_LEN}
                autoComplete="new-password"
                required
              />
              <p className="text-xs text-gray-500">{newPassword.length} / {MAX_LEN}자</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">바꿀 비밀번호 확인</Label>
              <Input
                id="confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                maxLength={MAX_LEN}
                autoComplete="new-password"
                required
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? (
                  <Spinner size="sm" className="border-white border-t-transparent" />
                ) : (
                  '변경'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
              >
                {isForced ? '로그아웃' : '취소'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
