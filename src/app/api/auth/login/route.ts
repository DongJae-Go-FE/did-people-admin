import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:3000';
const IS_PROD = process.env.NODE_ENV === 'production';

export async function POST(request: NextRequest) {
  const body = await request.json();

  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(data, { status: res.status });
  }

  const response = NextResponse.json({ user: data.user });

  // accessToken — 1시간
  response.cookies.set('accessToken', data.accessToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60,
  });

  // refreshToken — 30일
  response.cookies.set('refreshToken', data.refreshToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}
