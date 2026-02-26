import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:3000';

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken')?.value;

  // 백엔드에 토큰 무효화 요청 (실패해도 쿠키는 삭제)
  if (accessToken) {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    }).catch(() => {});
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.delete('accessToken');
  response.cookies.delete('refreshToken');
  return response;
}
