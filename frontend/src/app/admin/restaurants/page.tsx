'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import QrBox from '@/components/QrBox';
import { slugifyTR } from '@/utils/slugify';
import { Store, Plus, Pencil, Trash2, User, Phone, Mail, MapPin } from 'lucide-react';

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  owner: {
    name: string;
    email: string;
  };
  _count: {
    categories: number;
    qrCodes: number;
  };
  createdAt: string;
}

export default function AdminRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [showOwnerPassword, setShowOwnerPassword] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const [slugPreview, setSlugPreview] = useState('');
  const [slugCheck, setSlugCheck] = useState<
    | null
    | {
        loading: boolean;
        normalized: string;
        available?: boolean;
        suggestion?: string | null;
        error?: string;
      }
  >(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    ownerEmail: '',
    ownerName: '',
    ownerPassword: '',
    membershipStartDate: '',
    membershipEndDate: '',
  });

  useEffect(() => {
    loadRestaurants();
  }, []);

  useEffect(() => {
    if (!showModal) return;
    const normalized = slugifyTR(formData.slug);
    setSlugPreview(normalized);

    if (!normalized) {
      setSlugCheck(null);
      return;
    }

    let cancelled = false;
    setSlugCheck({ loading: true, normalized });

    const t = setTimeout(async () => {
      try {
        const url = new URL('/api/slug-check', window.location.origin);
        url.searchParams.set('slug', normalized);
        if (editingRestaurant?.id) url.searchParams.set('excludeId', editingRestaurant.id);
        const res = await fetch(url.toString(), { cache: 'no-store' });
        const json = await res.json().catch(() => null);

        if (cancelled) return;

        if (!json?.success) {
          setSlugCheck({ loading: false, normalized, error: json?.message || 'Kontrol edilemedi' });
          return;
        }

        setSlugCheck({
          loading: false,
          normalized: json.data?.slug || normalized,
          available: Boolean(json.data?.available),
          suggestion: json.data?.suggestion ?? null,
        });
      } catch (e) {
        if (cancelled) return;
        setSlugCheck({ loading: false, normalized, error: 'Kontrol edilemedi' });
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [formData.slug, showModal, editingRestaurant?.id]);

  const getClientBaseUrl = () => {
    const envBase = process.env.NEXT_PUBLIC_BASE_URL;
    if (envBase && envBase.trim()) return envBase.trim().replace(/\/$/, '');
    return window.location.origin;
  };

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getRestaurants();
      setRestaurants(response.data || []);
    } catch (error) {
      console.error('Restoranlar yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const normalizedSlug = slugifyTR(formData.slug);
      if (!normalizedSlug) {
        alert('Slug geçersiz');
        return;
      }

      if (slugCheck && slugCheck.normalized === normalizedSlug && slugCheck.available === false) {
        alert('Bu slug zaten kullanılıyor. Lütfen farklı bir slug seçin.');
        return;
      }

      // Üyelik tarihleri validasyonu (sadece yeni restoran oluştururken)
      if (!editingRestaurant) {
        if (!formData.membershipStartDate || !formData.membershipEndDate) {
          alert('Üyelik başlangıç ve bitiş tarihleri zorunludur');
          return;
        }

        const startDate = new Date(formData.membershipStartDate);
        const endDate = new Date(formData.membershipEndDate);

        if (endDate < startDate) {
          alert('Bitiş tarihi başlangıç tarihinden önce olamaz');
          return;
        }
      }

      if (editingRestaurant) {
        await apiClient.updateRestaurant(editingRestaurant.id, { ...formData, slug: normalizedSlug });
      } else {
        await apiClient.createRestaurant({ ...formData, slug: normalizedSlug });
      }
      setShowModal(false);
      resetForm();
      loadRestaurants();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Bir hata oluştu');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu restoranı silmek istediğinizden emin misiniz?')) return;
    try {
      await apiClient.deleteRestaurant(id);
      loadRestaurants();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Silinemedi');
    }
  };

  const openEditModal = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant);
    setSlugTouched(true);
    setSlugPreview(restaurant.slug);
    setFormData({
      name: restaurant.name,
      slug: restaurant.slug,
      description: restaurant.description || '',
      address: restaurant.address || '',
      phone: restaurant.phone || '',
      email: restaurant.email || '',
      ownerEmail: restaurant.owner.email,
      ownerName: restaurant.owner.name,
      ownerPassword: '',
      membershipStartDate: '',
      membershipEndDate: '',
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingRestaurant(null);
    setSlugTouched(false);
    setSlugPreview('');
    setSlugCheck(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      address: '',
      phone: '',
      email: '',
      ownerEmail: '',
      ownerName: '',
      ownerPassword: '',
      membershipStartDate: '',
      membershipEndDate: '',
    });
  };

  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
      <DashboardLayout>
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-900 ring-1 ring-inset ring-amber-300/70 shadow-sm">
                  <Store className="h-6 w-6" strokeWidth={1.9} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
                    Restoran Yönetimi
                  </h1>
                  <p className="mt-1 text-[13px] sm:text-[15px] text-slate-600">
                    Tüm restoranları yönetin, iletişim bilgilerini ve istatistikleri görüntüleyin
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="w-full sm:w-auto h-12 px-5 sm:px-6 rounded-xl bg-primary-600 text-white hover:bg-primary-700 ring-1 ring-inset ring-primary-500/20 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ease-out font-semibold text-sm flex items-center justify-center gap-2"
            >
              <Plus className="h-4.5 w-4.5" strokeWidth={2} aria-hidden="true" />
              <span>Yeni Restoran</span>
            </button>
          </div>
        </div>

        {/* Restaurants - Mobile Cards / Desktop Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/70 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : restaurants.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600 text-base sm:text-lg">Henüz restoran eklenmemiş</p>
            </div>
          ) : (
            <>
              {/* Mobile Cards */}
              <div className="lg:hidden divide-y divide-slate-200/70">
                {restaurants.map((restaurant) => (
                  <div key={restaurant.id} className="p-4 sm:p-5 space-y-3 hover:bg-slate-50/70 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-[14px] font-semibold text-slate-900">{restaurant.name}</h3>
                        <p className="mt-0.5 text-[12px] text-slate-500">/{restaurant.slug}</p>
                      </div>
                      <div className="flex gap-1">
                        <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200/80">
                          {restaurant._count.categories} Kat
                        </span>
                        <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200/80">
                          {restaurant._count.qrCodes} QR
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-[13px] text-slate-700">
                        <User className="h-4 w-4 text-slate-400" strokeWidth={2} aria-hidden="true" />
                        <span className="truncate">{restaurant.owner.name}</span>
                      </div>
                      {restaurant.phone ? (
                        <div className="flex items-center gap-2 text-[13px] text-slate-600">
                          <Phone className="h-4 w-4 text-slate-400" strokeWidth={2} aria-hidden="true" />
                          <span className="truncate">{restaurant.phone}</span>
                        </div>
                      ) : null}
                      {restaurant.email ? (
                        <div className="flex items-center gap-2 text-[13px] text-slate-600">
                          <Mail className="h-4 w-4 text-slate-400" strokeWidth={2} aria-hidden="true" />
                          <span className="truncate">{restaurant.email}</span>
                        </div>
                      ) : null}
                      {restaurant.address ? (
                        <div className="flex items-center gap-2 text-[12px] text-slate-500">
                          <MapPin className="h-4 w-4 text-slate-400" strokeWidth={2} aria-hidden="true" />
                          <span className="line-clamp-2">{restaurant.address}</span>
                        </div>
                      ) : null}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(restaurant)}
                        className="flex-1 h-10 px-3 rounded-xl border border-primary-200 text-primary-700 bg-primary-50/40 hover:bg-primary-50 transition-colors text-sm font-semibold inline-flex items-center justify-center gap-2"
                      >
                        <Pencil className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleDelete(restaurant.id)}
                        className="flex-1 h-10 px-3 rounded-xl border border-rose-200 text-rose-700 bg-rose-50/40 hover:bg-rose-50 transition-colors text-sm font-semibold inline-flex items-center justify-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                        Sil
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200/70">
                  <tr>
                    <th className="text-left py-3.5 px-6 text-[12px] font-semibold text-slate-600">Restoran</th>
                    <th className="text-left py-3.5 px-6 text-[12px] font-semibold text-slate-600">Sahip</th>
                    <th className="text-left py-3.5 px-6 text-[12px] font-semibold text-slate-600">İletişim</th>
                    <th className="text-center py-3.5 px-6 text-[12px] font-semibold text-slate-600">İstatistik</th>
                    <th className="text-right py-3.5 px-6 text-[12px] font-semibold text-slate-600">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {restaurants.map((restaurant) => (
                    <tr
                      key={restaurant.id}
                      className="border-b border-slate-200/60 hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div>
                          <div className="text-[14px] font-semibold text-slate-900">{restaurant.name}</div>
                          <div className="mt-0.5 text-[12px] text-slate-500">/{restaurant.slug}</div>
                          {restaurant.description && (
                            <div className="text-[12px] text-slate-500 mt-1 line-clamp-1">
                              {restaurant.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <div className="text-[13px] font-semibold text-slate-900">{restaurant.owner.name}</div>
                          <div className="mt-0.5 text-[12px] text-slate-500">{restaurant.owner.email}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          {restaurant.phone ? (
                            <div className="flex items-center gap-2 text-[13px] text-slate-700">
                              <Phone className="h-4 w-4 text-slate-400" strokeWidth={2} aria-hidden="true" />
                              <span className="truncate">{restaurant.phone}</span>
                            </div>
                          ) : null}
                          {restaurant.email ? (
                            <div className="flex items-center gap-2 text-[13px] text-slate-700">
                              <Mail className="h-4 w-4 text-slate-400" strokeWidth={2} aria-hidden="true" />
                              <span className="truncate">{restaurant.email}</span>
                            </div>
                          ) : null}
                          {restaurant.address ? (
                            <div className="flex items-center gap-2 text-[12px] text-slate-500">
                              <MapPin className="h-4 w-4 text-slate-400" strokeWidth={2} aria-hidden="true" />
                              <span className="line-clamp-2">{restaurant.address}</span>
                            </div>
                          ) : null}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex justify-center gap-2">
                          <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200/80">
                            {restaurant._count.categories} Kategori
                          </span>
                          <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200/80">
                            {restaurant._count.qrCodes} QR
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(restaurant)}
                            className="h-9 px-3.5 rounded-xl border border-primary-200 text-primary-700 bg-primary-50/40 hover:bg-primary-50 hover:shadow-sm transition-all duration-200 text-sm font-semibold inline-flex items-center gap-2"
                          >
                            <Pencil className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                            Düzenle
                          </button>
                          <button
                            onClick={() => handleDelete(restaurant.id)}
                            className="h-9 px-3.5 rounded-xl border border-rose-200 text-rose-700 bg-rose-50/40 hover:bg-rose-50 hover:shadow-sm transition-all duration-200 text-sm font-semibold inline-flex items-center gap-2"
                          >
                            <Trash2 className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                            Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {editingRestaurant ? 'Restoran Düzenle' : 'Yeni Restoran Ekle'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Restoran Adı *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => {
                          const name = e.target.value;
                          setFormData((prev) => {
                            const next = { ...prev, name };
                            if (!slugTouched) {
                              next.slug = slugifyTR(name);
                            }
                            return next;
                          });
                        }}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Slug (URL) *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.slug}
                        onChange={(e) => {
                          setSlugTouched(true);
                          const normalized = slugifyTR(e.target.value);
                          setSlugPreview(normalized);
                          setFormData({ ...formData, slug: normalized });
                        }}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="mt-2 text-xs text-gray-600">
                        <div>
                          Menü linki: <span className="font-mono">/m/{slugPreview || '...'}</span>
                        </div>
                        {slugCheck?.loading ? (
                          <div className="text-gray-500 mt-1">Kontrol ediliyor...</div>
                        ) : slugCheck?.error ? (
                          <div className="text-red-600 mt-1">{slugCheck.error}</div>
                        ) : slugCheck?.available === true ? (
                          <div className="text-green-700 mt-1">Slug uygun</div>
                        ) : slugCheck?.available === false ? (
                          <div className="text-red-700 mt-1">
                            Slug kullanımda
                            {slugCheck.suggestion ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData({ ...formData, slug: slugCheck.suggestion || formData.slug });
                                  setSlugPreview(slugCheck.suggestion || slugPreview);
                                }}
                                className="ml-2 underline text-blue-600"
                              >
                                Öneri: {slugCheck.suggestion}
                              </button>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {slugPreview ? (
                    <div className="pt-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">QR Kod</label>
                      <div className="flex flex-col gap-3">
                        <QrBox slug={slugPreview} size={240} />
                        <a
                          href={`/api/qr?text=${encodeURIComponent(`${getClientBaseUrl()}/m/${slugPreview}`)}`}
                          download={`qr-${slugPreview}.png`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black text-sm font-medium"
                        >
                          QR PNG indir (512px)
                        </a>
                      </div>
                    </div>
                  ) : null}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Açıklama</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {!editingRestaurant && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Üyelik Başlangıç Tarihi *
                        </label>
                        <input
                          type="date"
                          required
                          value={formData.membershipStartDate}
                          onChange={(e) => setFormData({ ...formData, membershipStartDate: e.target.value })}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="gg.aa.yyyy"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Üyelik Bitiş Tarihi *
                        </label>
                        <input
                          type="date"
                          required
                          value={formData.membershipEndDate}
                          onChange={(e) => setFormData({ ...formData, membershipEndDate: e.target.value })}
                          min={formData.membershipStartDate || undefined}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="gg.aa.yyyy"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Adres</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {!editingRestaurant && (
                    <>
                      <hr className="my-4" />
                      <h3 className="font-semibold text-gray-900 mb-3">Sahip Bilgileri</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sahip Adı *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.ownerName}
                            onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sahip Email *
                          </label>
                          <input
                            type="email"
                            required
                            value={formData.ownerEmail}
                            onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sahip Şifresi *
                        </label>
                        <div className="relative">
                          <input
                            type={showOwnerPassword ? "text" : "password"}
                            required
                            value={formData.ownerPassword}
                            onChange={(e) => setFormData({ ...formData, ownerPassword: e.target.value })}
                            className="w-full px-4 py-2 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowOwnerPassword(!showOwnerPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                          >
                            {showOwnerPassword ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                      {editingRestaurant ? 'Güncelle' : 'Oluştur'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                      className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                    >
                      İptal
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
