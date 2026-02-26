'use client';

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';

interface MemberQrProps {
  memberId: string;
}

const FRONT_URL = process.env.NEXT_PUBLIC_FRONT_URL || 'http://localhost:3003';

export function MemberQr({ memberId }: MemberQrProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [url] = useState(`${FRONT_URL}/member.html?id=${memberId}`);

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, url, {
      width: 160,
      margin: 2,
      color: { dark: '#18181b', light: '#ffffff' },
    });
  }, [url]);

  function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `member-${memberId}-qr.png`;
    a.click();
  }

  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border bg-white p-6">
      <p className="text-sm font-medium text-gray-700">멤버 QR 코드</p>
      <canvas ref={canvasRef} className="rounded" />
      <p className="text-xs text-gray-400 break-all text-center max-w-45">{url}</p>
      <Button size="sm" variant="outline" onClick={handleDownload}>
        PNG 다운로드
      </Button>
    </div>
  );
}
