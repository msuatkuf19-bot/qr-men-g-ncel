'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Plus, Trash2, Users, Pencil } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CUSTOMER',
    isActive: true,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const result = await apiClient.getUsers();
      setUsers(result.data || []);
    } catch (error) {
      console.error('Kullanıcılar yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await apiClient.updateUser(editingUser.id, formData);
      } else {
        await apiClient.createUser(formData);
      }
      
      setShowModal(false);
      resetForm();
      loadUsers();
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Bir hata oluştu');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) return;
    try {
      await apiClient.deleteUser(id);
      loadUsers();
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Silinemedi');
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      isActive: user.isActive,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'CUSTOMER',
      isActive: true,
    });
  };

  const getRoleBadge = (role: string) => {
    const styles = {
      SUPER_ADMIN:
        'bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-200/80',
      RESTAURANT_ADMIN:
        'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200/80',
      CUSTOMER:
        'bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-200/80',
    };
    return styles[role as keyof typeof styles] || styles.CUSTOMER;
  };

  const getRoleLabel = (role: string) => {
    const labels = {
      SUPER_ADMIN: 'Süper Admin',
      RESTAURANT_ADMIN: 'Restoran Admin',
      CUSTOMER: 'Müşteri',
    };
    return labels[role as keyof typeof labels] || role;
  };

  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
      <DashboardLayout>
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200/70">
                  <Users className="h-5 w-5" strokeWidth={1.9} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                    Kullanıcı Yönetimi
                  </h1>
                  <p className="mt-1 text-[13px] sm:text-[14px] text-slate-500">
                    Tüm kullanıcıları yönetin ve rollerini düzenleyin
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="w-full sm:w-auto h-11 px-4 sm:px-5 rounded-xl bg-primary-600 text-white hover:bg-primary-700 shadow-sm hover:shadow-md transition-all duration-200 ease-out font-semibold text-sm flex items-center justify-center gap-2"
            >
              <Plus className="h-4.5 w-4.5" strokeWidth={2} aria-hidden="true" />
              <span>Yeni Kullanıcı</span>
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/70 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600 text-base sm:text-lg">Henüz kullanıcı eklenmemiş</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block md:hidden">
                <div className="divide-y divide-slate-200/70">
                  {users.map((user) => (
                    <div key={user.id} className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-[14px] font-semibold text-slate-900 truncate">{user.name}</div>
                          <div className="mt-0.5 text-[12px] text-slate-500 truncate">{user.email}</div>
                        </div>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold ring-1 ring-inset ${
                            user.isActive
                              ? 'bg-emerald-50 text-emerald-700 ring-emerald-200/80'
                              : 'bg-rose-50 text-rose-700 ring-rose-200/80'
                          }`}
                        >
                          {user.isActive ? 'Aktif' : 'Pasif'}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold ${getRoleBadge(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                        <span className="text-[12px] text-slate-500">
                          {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                        </span>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="flex-1 h-10 px-3 rounded-xl border border-primary-200 text-primary-700 bg-primary-50/40 hover:bg-primary-50 transition-colors text-sm font-semibold inline-flex items-center justify-center gap-2"
                        >
                          <Pencil className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                          Düzenle
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="flex-1 h-10 px-3 rounded-xl border border-rose-200 text-rose-700 bg-rose-50/40 hover:bg-rose-50 transition-colors text-sm font-semibold inline-flex items-center justify-center gap-2"
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                          Sil
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200/70">
                  <tr>
                    <th className="text-left py-3.5 px-6 text-[12px] font-semibold text-slate-600">Kullanıcı</th>
                    <th className="text-center py-3.5 px-6 text-[12px] font-semibold text-slate-600">Rol</th>
                    <th className="text-center py-3.5 px-6 text-[12px] font-semibold text-slate-600">Durum</th>
                    <th className="text-left py-3.5 px-6 text-[12px] font-semibold text-slate-600">Kayıt Tarihi</th>
                    <th className="text-right py-3.5 px-6 text-[12px] font-semibold text-slate-600">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-slate-200/60 hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6">
                        <div>
                          <div className="text-[14px] font-semibold text-slate-900">{user.name}</div>
                          <div className="mt-0.5 text-[12px] text-slate-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold ${getRoleBadge(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold ring-1 ring-inset ${
                            user.isActive
                              ? 'bg-emerald-50 text-emerald-700 ring-emerald-200/80'
                              : 'bg-rose-50 text-rose-700 ring-rose-200/80'
                          }`}
                        >
                          {user.isActive ? 'Aktif' : 'Pasif'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-[13px] text-slate-500">
                        {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(user)}
                            className="h-9 px-3.5 rounded-xl border border-primary-200 text-primary-700 bg-primary-50/40 hover:bg-primary-50 hover:shadow-sm transition-all duration-200 text-sm font-semibold inline-flex items-center gap-2"
                          >
                            <Pencil className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                            Düzenle
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
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
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {editingUser ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Ekle'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">İsim *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {!editingUser && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Şifre *</label>
                      <input
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rol *</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="CUSTOMER">Müşteri</option>
                      <option value="RESTAURANT_ADMIN">Restoran Admin</option>
                      <option value="SUPER_ADMIN">Süper Admin</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-5 h-5 text-blue-600"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                      Aktif kullanıcı
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                      {editingUser ? 'Güncelle' : 'Oluştur'}
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
