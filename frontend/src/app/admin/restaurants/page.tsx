'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import QrBox from '@/components/QrBox';
import { slugifyTR } from '@/utils/slugify';

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
    });
  };

  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
      <DashboardLayout title="🏪 Restoran Yönetimi">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <p className="text-gray-600 text-sm sm:text-base">Tüm restoranları yönetin</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
          >
            <span>➕</span>
            <span>Yeni Restoran</span>
          </button>
        </div>

        {/* Restaurants - Mobile Cards / Desktop Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : restaurants.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Henüz restoran eklenmemiş</p>
            </div>
          ) : (
            <>
              {/* Mobile Cards */}
              <div className="lg:hidden divide-y">
                {restaurants.map((restaurant) => (
                  <div key={restaurant.id} className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{restaurant.name}</h3>
                        <p className="text-sm text-gray-500">/{restaurant.slug}</p>
                      </div>
                      <div className="flex gap-1">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                          {restaurant._count.categories} Kat
                        </span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                          {restaurant._count.qrCodes} QR
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>👤 {restaurant.owner.name}</p>
                      {restaurant.phone && <p>📞 {restaurant.phone}</p>}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(restaurant)}
                        className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleDelete(restaurant.id)}
                        className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-medium"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Restoran</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Sahip</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">İletişim</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-700">İstatistik</th>
                    <th className="text-right py-4 px-6 font-semibold text-gray-700">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {restaurants.map((restaurant) => (
                    <tr key={restaurant.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-medium text-gray-900">{restaurant.name}</div>
                          <div className="text-sm text-gray-500">/{restaurant.slug}</div>
                          {restaurant.description && (
                            <div className="text-xs text-gray-400 mt-1 line-clamp-1">
                              {restaurant.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{restaurant.owner.name}</div>
                          <div className="text-xs text-gray-500">{restaurant.owner.email}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm">
                          {restaurant.phone && (
                            <div className="text-gray-600">📞 {restaurant.phone}</div>
                          )}
                          {restaurant.email && (
                            <div className="text-gray-600">📧 {restaurant.email}</div>
                          )}
                          {restaurant.address && (
                            <div className="text-gray-500 text-xs mt-1">📍 {restaurant.address}</div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex justify-center gap-3">
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            {restaurant._count.categories} Kategori
                          </span>
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                            {restaurant._count.qrCodes} QR
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(restaurant)}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium"
                          >
                            Düzenle
                          </button>
                          <button
                            onClick={() => handleDelete(restaurant.id)}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium"
                          >
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
                        <input
                          type="password"
                          required
                          value={formData.ownerPassword}
                          onChange={(e) => setFormData({ ...formData, ownerPassword: e.target.value })}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
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
