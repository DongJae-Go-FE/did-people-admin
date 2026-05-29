import { NextRequest, NextResponse } from 'next/server';

// 함수 리전을 DB/백엔드(ap-southeast-1, 싱가포르)와 동일하게 고정 → admin↔백엔드 프록시 홉 단축
export const preferredRegion = 'sin1';

const API_URL = process.env.API_URL || 'http://localhost:3000';

async function handler(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('path');
  if (!path) {
    return NextResponse.json({ message: 'path 파라미터 필요' }, { status: 400 });
  }

  // host 변조(절대 URL, //host, @host, 역슬래시) 차단 — 토큰이 외부로 전송되는 것 방지.
  // 반드시 백엔드의 단일 슬래시 경로만 허용.
  if (!path.startsWith('/') || path.startsWith('//') || /[@\\]/.test(path)) {
    return NextResponse.json({ message: '잘못된 path' }, { status: 400 });
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
