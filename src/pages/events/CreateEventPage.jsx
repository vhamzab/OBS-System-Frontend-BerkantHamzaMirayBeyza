import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiClock, FiMapPin, FiUsers, FiTag, FiDollarSign, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import eventService from '../../services/eventService';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';

import { useTranslation } from 'react-i18next';
const CreateEventPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'conference',
    date: '',
    start_time: '',
    end_time: '',
    location: '',
    capacity: '',
    is_paid: false,
    price: '',
    registration_deadline: '',
    status: 'published',
  });

  useEffect(() => {
    // Öğrenciler etkinlik oluşturamaz
    if (user && user.role === 'student') {
      toast.error('Öğrenciler etkinlik oluşturamaz');
      navigate('/events');
    }
  }, [user, navigate]);

  const categories = [
    { value: 'conference', label: 'Konferans' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'social', label: 'Sosyal' },
    { value: 'sports', label: 'Spor' },
  ];

  const statusOptions = [
    { value: 'draft', label: 'Taslak' },
    { value: 'published', label: 'Yayınlandı' },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title || !formData.description || !formData.date || !formData.start_time || !formData.end_time || !formData.location || !formData.capacity) {
      toast.error('Lütfen tüm zorunlu alanları doldurun');
      return;
    }

    if (formData.is_paid && (!formData.price || parseFloat(formData.price) <= 0)) {
      toast.error('Ücretli etkinlik için geçerli bir fiyat girin');
      return;
    }

    if (new Date(formData.date) < new Date()) {
      toast.error('Etkinlik tarihi geçmiş bir tarih olamaz');
      return;
    }

    if (formData.registration_deadline && new Date(formData.registration_deadline) > new Date(formData.date)) {
      toast.error('Kayıt son tarihi etkinlik tarihinden sonra olamaz');
      return;
    }

    try {
      setLoading(true);
      const submitData = {
        ...formData,
        capacity: parseInt(formData.capacity),
        price: formData.is_paid ? parseFloat(formData.price) : 0,
        registration_deadline: formData.registration_deadline || null,
      };

      const response = await eventService.createEvent(submitData);
      if (response.success) {
        toast.success('Etkinlik başarıyla oluşturuldu');
        navigate('/events');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Etkinlik oluşturulurken hata oluştu');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-400 dark:text-gray-500 mb-6"
      >
        <FiArrowLeft />
        Geri Dön
      </button>

      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-2">Yeni Etkinlik Oluştur</h1>
        <p className="text-gray-600 dark:text-gray-300">Etkinlik bilgilerini doldurun</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Etkinlik Başlığı <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="input w-full"
            placeholder="Etkinlik başlığını girin"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2">{t('courses.description')}<span className="text-red-400">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="input w-full min-h-[120px]"
            placeholder="Etkinlik açıklamasını girin"
            required
          />
        </div>

        {/* Category and Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">{t('events.category')}<span className="text-red-400">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="input w-full"
              required
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('common.status')}<span className="text-red-400">*</span>
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="input w-full"
              required
            >
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              <FiCalendar className="inline mr-1" />{t('common.date')}<span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="input w-full"
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              <FiClock className="inline mr-1" />
              Başlangıç Saati <span className="text-red-400">*</span>
            </label>
            <input
              type="time"
              name="start_time"
              value={formData.start_time}
              onChange={handleChange}
              className="input w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              <FiClock className="inline mr-1" />
              Bitiş Saati <span className="text-red-400">*</span>
            </label>
            <input
              type="time"
              name="end_time"
              value={formData.end_time}
              onChange={handleChange}
              className="input w-full"
              required
            />
          </div>
        </div>

        {/* Location and Capacity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              <FiMapPin className="inline mr-1" />{t('events.location')}<span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="input w-full"
              placeholder="Etkinlik konumu"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              <FiUsers className="inline mr-1" />{t('courses.capacity')}<span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              className="input w-full"
              placeholder="Maksimum katılımcı sayısı"
              min="1"
              required
            />
          </div>
        </div>

        {/* Registration Deadline */}
        <div>
          <label className="block text-sm font-medium mb-2">
            <FiCalendar className="inline mr-1" />
            Kayıt Son Tarihi (Opsiyonel)
          </label>
          <input
            type="date"
            name="registration_deadline"
            value={formData.registration_deadline}
            onChange={handleChange}
            className="input w-full"
            max={formData.date || undefined}
          />
        </div>

        {/* Paid Event */}
        <div className="border-t border-gray-200 dark:border-gray-700/50 pt-4">
          <div className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              name="is_paid"
              id="is_paid"
              checked={formData.is_paid}
              onChange={handleChange}
              className="w-5 h-5 rounded border-gray-200 dark:border-gray-700 bg-primary-50 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="is_paid" className="text-sm font-medium cursor-pointer">
              Ücretli Etkinlik
            </label>
          </div>

          {formData.is_paid && (
            <div>
              <label className="block text-sm font-medium mb-2">
                <FiDollarSign className="inline mr-1" />
                Ücret (TRY) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="input w-full"
                placeholder="0.00"
                min="0"
                step="0.01"
                required={formData.is_paid}
              />
            </div>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700/50">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate(-1)}
            className="flex-1"
          >{t('common.cancel')}</Button>
          <Button
            type="submit"
            loading={loading}
            className="flex-1"
          >{t('events.createEvent')}</Button>
        </div>
      </form>
    </div>
  );
};

export default CreateEventPage;

