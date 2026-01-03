'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';

export default function DemoMembershipsPage() {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
      <DashboardLayout title="Demo Üyelikleri">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-slate-900">Demo Üyelikleri</h1>
          <p className="text-slate-600 mt-2">Sayfa içeriği yakında eklenecek...</p>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
