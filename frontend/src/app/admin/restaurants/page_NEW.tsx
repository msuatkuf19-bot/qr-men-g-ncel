'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import QrBox from '@/components/QrBox';
import { slugifyTR } from '@/utils/slugify';
import { Store, Plus, Pencil, Trash2, User, Phone, Mail, MapPin, Eye, EyeOff, Copy, RefreshCw } from 'lucide-react';
import WorkingHoursEditor from '@/components/WorkingHoursEditor';

interface Restaurant {
  id: string;
  memberNo?: string;
  businessType?: string;
  name: string;
  slug: string;
  description?: string;
  address?: string;
  city?: string;
  district?: string;
  neighborhood?: string;
  fullAddress?: string;
  phone?: string;
  email?: string;
  googleMapsUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  workingHours?: string;
  internalNote?: string;
  membershipStartDate?: string | null;
  membershipEndDate?: string | null;
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

interface FormData {
  businessType: string;
  memberNo: string;
  name: string;
  slug: string;
  description: string;
  city: string;
  district: string;
  neighborhood: string;
  fullAddress: string;
  phone: string;
  email: string;
  googleMapsUrl: string;
  workingHours: string;
  instagramUrl: string;
  facebookUrl: string;
  membershipStartDate: string;
  membershipEndDate: string;
  internalNote: string;
  ownerName: string;
  ownerEmail: string;
  ownerPassword: string;
}

export default function AdminRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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
  
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const [formData, setFormData] = useState<FormData>({
    businessType: 'Restoran',
    memberNo: '',
    name: '',
    slug: '',
    description: '',
    city: '',
    district: '',
    neighborhood: '',
    fullAddress: '',
    phone: '',
    email: '',
    googleMapsUrl: '',
    workingHours: '',
    instagramUrl: '',
    facebookUrl: '',
    membershipStartDate: new Date().toISOString().split('T')[0],
    membershipEndDate: '',
    internalNote: '',
    ownerName: '',
    ownerEmail: '',
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

  // Generate member number when modal opens for new restaurant
  useEffect(() => {
    if (showModal && !editingRestaurant && !formData.memberNo) {
      const memberNo = String(Math.floor(100000 + Math.random() * 900000));
      setFormData(prev => ({ ...prev, memberNo }));
    }
  }, [showModal, editingRestaurant]);

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

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    // İşletme Bilgileri Validasyonları
    if (!formData.businessType) newErrors.businessType = 'İşletme tipi zorunludur';
    if (!formData.name || formData.name.length < 2) newErrors.name = 'Restoran adı en az 2 karakter olmalıdır';
    if (!formData.slug) newErrors.slug = 'Slug zorunludur';
    if (!formData.phone || formData.phone.length < 10) newErrors.phone = 'Geçerli bir telefon numarası giriniz';
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Geçerli bir email adresi giriniz';
    }
    
    // Çalışma saatleri kontrolü
    if (!formData.workingHours) {
      newErrors.workingHours = 'En az bir gün çalışma saati açık olmalıdır';
    } else {
      try {
        const hours = JSON.parse(formData.workingHours);
        const hasOpenDay = Object.values(hours).some((day: any) => !day.closed);
        if (!hasOpenDay) {
          newErrors.workingHours = 'En az bir gün açık olmalıdır';
        }
      } catch (e) {
        newErrors.workingHours = 'Geçersiz çalışma saatleri formatı';
      }
    }

    // URL validasyonları
    if (formData.googleMapsUrl && !/^https?:\/\/.+/.test(formData.googleMapsUrl)) {
      newErrors.googleMapsUrl = 'Geçerli bir URL giriniz (http:// veya https://)';
    }
    if (formData.instagramUrl && !/^https?:\/\/.+/.test(formData.instagramUrl)) {
      newErrors.instagramUrl = 'Geçerli bir URL giriniz';
    }
    if (formData.facebookUrl && !/^https?:\/\/.+/.test(formData.facebookUrl)) {
      newErrors.facebookUrl = 'Geçerli bir URL giriniz';
    }

    // Üyelik tarihleri
    if (!formData.membershipStartDate) newErrors.membershipStartDate = 'Başlangıç tarihi zorunludur';
    if (!formData.membershipEndDate) newErrors.membershipEndDate = 'Bitiş tarihi zorunludur';
    if (formData.membershipStartDate && formData.membershipEndDate) {
      if (new Date(formData.membershipEndDate) < new Date(formData.membershipStartDate)) {
        newErrors.membershipEndDate = 'Bitiş tarihi başlangıçtan önce olamaz';
      }
    }

    // Adres bilgileri
    if (!formData.fullAddress) newErrors.fullAddress = 'Açık adres zorunludur';

    // Sahip Bilgileri (sadece yeni restoran için)
    if (!editingRestaurant) {
      if (!formData.ownerName || formData.ownerName.length < 2) {
        newErrors.ownerName = 'Sahip adı en az 2 karakter olmalıdır';
      }
      if (!formData.ownerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.ownerEmail)) {
        newErrors.ownerEmail = 'Geçerli bir email adresi giriniz';
      }
      if (!formData.ownerPassword || formData.ownerPassword.length < 8) {
        newErrors.ownerPassword = 'Şifre en az 8 karakter olmalıdır';
      } else if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(formData.ownerPassword)) {
        newErrors.ownerPassword = 'Şifre en az 1 harf ve 1 rakam içermelidir';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert('Lütfen tüm zorunlu alanları doğru şekilde doldurun');
      return;
    }

    const normalizedSlug = slugifyTR(formData.slug);
    if (!normalizedSlug) {
      alert('Slug geçersiz');
      return;
    }

    if (slugCheck && slugCheck.normalized === normalizedSlug && slugCheck.available === false) {
      alert('Bu slug zaten kullanılıyor. Lütfen farklı bir slug seçin.');
      return;
    }

    try {
      setSubmitting(true);
      
      if (editingRestaurant) {
        await apiClient.updateRestaurant(editingRestaurant.id, { ...formData, slug: normalizedSlug });
      } else {
        await apiClient.createRestaurant({ ...formData, slug: normalizedSlug });
      }
      
      setShowModal(false);
      resetForm();
      loadRestaurants();
      alert('Restoran başarıyla oluşturuldu!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Bir hata oluştu');
    } finally {
      setSubmitting(false);
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
      businessType: restaurant.businessType || 'Restoran',
      memberNo: restaurant.memberNo || '',
      name: restaurant.name,
      slug: restaurant.slug,
      description: restaurant.description || '',
      city: restaurant.city || '',
      district: restaurant.district || '',
      neighborhood: restaurant.neighborhood || '',
      fullAddress: restaurant.fullAddress || restaurant.address || '',
      phone: restaurant.phone || '',
      email: restaurant.email || '',
      googleMapsUrl: restaurant.googleMapsUrl || '',
      workingHours: restaurant.workingHours || '',
      instagramUrl: restaurant.instagramUrl || '',
      facebookUrl: restaurant.facebookUrl || '',
      membershipStartDate: restaurant.membershipStartDate?.split('T')[0] || '',
      membershipEndDate: restaurant.membershipEndDate?.split('T')[0] || '',
      internalNote: restaurant.internalNote || '',
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
    setErrors({});
    setFormData({
      businessType: 'Restoran',
      memberNo: '',
      name: '',
      slug: '',
      description: '',
      city: '',
      district: '',
      neighborhood: '',
      fullAddress: '',
      phone: '',
      email: '',
      googleMapsUrl: '',
      workingHours: '',
      instagramUrl: '',
      facebookUrl: '',
      membershipStartDate: new Date().toISOString().split('T')[0],
      membershipEndDate: '',
      internalNote: '',
      ownerName: '',
      ownerEmail: '',
      ownerPassword: '',
    });
  };

  const generatePassword = () => {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setFormData(prev => ({ ...prev, ownerPassword: password }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Kopyalandı!');
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
                        {restaurant.memberNo && (
                          <p className="mt-0.5 text-[12px] text-blue-600 font-mono">#{restaurant.memberNo}</p>
                        )}
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
                      {restaurant.phone && (
                        <div className="flex items-center gap-2 text-[13px] text-slate-600">
                          <Phone className="h-4 w-4 text-slate-400" strokeWidth={2} aria-hidden="true" />
                          <span className="truncate">{restaurant.phone}</span>
                        </div>
                      )}
                      {restaurant.email && (
                        <div className="flex items-center gap-2 text-[13px] text-slate-600">
                          <Mail className="h-4 w-4 text-slate-400" strokeWidth={2} aria-hidden="true" />
                          <span className="truncate">{restaurant.email}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => openEditModal(restaurant)}
                        className="flex-1 h-9 px-3 rounded-lg border border-blue-200 text-blue-700 bg-blue-50/40 hover:bg-blue-50 text-sm font-medium"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleDelete(restaurant.id)}
                        className="flex-1 h-9 px-3 rounded-lg border border-red-200 text-red-700 bg-red-50/40 hover:bg-red-50 text-sm font-medium"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200/70">
                  <thead className="bg-slate-50/70">
                    <tr>
                      <th className="py-3 px-6 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Restoran
                      </th>
                      <th className="py-3 px-6 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Sahip
                      </th>
                      <th className="py-3 px-6 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        İletişim
                      </th>
                      <th className="py-3 px-6 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        İstatistik
                      </th>
                      <th className="py-3 px-6 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200/70">
                    {restaurants.map((restaurant) => (
                      <tr key={restaurant.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-6">
                          <div>
                            <div className="font-semibold text-slate-900">{restaurant.name}</div>
                            <div className="text-sm text-slate-500">/{restaurant.slug}</div>
                            {restaurant.memberNo && (
                              <div className="text-xs text-blue-600 font-mono mt-0.5">#{restaurant.memberNo}</div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <div className="text-sm font-medium text-slate-900">{restaurant.owner.name}</div>
                            <div className="text-sm text-slate-500">{restaurant.owner.email}</div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            {restaurant.phone && (
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Phone className="h-3.5 w-3.5 text-slate-400" />
                                {restaurant.phone}
                              </div>
                            )}
                            {restaurant.email && (
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Mail className="h-3.5 w-3.5 text-slate-400" />
                                {restaurant.email}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center gap-2">
                            <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200/80">
                              {restaurant._count.categories} Kategori
                            </span>
                            <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200/80">
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

        {/* Professional Registration Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl my-8">
              <div className="p-6 sm:p-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                  {editingRestaurant ? 'Restoran Düzenle' : 'Restoran Kayıt Ekranı'}
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  {editingRestaurant
                    ? 'Restoran bilgilerini güncelleyin'
                    : 'Yeni restoran kaydı oluşturmak için aşağıdaki bilgileri doldurun'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* İŞLETME BİLGİLERİ */}
                  <div className="border border-gray-200 rounded-xl p-6 bg-gray-50/50">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Store className="h-5 w-5 text-blue-600" />
                      İŞLETME BİLGİLERİ
                    </h3>

                    <div className="grid md:grid-cols-2 gap-4">
                      {/* İşletme Tipi */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          İşletme Tipi <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.businessType}
                          onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Seçiniz</option>
                          <option value="Restoran">Restoran</option>
                          <option value="Kafe">Kafe</option>
                          <option value="Otel">Otel</option>
                          <option value="Bar">Bar</option>
                          <option value="Diğer">Diğer</option>
                        </select>
                        {errors.businessType && (
                          <p className="mt-1 text-sm text-red-600">{errors.businessType}</p>
                        )}
                      </div>

                      {/* Üye Numarası */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Üye Numarası <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={formData.memberNo}
                            readOnly
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newMemberNo = String(Math.floor(100000 + Math.random() * 900000));
                              setFormData({ ...formData, memberNo: newMemberNo });
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-gray-700"
                            title="Yeni numara üret"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Otomatik oluşturuldu</p>
                      </div>

                      {/* Restoran Adı */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Restoran Adı <span className="text-red-500">*</span>
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
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Örn: Güler Kebap Lahmacun"
                        />
                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                      </div>

                      {/* Slug */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Slug (URL) <span className="text-red-500">*</span>
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
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                          placeholder="guler-kebap-lahmacun"
                        />
                        <div className="mt-1.5 text-xs space-y-1">
                          <div className="text-gray-600">
                            Menü linki:{' '}
                            <span className="font-mono text-blue-600">/m/{slugPreview || '...'}</span>
                          </div>
                          {slugCheck?.loading ? (
                            <div className="text-gray-500">Kontrol ediliyor...</div>
                          ) : slugCheck?.error ? (
                            <div className="text-red-600">{slugCheck.error}</div>
                          ) : slugCheck?.available === true ? (
                            <div className="text-green-700 font-medium">✓ Slug uygun</div>
                          ) : slugCheck?.available === false ? (
                            <div className="text-red-700">
                              ✗ Slug kullanımda
                              {slugCheck.suggestion && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFormData({ ...formData, slug: slugCheck.suggestion || formData.slug });
                                    setSlugPreview(slugCheck.suggestion || slugPreview);
                                  }}
                                  className="ml-2 underline text-blue-600 hover:text-blue-800"
                                >
                                  Öneri: {slugCheck.suggestion}
                                </button>
                              )}
                            </div>
                          ) : null}
                        </div>
                        {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug}</p>}
                      </div>
                    </div>

                    {/* Açıklama */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Açıklama</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        maxLength={500}
                        rows={3}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Restoranınız hakkında kısa bir açıklama..."
                      />
                      <p className="mt-1 text-xs text-gray-500 text-right">
                        {formData.description.length}/500
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      {/* Telefon */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Telefon <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="+90 555 123 4567"
                        />
                        {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="info@restoran.com"
                        />
                        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                      </div>

                      {/* Google Maps URL */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Google Maps Linki
                        </label>
                        <input
                          type="url"
                          value={formData.googleMapsUrl}
                          onChange={(e) => setFormData({ ...formData, googleMapsUrl: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://maps.google.com/..."
                        />
                        {errors.googleMapsUrl && (
                          <p className="mt-1 text-sm text-red-600">{errors.googleMapsUrl}</p>
                        )}
                      </div>

                      {/* Instagram URL */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Instagram URL</label>
                        <input
                          type="url"
                          value={formData.instagramUrl}
                          onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://instagram.com/..."
                        />
                        {errors.instagramUrl && (
                          <p className="mt-1 text-sm text-red-600">{errors.instagramUrl}</p>
                        )}
                      </div>

                      {/* Facebook URL */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Facebook URL</label>
                        <input
                          type="url"
                          value={formData.facebookUrl}
                          onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://facebook.com/..."
                        />
                        {errors.facebookUrl && (
                          <p className="mt-1 text-sm text-red-600">{errors.facebookUrl}</p>
                        )}
                      </div>
                    </div>

                    {/* Çalışma Saatleri */}
                    <div className="mt-4">
                      <WorkingHoursEditor
                        value={formData.workingHours}
                        onChange={(value) => setFormData({ ...formData, workingHours: value })}
                      />
                      {errors.workingHours && (
                        <p className="mt-1 text-sm text-red-600">{errors.workingHours}</p>
                      )}
                    </div>

                    {/* Üyelik Tarihleri */}
                    {!editingRestaurant && (
                      <div className="grid md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Üyelik Başlangıç Tarihi <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            required
                            value={formData.membershipStartDate}
                            onChange={(e) =>
                              setFormData({ ...formData, membershipStartDate: e.target.value })
                            }
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          {errors.membershipStartDate && (
                            <p className="mt-1 text-sm text-red-600">{errors.membershipStartDate}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Üyelik Bitiş Tarihi <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            required
                            value={formData.membershipEndDate}
                            onChange={(e) =>
                              setFormData({ ...formData, membershipEndDate: e.target.value })
                            }
                            min={formData.membershipStartDate || undefined}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          {errors.membershipEndDate && (
                            <p className="mt-1 text-sm text-red-600">{errors.membershipEndDate}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Adres Bilgileri */}
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">
                        Adres Bilgileri <span className="text-red-500">*</span>
                      </h4>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">İl</label>
                          <input
                            type="text"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Ankara"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">İlçe</label>
                          <input
                            type="text"
                            value={formData.district}
                            onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Çankaya"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mahalle/Semt
                          </label>
                          <input
                            type="text"
                            value={formData.neighborhood}
                            onChange={(e) =>
                              setFormData({ ...formData, neighborhood: e.target.value })
                            }
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Kızılay"
                          />
                        </div>
                      </div>
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Açık Adres <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          required
                          value={formData.fullAddress}
                          onChange={(e) => setFormData({ ...formData, fullAddress: e.target.value })}
                          rows={2}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          placeholder="Sokak, cadde, bina no, kat, daire bilgileri..."
                        />
                        {errors.fullAddress && (
                          <p className="mt-1 text-sm text-red-600">{errors.fullAddress}</p>
                        )}
                      </div>
                    </div>

                    {/* İç Not */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Not / İç Açıklama (Sadece admin görür)
                      </label>
                      <textarea
                        value={formData.internalNote}
                        onChange={(e) => setFormData({ ...formData, internalNote: e.target.value })}
                        maxLength={1000}
                        rows={3}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Dahili notlar, özel bilgiler..."
                      />
                      <p className="mt-1 text-xs text-gray-500 text-right">
                        {formData.internalNote.length}/1000
                      </p>
                    </div>
                  </div>

                  {/* SAHİP BİLGİLERİ */}
                  {!editingRestaurant && (
                    <div className="border border-gray-200 rounded-xl p-6 bg-blue-50/30">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <User className="h-5 w-5 text-blue-600" />
                        SAHİP BİLGİLERİ
                      </h3>

                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Sahip Adı */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sahip Adı <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.ownerName}
                            onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Ahmet Yılmaz"
                          />
                          {errors.ownerName && (
                            <p className="mt-1 text-sm text-red-600">{errors.ownerName}</p>
                          )}
                        </div>

                        {/* Sahip Email */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sahip Email <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            required
                            value={formData.ownerEmail}
                            onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="ahmet@restoran.com"
                          />
                          {errors.ownerEmail && (
                            <p className="mt-1 text-sm text-red-600">{errors.ownerEmail}</p>
                          )}
                        </div>
                      </div>

                      {/* Sahip Şifresi */}
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sahip Şifresi <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <input
                              type={showOwnerPassword ? 'text' : 'password'}
                              required
                              value={formData.ownerPassword}
                              onChange={(e) =>
                                setFormData({ ...formData, ownerPassword: e.target.value })
                              }
                              className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="En az 8 karakter, 1 harf ve 1 rakam"
                            />
                            <button
                              type="button"
                              onClick={() => setShowOwnerPassword(!showOwnerPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showOwnerPassword ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={generatePassword}
                            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 whitespace-nowrap"
                          >
                            <RefreshCw className="h-4 w-4" />
                            Şifre Üret
                          </button>
                          {formData.ownerPassword && (
                            <button
                              type="button"
                              onClick={() => copyToClipboard(formData.ownerPassword)}
                              className="px-4 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                              title="Şifreyi kopyala"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-gray-600">
                          Min 8 karakter, en az 1 harf ve 1 rakam içermelidir
                        </p>
                        {errors.ownerPassword && (
                          <p className="mt-1 text-sm text-red-600">{errors.ownerPassword}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Form Actions */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 px-6 py-3.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold text-base shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>İşleniyor...</span>
                        </>
                      ) : (
                        <span>{editingRestaurant ? 'Güncelle' : 'Oluştur'}</span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          !editingRestaurant &&
                          Object.values(formData).some((val) => val !== '' && val !== 'Restoran')
                        ) {
                          if (
                            !confirm('Kaydedilmemiş değişiklikler var. Çıkmak istediğinizden emin misiniz?')
                          ) {
                            return;
                          }
                        }
                        setShowModal(false);
                        resetForm();
                      }}
                      disabled={submitting}
                      className="flex-1 px-6 py-3.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-semibold text-base transition-all disabled:opacity-50"
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
