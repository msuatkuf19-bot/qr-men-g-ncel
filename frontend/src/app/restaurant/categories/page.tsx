'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import toast from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
  description?: string;
  displayOrder: number;
  order: number;
  _count?: {
    products: number;
  };
}

export default function RestaurantCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    displayOrder: 0,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const restaurantRes = await apiClient.getMyRestaurant();
      const restaurant = restaurantRes.data;
      const cats = (categoriesRes.data || []).sort((a: Category, b: Category) => (a.order || 0) - (b.order || 0));
      setCategories(cats);
    } catch (error) {
      console.error('Kategoriler yüklenemedi:', error);
      toast.error('❌ Kategoriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const restaurantRes = await apiClient.getMyRestaurant();
      const restaurantId = restaurantRes.data.id;

      if (editingCategory) {
        await apiClient.updateCategory(editingCategory.id, formData);
        toast.success('✅ Kategori güncellendi!');
      } else {
        await apiClient.createCategory({ ...formData, restaurantId });
        toast.success('✅ Kategori oluşturuldu!');
      }
      setShowModal(false);
      resetForm();
      await loadCategories();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Bir hata oluştu';
      toast.error(`❌ ${errorMsg}`);
    } finally {
      setSubmitting(false);
    }
  };

  const moveCategory = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === categories.length - 1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newCategories = [...categories];
    [newCategories[index], newCategories[newIndex]] = [newCategories[newIndex], newCategories[index]];
    
    // Optimistically update UI
    setCategories(newCategories);

    try {
      const categoryIds = newCategories.map(cat => cat.id);
      await apiClient.reorderCategories(categoryIds);
      toast.success('✅ Sıralama güncellendi!');
    } catch (error) {
      // Revert on error
      setCategories(categories);
      toast.error('❌ Sıralama güncellenemedi');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) return;
    try {
      await apiClient.deleteCategory(id);
      toast.success('✅ Kategori silindi');
      await loadCategories();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Silinemedi';
      toast.error(`❌ ${errorMsg}`);
    }
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      displayOrder: category.displayOrder,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      displayOrder: 0,
    });
  };

  return (
    <ProtectedRoute allowedRoles={['RESTAURANT_ADMIN']}>
      <DashboardLayout title="📁 Kategori Yönetimi">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <p className="text-gray-600 text-sm sm:text-base">Menü kategorilerinizi düzenleyin</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <span>➕</span>
            <span>Yeni Kategori</span>
          </button>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 text-center py-12">
            <p className="text-gray-500 text-lg">Henüz kategori eklenmemiş</p>
            <p className="text-gray-400 text-sm mt-2">Başlamak için yukarıdan "Yeni Kategori" butonuna tıklayın</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {categories.map((category, index) => (
              <div
                key={category.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition relative"
              >
                {/* Sıralama Butonları - Sağ Üst */}
                <div className="absolute top-4 right-4 flex gap-1 bg-gray-50 rounded-lg p-1">
                  <button
                    onClick={() => moveCategory(index, 'up')}
                    disabled={index === 0}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded disabled:opacity-30 disabled:cursor-not-allowed transition"
                    title="Yukarı taşı"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => moveCategory(index, 'down')}
                    disabled={index === categories.length - 1}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded disabled:opacity-30 disabled:cursor-not-allowed transition"
                    title="Aşağı taşı"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                <div className="mb-4 pr-16">
                  <div className="flex items-start gap-2 mb-2">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-sm flex-shrink-0">
                      {index + 1}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900">{category.name}</h3>
                  </div>
                  {category.description && (
                    <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      📦 <strong>{category._count?.products || 0}</strong> ürün
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 pt-4 border-t">
                  <button
                    onClick={() => openEditModal(category)}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium"
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium"
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori Ekle'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kategori Adı *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Örn: Ana Yemekler"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Açıklama
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Kategori açıklaması..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sıralama
                    </label>
                    <input
                      type="number"
                      value={formData.displayOrder}
                      onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">Menüde gösterilme sırası (küçükten büyüğe)</p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {submitting && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      )}
                      {submitting ? 'Kaydediliyor...' : (editingCategory ? 'Güncelle' : 'Oluştur')}
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
