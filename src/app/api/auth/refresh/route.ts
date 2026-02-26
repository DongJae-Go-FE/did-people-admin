import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:3000';
const IS_PROD = process.env.NODE_ENV === 'production';

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get('refreshToken')?.value;

  if (!refreshToken) {
    return NextResponse.json({ message: 'refreshToken 없음' }, { status: 401 });
  }

  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  const data = await res.json();

  if (!res.ok) {
    // refresh 실패 시 쿠키 삭제
    const response = NextResponse.json(data, { status: res.status });
    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken');
    return response;
  }

  const response = NextResponse.json({ ok: true });

  response.cookies.set('accessToken', data.accessToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60,
  });

  response.cookies.set('refreshToken', data.refreshToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}
