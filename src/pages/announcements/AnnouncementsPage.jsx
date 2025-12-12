import { useState, useEffect } from 'react';
import { FiBell, FiCalendar, FiUser } from 'react-icons/fi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AnnouncementsPage = () => {
  const [loading, setLoading] = useState(false);

  // Placeholder data - Backend'de announcement sistemi yoksa bu şekilde kalabilir
  const announcements = [
    {
      id: 1,
      title: 'Dönem Sonu Sınav Programı Yayınlandı',
      content: '2024-2025 Güz dönemi final sınav programı yayınlanmıştır. Detaylı bilgi için öğrenci işlerine başvurunuz.',
      author: 'Öğrenci İşleri',
      date: new Date('2024-01-15'),
      type: 'info',
    },
    {
      id: 2,
      title: 'Ders Kayıt Tarihleri',
      content: '2024-2025 Bahar dönemi ders kayıtları 15 Şubat - 20 Şubat tarihleri arasında yapılacaktır.',
      author: 'Kayıt Ofisi',
      date: new Date('2024-01-10'),
      type: 'warning',
    },
    {
      id: 3,
      title: 'Yeni Ders Materyalleri Eklendi',
      content: 'CSE301 - Yazılım Mühendisliği dersi için yeni materyaller sisteme yüklenmiştir.',
      author: 'Dr. Ahmet Yılmaz',
      date: new Date('2024-01-08'),
      type: 'success',
    },
  ];

  const getTypeColor = (type) => {
    switch (type) {
      case 'info':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'warning':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'success':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-slate-800/50 text-slate-400 border-slate-700/30';
    }
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-2">Duyurular</h1>
        <p className="text-slate-400">Önemli duyurular ve güncellemeler</p>
      </div>

      {/* Announcements List */}
      {announcements.length === 0 ? (
        <div className="card text-center py-16">
          <FiBell className="w-16 h-16 mx-auto text-slate-600 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Duyuru Bulunamadı</h2>
          <p className="text-slate-400">Henüz duyuru bulunmuyor.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className={`card border ${getTypeColor(announcement.type)}`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl ${getTypeColor(announcement.type)} flex items-center justify-center shrink-0`}>
                  <FiBell className="w-6 h-6" />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-display text-lg font-semibold mb-2">
                    {announcement.title}
                  </h3>
                  
                  <p className="text-slate-300 mb-4">
                    {announcement.content}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <div className="flex items-center gap-2">
                      <FiUser className="w-4 h-4" />
                      <span>{announcement.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiCalendar className="w-4 h-4" />
                      <span>{formatDate(announcement.date)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnnouncementsPage;

