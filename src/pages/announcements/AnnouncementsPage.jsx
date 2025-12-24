import { useState, useEffect } from 'react';
import { FiBell, FiAlertCircle, FiCheckCircle, FiInfo, FiAlertTriangle, FiPlus, FiTrash2, FiX, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';
import announcementService from '../../services/announcementService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';

import { useTranslation } from 'react-i18next';
const AnnouncementsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Filter state
  const [filterType, setFilterType] = useState('all');

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'info',
    target_audience: 'all',
    priority: 0,
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await announcementService.getAnnouncements();
      if (response.success) {
        setAnnouncements(response.data);
      }
    } catch (error) {
      toast.error('Duyurular yüklenirken hata oluştu');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWrapper = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await announcementService.createAnnouncement(formData);
      toast.success('Duyuru başarıyla oluşturuldu');
      setShowModal(false);
      setFormData({
        title: '',
        content: '',
        type: 'info',
        target_audience: 'all',
        priority: 0,
      });
      fetchAnnouncements();
    } catch (error) {
      console.error('Create error:', error);
      toast.error(error.response?.data?.message || 'Duyuru oluşturulurken hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu duyuruyu silmek istediğinizden emin misiniz?')) return;

    try {
      await announcementService.deleteAnnouncement(id);
      toast.success('Duyuru silindi');
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Silme işlemi başarısız');
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'urgent':
        return <FiAlertCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <FiAlertTriangle className="w-5 h-5 text-amber-400" />;
      case 'success':
        return <FiCheckCircle className="w-5 h-5 text-green-400" />;
      default:
        return <FiInfo className="w-5 h-5 text-blue-400" />;
    }
  };

  const getTypeStyles = (type) => {
    switch (type) {
      case 'urgent':
        return 'border-l-4 border-red-500 bg-red-500/5';
      case 'warning':
        return 'border-l-4 border-amber-500 bg-amber-500/5';
      case 'success':
        return 'border-l-4 border-green-500 bg-green-500/5';
      default:
        return 'border-l-4 border-blue-500 bg-blue-500/5';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Filter announcements
  const filteredAnnouncements = announcements.filter(item => {
    if (filterType !== 'all' && item.type !== filterType) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary-500/20">
            <FiBell className="w-6 h-6 text-primary-400" />
          </div>
          <div>
            <h1 className="font-sans text-3xl font-bold">{t('nav.announcements')}</h1>
            <p className="text-gray-600 dark:text-gray-300">Önemli bildirimler ve haberler</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input py-2 px-4 w-full sm:w-40"
          >
            <option value="all">{t('common.all')}</option>
            <option value="urgent">Acil</option>
            <option value="warning">Önemli</option>
            <option value="info">Bilgi</option>
            <option value="success">Başarı</option>
          </select>

          {isAdmin && (
            <button
              onClick={() => setShowModal(true)}
              className="btn btn-primary whitespace-nowrap"
            >
              <FiPlus className="w-4 h-4 mr-2" />
              Yeni Duyuru
            </button>
          )}
        </div>
      </div>

      {filteredAnnouncements.length === 0 ? (
        <div className="card text-center py-12">
          <FiBell className="w-12 h-12 text-gray-700 dark:text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Henüz duyuru yok</h3>
          <p className="text-gray-600 dark:text-gray-300">Yeni duyurular burada görünecektir.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((announcement) => (
            <div
              key={announcement.id}
              className={`card p-6 relative group ${getTypeStyles(announcement.type)}`}
            >
              <div className="flex items-start gap-4">
                <div className="mt-1">{getTypeIcon(announcement.type)}</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-lg mb-2">{announcement.title}</h3>
                    {/* Target Audience Badge */}
                    <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-2 border-gray-300 dark:border-gray-600 font-medium shadow-sm">
                      {announcement.target_audience === 'all' ? 'Herkese Açık' :
                        announcement.target_audience === 'students' ? 'Öğrenciler' :
                          announcement.target_audience === 'faculty' ? 'Öğretim Üyeleri' : announcement.target_audience}
                    </span>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 leading-relaxed whitespace-pre-wrap">
                    {announcement.content}
                  </p>
                  <div className="flex items-center gap-4 mt-4 text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium text-gray-700 dark:text-gray-200">
                      {announcement.author?.first_name} {announcement.author?.last_name}
                    </span>
                    <span>•</span>
                    <span>{formatDate(announcement.created_at || announcement.date)}</span>
                  </div>
                </div>
              </div>

              {isAdmin && (
                <button
                  onClick={() => handleDelete(announcement.id)}
                  className="absolute top-4 right-4 p-2 rounded-lg bg-red-100 border-2 border-red-300 text-red-700 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-200 hover:scale-110 shadow-md"
                  title={t('common.delete')}
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Announcement Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-lg shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700/50">
              <h3 className="font-sans text-xl font-semibold flex items-center gap-2">
                <FiPlus className="w-5 h-5 text-primary-400" />
                Yeni Duyuru Oluştur
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-primary-50 transition-colors text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 dark:text-gray-100"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWrapper} className="space-y-4">
              <Input
                label="Başlık"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Duyuru başlığı..."
                required
              />

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-500 dark:text-gray-400 dark:text-gray-500">İçerik</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Duyuru detayları..."
                  className="input w-full min-h-[120px] resize-y"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Duyuru Tipi"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  options={[
                    { value: 'info', label: 'Bilgi (Mavi)' },
                    { value: 'warning', label: 'Önemli (Sarı)' },
                    { value: 'urgent', label: 'Acil (Kırmızı)' },
                    { value: 'success', label: 'Başarı (Yeşil)' },
                  ]}
                />
                <Select
                  label="Hedef Kitle"
                  value={formData.target_audience}
                  onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                  options={[
                    { value: 'all', label: 'Herkes' },
                    { value: 'students', label: 'Öğrenciler' },
                    { value: 'faculty', label: 'Öğretim Üyeleri' },
                    { value: 'admin', label: 'Yöneticiler' },
                  ]}
                />
              </div>

              <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700/50 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  className="flex-1"
                  disabled={saving}
                >{t('common.cancel')}</Button>
                <Button
                  type="submit"
                  loading={saving}
                  className="flex-1"
                >
                  <FiSave className="w-4 h-4 mr-2" />
                  Yayınla
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementsPage;
