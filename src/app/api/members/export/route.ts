import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import QRCode from 'qrcode';

const API_URL = process.env.API_URL || 'http://localhost:3000';
const FRONT_URL = process.env.NEXT_PUBLIC_FRONT_URL || 'http://localhost:3003';

const HEADERS = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: '이름' },
  { key: 'age', label: '나이' },
  { key: 'nation', label: '국적' },
  { key: 'parish', label: '본당' },
  { key: 'cathedral', label: '성당' },
  { key: 'chosenDiocese', label: '선택 교구' },
  { key: 'region', label: '지역' },
  { key: 'phone', label: '연락처' },
  { key: 'emergencyNum', label: '비상 연락처' },
];

const QR_SIZE = 80; // px — 셀 안에 들어갈 QR 이미지 크기

async function fetchAllMembers(accessToken: string, filterParams: URLSearchParams) {
  const PAGE_SIZE = 100;
  const all: Record<string, unknown>[] = [];
  let pageIndex = 0;

  while (true) {
    const qs = new URLSearchParams(filterParams);
    qs.set('pageIndex', String(pageIndex));
    qs.set('pageSize', String(PAGE_SIZE));

    const res = await fetch(`${API_URL}/members?${qs.toString()}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`멤버 목록 조회 실패 (${res.status}): ${body}`);
    }
    const json = await res.json();
    all.push(...(json.data as Record<string, unknown>[]));
    if (all.length >= json.meta.totalCount) break;
    pageIndex++;
  }

  return all;
}

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken')?.value;
  if (!accessToken) {
    return NextResponse.json({ message: '인증이 필요합니다.' }, { status: 401 });
  }

  // 필터 파라미터 (name, parish, cathedral, chosenDiocese, region)
  const filterParams = new URLSearchParams();
  ['name', 'parish', 'cathedral', 'chosenDiocese', 'region'].forEach((key) => {
    const val = request.nextUrl.searchParams.get(key);
    if (val) filterParams.set(key, val);
  });

  let members: Record<string, unknown>[];
  try {
    members = await fetchAllMembers(accessToken, filterParams);
  } catch (e) {
    console.error('[export] fetchAllMembers error:', e);
    return NextResponse.json(
      { message: e instanceof Error ? e.message : '오류가 발생했습니다.' },
      { status: 500 },
    );
  }

  let workbook: ExcelJS.Workbook;
  try {
    // Workbook 생성
    workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('멤버 목록');

  const ROW_HEIGHT = QR_SIZE * 0.75; // Excel 행 높이 단위(pt) 변환

  // 헤더 행
  const headerRow = sheet.addRow([
    ...HEADERS.map((h) => h.label),
    'QR 코드',
  ]);
  headerRow.font = { bold: true };
  headerRow.height = 20;

  // 컬럼 너비 설정
  HEADERS.forEach((_, i) => {
    sheet.getColumn(i + 1).width = i === 0 ? 10 : 16;
  });
  sheet.getColumn(HEADERS.length + 1).width = QR_SIZE / 6; // QR 컬럼

  // 데이터 행 + QR 이미지 삽입
  for (let i = 0; i < members.length; i++) {
    const member = members[i];
    const rowNum = i + 2; // 헤더가 1행

    const row = sheet.addRow(HEADERS.map((h) => member[h.key] ?? ''));
    row.height = ROW_HEIGHT;

    // QR PNG 생성 (Buffer)
    const qrUrl = `${FRONT_URL}/?id=${member.id}`;
    const qrBuffer = await QRCode.toBuffer(qrUrl, {
      width: QR_SIZE,
      margin: 1,
      color: { dark: '#18181b', light: '#ffffff' },
    });

    const imageId = workbook.addImage({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      buffer: qrBuffer as any,
      extension: 'png',
    });

    // tl: top-left 셀 (0-based), QR 컬럼은 HEADERS.length (0-based)
    sheet.addImage(imageId, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tl: { col: HEADERS.length, row: rowNum - 1 } as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      br: { col: HEADERS.length + 1, row: rowNum } as any,
    });
  }

    // Buffer 직렬화
    const buffer = await workbook.xlsx.writeBuffer();

    const today = new Date().toISOString().slice(0, 10);
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="members-${today}.xlsx"`,
      },
    });
  } catch (e) {
    console.error('[export] excel generation error:', e);
    return NextResponse.json(
      { message: e instanceof Error ? e.message : 'Excel 생성 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
