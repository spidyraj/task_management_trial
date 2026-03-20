'use client';

import Sidebar from '../components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-black">
      <Sidebar />
      <div className="flex-1 overflow-auto bg-black">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
