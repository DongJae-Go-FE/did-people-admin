'use client';

import { Sidebar } from '@/components/layout/sidebar';

export default function MembersLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
