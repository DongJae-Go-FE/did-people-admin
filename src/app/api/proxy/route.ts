import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:3000';

async function handler(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('path');
  if (!path) {
    return NextResponse.json({ message: 'path 파라미터 필요' }, { status: 400 });
  }

  const accessToken = request.cookies.get('accessToken')?.value;

  // body가 있는 경우 그대로 전달
  let body: string | undefined;
  const method = request.method;
  if (method !== 'GET' && method !== 'HEAD') {
    body = await request.text();
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body || undefined,
  });

  const data = await res.text();

  return new NextResponse(data, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const DELETE = handler;
