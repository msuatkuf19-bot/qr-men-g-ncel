'use client';

/**
 * Restaurant Create Form Page
 * Form for creating new restaurants (Super Admin only)
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  createRestaurantSchema,
  defaultRestaurantFormValues,
  type CreateRestaurantFormData,
} from '@/lib/validations/restaurant';
import { restaurantApi } from '@/lib/api/restaurant';
import { slugify } from '@/utils/text';

export default function NewRestaurantPage() {
  const router = useRouter();
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);

  const form = useForm<CreateRestaurantFormData>({
    resolver: zodResolver(createRestaurantSchema),
    defaultValues: defaultRestaurantFormValues,
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  const watchName = watch('name');
  const watchSlug = watch('slug');

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setValue('name', name);

    if (!isSlugManual) {
      const slug = slugify(name);
      setValue('slug', slug);
    }
  };

  // Check slug availability
  const checkSlugAvailability = async () => {
    if (!watchSlug) {
      toast.error('Lütfen bir slug giriniz');
      return;
    }

    setIsCheckingSlug(true);
    try {
      const result = await restaurantApi.checkSlug(watchSlug);
      if (result.available) {
        toast.success('Slug kullanılabilir ✓');
      } else {
        toast.error('Bu slug zaten kullanımda');
      }
    } catch (error) {
      toast.error('Slug kontrolü başarısız');
    } finally {
      setIsCheckingSlug(false);
    }
  };

  // Create restaurant mutation
  const createMutation = useMutation({
    mutationFn: restaurantApi.create,
    onSuccess: (data) => {
      toast.success('Restoran başarıyla oluşturuldu!');
      router.push(`/admin/restaurants/${data.restaurant.id}`);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error || 'Restoran oluşturulamadı';
      toast.error(message);
    },
  });

  const onSubmit = (data: CreateRestaurantFormData) => {
    createMutation.mutate(data);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Yeni Restoran Ekle</h1>
        <p className="mt-2 text-gray-600">
          Yeni bir restoran oluşturun. Otomatik olarak sahip hesabı ve QR kod oluşturulacaktır.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* İşletme Bilgileri */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">İşletme Bilgileri</h2>
          
          <div className="space-y-4">
            {/* İşletme Tipi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                İşletme Tipi <span className="text-red-500">*</span>
              </label>
              <select
                {...register('businessType')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="RESTORAN">Restoran</option>
                <option value="KAFE">Kafe</option>
                <option value="OTEL">Otel</option>
                <option value="DIGER">Diğer</option>
              </select>
              {errors.businessType && (
                <p className="mt-1 text-sm text-red-600">{errors.businessType.message}</p>
              )}
            </div>

            {/* Restoran Adı */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Restoran Adı <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('name')}
                onChange={handleNameChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Örn: Lezzetli Restoran"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug (URL) <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  {...register('slug')}
                  onChange={(e) => {
                    setIsSlugManual(true);
                    setValue('slug', e.target.value);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="lezzetli-restoran"
                />
                <button
                  type="button"
                  onClick={checkSlugAvailability}
                  disabled={isCheckingSlug || !watchSlug}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                >
                  {isCheckingSlug ? 'Kontrol ediliyor...' : 'Kontrol Et'}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Menü URL'i: /menu/{watchSlug || 'slug'}
              </p>
              {errors.slug && (
                <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>
              )}
            </div>

            {/* Açıklama */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Açıklama</label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Restoran hakkında kısa açıklama..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            {/* Telefon */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefon <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                {...register('phone')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0532 123 4567"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                {...register('email')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="info@restoran.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Adres */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adres <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register('fullAddress')}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Mahalle, Sokak, No, İlçe, İl"
              />
              {errors.fullAddress && (
                <p className="mt-1 text-sm text-red-600">{errors.fullAddress.message}</p>
              )}
            </div>

            {/* Çalışma Saatleri */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Çalışma Saatleri</label>
              <input
                type="text"
                {...register('workingHours')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="09:00 - 22:00"
              />
              {errors.workingHours && (
                <p className="mt-1 text-sm text-red-600">{errors.workingHours.message}</p>
              )}
            </div>

            {/* Google Maps Link */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Google Maps Link</label>
              <input
                type="url"
                {...register('googleMapsUrl')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://maps.google.com/..."
              />
              {errors.googleMapsUrl && (
                <p className="mt-1 text-sm text-red-600">{errors.googleMapsUrl.message}</p>
              )}
            </div>

            {/* Social Media */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Instagram URL</label>
                <input
                  type="url"
                  {...register('instagramUrl')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Facebook URL</label>
                <input
                  type="url"
                  {...register('facebookUrl')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://facebook.com/..."
                />
              </div>
            </div>

            {/* Not */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dahili Not</label>
              <textarea
                {...register('internalNote')}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Yönetici notları (müşteri görmez)..."
              />
            </div>
          </div>
        </div>

        {/* Üyelik Bilgileri */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Üyelik Bilgileri</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Başlangıç Tarihi <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register('membershipStartDate')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.membershipStartDate && (
                <p className="mt-1 text-sm text-red-600">{errors.membershipStartDate.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bitiş Tarihi <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register('membershipEndDate')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.membershipEndDate && (
                <p className="mt-1 text-sm text-red-600">{errors.membershipEndDate.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Sahip Bilgileri */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Sahip Bilgileri</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ad Soyad <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('ownerName')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ahmet Yılmaz"
              />
              {errors.ownerName && (
                <p className="mt-1 text-sm text-red-600">{errors.ownerName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                {...register('ownerEmail')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="sahip@email.com"
              />
              {errors.ownerEmail && (
                <p className="mt-1 text-sm text-red-600">{errors.ownerEmail.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Şifre <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                {...register('ownerPassword')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="En az 6 karakter"
              />
              {errors.ownerPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.ownerPassword.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Bu şifre sahip hesabı için kullanılacaktır
              </p>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Oluşturuluyor...' : 'Restoran Oluştur'}
          </button>
        </div>
      </form>
    </div>
  );
}

/**
 * Slugify helper function
 */
function slugify(text: string): string {
  const turkishMap: Record<string, string> = {
    'ç': 'c', 'Ç': 'C',
    'ğ': 'g', 'Ğ': 'G',
    'ı': 'i', 'I': 'I', 'İ': 'I',
    'ö': 'o', 'Ö': 'O',
    'ş': 's', 'Ş': 'S',
    'ü': 'u', 'Ü': 'U',
  };

  return text
    .split('')
    .map(char => turkishMap[char] || char)
    .join('')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}
