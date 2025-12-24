import { useState, useEffect } from 'react';
import { FiUser, FiSearch, FiFilter, FiToggleLeft, FiToggleRight, FiTrash2, FiMail, FiCalendar } from 'react-icons/fi';
import toast from 'react-hot-toast';
import userService from '../../services/userService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

import { useTranslation } from 'react-i18next';
const AdminUsersPage = () => {
  const { t } = useTranslation();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        role: '',
        search: '',
        is_active: '',
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
    });

    useEffect(() => {
        fetchUsers();
    }, [filters.role, filters.is_active, pagination.page]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await userService.getAllUsers({
                page: pagination.page,
                limit: pagination.limit,
                role: filters.role || undefined,
                is_active: filters.is_active || undefined,
                search: filters.search || undefined,
            });
            if (response.success) {
                // Backend returns data directly as array, not data.users
                const usersData = Array.isArray(response.data) ? response.data : (response.data.users || []);
                setUsers(usersData);
                setPagination(prev => ({
                    ...prev,
                    total: response.pagination?.total || usersData.length,
                    totalPages: response.pagination?.totalPages || 1,
                }));
            }
        } catch (error) {
            toast.error('Kullanıcılar yüklenirken hata oluştu');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchUsers();
    };

    const handleToggleStatus = async (userId, currentStatus) => {
        try {
            const response = await userService.updateUserStatus(userId, !currentStatus);
            if (response.success) {
                toast.success(currentStatus ? 'Kullanıcı deaktif edildi' : 'Kullanıcı aktif edildi');
                fetchUsers();
            }
        } catch (error) {
            toast.error('Durum güncellenirken hata oluştu');
        }
    };

    const getRoleLabel = (role) => {
        const roles = {
            student: 'Öğrenci',
            faculty: 'Öğretim Üyesi',
            admin: 'Yönetici',
        };
        return roles[role] || role;
    };

    const getRoleBadgeClass = (role) => {
        switch (role) {
            case 'admin':
                return 'bg-red-500/20 text-red-400';
            case 'faculty':
                return 'bg-blue-500/20 text-blue-400';
            case 'student':
                return 'bg-blue-500/20 text-blue-400';
            default:
                return 'bg-gray-300/20 text-gray-600 dark:text-gray-300';
        }
    };

    if (loading && users.length === 0) {
        return (
            <div className="flex justify-center py-16">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="font-display text-3xl font-bold mb-2">Kullanıcı Yönetimi</h1>
                <p className="text-gray-600 dark:text-gray-300">Tüm kullanıcıları görüntüleyin ve yönetin</p>
            </div>

            {/* Filters */}
            <div className="card mb-6">
                <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <FiFilter className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">Filtreler:</span>
                    </div>

                    <select
                        value={filters.role}
                        onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                        className="input w-40"
                    >
                        <option value="">Tüm Roller</option>
                        <option value="student">{t('roles.student')}</option>
                        <option value="faculty">{t('roles.faculty')}</option>
                        <option value="admin">{t('roles.admin')}</option>
                    </select>

                    <select
                        value={filters.is_active}
                        onChange={(e) => setFilters({ ...filters, is_active: e.target.value })}
                        className="input w-36"
                    >
                        <option value="">Tüm Durumlar</option>
                        <option value="true">{t('common.active')}</option>
                        <option value="false">{t('common.inactive')}</option>
                    </select>

                    <div className="flex-1 max-w-md">
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 dark:text-gray-300" />
                            <input
                                type="text"
                                placeholder="Ad, soyad veya e-posta ara..."
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                className="input pl-10 w-full"
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary">{t('common.search')}</button>
                </form>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="card text-center py-4">
                    <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{pagination.total}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Toplam Kullanıcı</div>
                </div>
                <div className="card text-center py-4">
                    <div className="text-2xl font-bold text-blue-400">
                        {users.filter(u => u.role === 'student').length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">{t('roles.student')}</div>
                </div>
                <div className="card text-center py-4">
                    <div className="text-2xl font-bold text-blue-400">
                        {users.filter(u => u.role === 'faculty').length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">{t('roles.faculty')}</div>
                </div>
                <div className="card text-center py-4">
                    <div className="text-2xl font-bold text-red-400">
                        {users.filter(u => u.role === 'admin').length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">{t('roles.admin')}</div>
                </div>
            </div>

            {/* Users Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700/50">
                                <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-300">Kullanıcı</th>
                                <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-300">{t('auth.email')}</th>
                                <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-300">Rol</th>
                                <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-300">Kayıt Tarihi</th>
                                <th className="text-center p-4 font-medium text-gray-600 dark:text-gray-300">{t('common.status')}</th>
                                <th className="text-right p-4 font-medium text-gray-600 dark:text-gray-300">{t('wallet.transactions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700 dark:divide-gray-700">
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-600 dark:text-gray-300">
                                        Kullanıcı bulunamadı
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800/30 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center">
                                                    <FiUser className="w-5 h-5 text-primary-400" />
                                                </div>
                                                <div>
                                                    <div className="font-medium">{user.first_name} {user.last_name}</div>
                                                    {user.student?.student_number && (
                                                        <div className="text-xs text-gray-700 dark:text-gray-200">{user.student.student_number}</div>
                                                    )}
                                                    {user.faculty?.employee_number && (
                                                        <div className="text-xs text-gray-700 dark:text-gray-200">{user.faculty.employee_number}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
                                                <FiMail className="w-4 h-4 text-gray-700 dark:text-gray-200" />
                                                {user.email}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeClass(user.role)}`}>
                                                {getRoleLabel(user.role)}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                                <FiCalendar className="w-4 h-4" />
                                                {user.created_at ? new Date(user.created_at).toLocaleDateString('tr-TR') : '-'}
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.is_active
                                                ? 'bg-green-500/20 text-green-400'
                                                : 'bg-red-500/20 text-red-400'
                                                }`}>
                                                {user.is_active ? t('common.active') : t('common.inactive')}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleToggleStatus(user.id, user.is_active)}
                                                    className={`p-2 rounded-lg transition-colors ${user.is_active
                                                        ? 'hover:bg-red-500/20 text-gray-600 dark:text-gray-300 hover:text-red-400'
                                                        : 'hover:bg-green-500/20 text-gray-600 dark:text-gray-300 hover:text-green-400'
                                                        }`}
                                                    title={user.is_active ? 'Deaktif Et' : 'Aktif Et'}
                                                >
                                                    {user.is_active ? (
                                                        <FiToggleRight className="w-5 h-5" />
                                                    ) : (
                                                        <FiToggleLeft className="w-5 h-5" />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700/50">
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                            Sayfa {pagination.page} / {pagination.totalPages} (Toplam {pagination.total} kullanıcı)
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                disabled={pagination.page === 1}
                                className="btn btn-secondary btn-sm"
                            >{t('common.previous')}</button>
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                disabled={pagination.page >= pagination.totalPages}
                                className="btn btn-secondary btn-sm"
                            >
                                Sonraki
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminUsersPage;
