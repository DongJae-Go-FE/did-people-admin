import { NextRequest, NextResponse } from 'next/server';

// 함수 리전을 DB/백엔드(ap-southeast-1, 싱가포르)와 동일하게 고정 → admin↔백엔드 홉 단축
export const preferredRegion = 'sin1';

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
