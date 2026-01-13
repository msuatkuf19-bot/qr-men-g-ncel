'use client';

import { XCircle, Calendar, Phone, Mail } from 'lucide-react';

interface MembershipExpiredProps {
  restaurantName: string;
  membershipEndDate?: Date | string | null;
  contactPhone?: string;
  contactEmail?: string;
}

export default function MembershipExpired({
  restaurantName,
  membershipEndDate,
  contactPhone = '+90 555 123 4567',
  contactEmail = 'info@qrmenu.com',
}: MembershipExpiredProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Üyelik Süresi Doldu</h1>
          <p className="text-gray-600">
            {restaurantName} restoranının üyelik süresi sona ermiştir.
          </p>
        </div>

        {membershipEndDate && (
          <div className="bg-red-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-red-800">
              <Calendar className="w-5 h-5" />
              <span className="text-sm font-medium">
                Bitiş Tarihi: {new Date(membershipEndDate).toLocaleDateString('tr-TR')}
              </span>
            </div>
          </div>
        )}

        <div className="space-y-4 mb-6">
          <p className="text-sm text-gray-600">
            Menüye erişimi yeniden sağlamak için lütfen restoranla iletişime geçin veya üyeliği yenileyin.
          </p>
        </div>

        <div className="border-t border-gray-200 pt-6 space-y-3">
          <p className="text-sm font-medium text-gray-700">İletişim:</p>
          {contactPhone && (
            <a
              href={`tel:${contactPhone}`}
              className="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <Phone className="w-4 h-4" />
              <span className="text-sm">{contactPhone}</span>
            </a>
          )}
          {contactEmail && (
            <a
              href={`mailto:${contactEmail}`}
              className="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <Mail className="w-4 h-4" />
              <span className="text-sm">{contactEmail}</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
