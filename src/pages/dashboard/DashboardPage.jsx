import { useAuth } from '../../context/AuthContext';
import { FiBook, FiCalendar, FiClipboard, FiUsers, FiTrendingUp, FiBell } from 'react-icons/fi';

const DashboardPage = () => {
  const { user } = useAuth();

  const getRoleLabel = (role) => {
    const roles = {
      student: 'Öğrenci',
      faculty: 'Öğretim Üyesi',
      admin: 'Yönetici',
    };
    return roles[role] || role;
  };

  const studentStats = [
    { label: 'Aktif Dersler', value: '6', icon: FiBook, color: 'from-blue-500 to-cyan-500' },
    { label: 'Bugünkü Dersler', value: '3', icon: FiCalendar, color: 'from-purple-500 to-pink-500' },
    { label: 'Genel Not Ort.', value: '3.45', icon: FiClipboard, color: 'from-green-500 to-emerald-500' },
    { label: 'Bildirimler', value: '5', icon: FiBell, color: 'from-orange-500 to-red-500' },
  ];

  const facultyStats = [
    { label: 'Verdiğim Dersler', value: '4', icon: FiBook, color: 'from-blue-500 to-cyan-500' },
    { label: 'Toplam Öğrenci', value: '127', icon: FiUsers, color: 'from-purple-500 to-pink-500' },
    { label: 'Bugünkü Dersler', value: '2', icon: FiCalendar, color: 'from-green-500 to-emerald-500' },
    { label: 'Bekleyen Ödevler', value: '12', icon: FiClipboard, color: 'from-orange-500 to-red-500' },
  ];

  const adminStats = [
    { label: 'Toplam Kullanıcı', value: '1,234', icon: FiUsers, color: 'from-blue-500 to-cyan-500' },
    { label: 'Aktif Öğrenci', value: '1,100', icon: FiTrendingUp, color: 'from-purple-500 to-pink-500' },
    { label: 'Öğretim Üyesi', value: '85', icon: FiBook, color: 'from-green-500 to-emerald-500' },
    { label: 'Bölümler', value: '12', icon: FiCalendar, color: 'from-orange-500 to-red-500' },
  ];

  const getStats = () => {
    switch (user?.role) {
      case 'admin':
        return adminStats;
      case 'faculty':
        return facultyStats;
      default:
        return studentStats;
    }
  };

  const stats = getStats();

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-2">
          Hoş Geldiniz, <span className="gradient-text">{user?.first_name}</span>!
        </h1>
        <p className="text-slate-400">
          {getRoleLabel(user?.role)} paneline hoş geldiniz. Bugün neler yapmak istersiniz?
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="card-hover group animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded-full">
                Bu ay
              </span>
            </div>
            <h3 className="text-3xl font-bold mb-1">{stat.value}</h3>
            <p className="text-slate-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="card">
          <h2 className="font-display text-xl font-bold mb-4">Hızlı İşlemler</h2>
          <div className="grid grid-cols-2 gap-3">
            {user?.role === 'student' && (
              <>
                <button className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors text-left">
                  <FiBook className="w-5 h-5 text-primary-400 mb-2" />
                  <span className="block text-sm font-medium">Ders Kaydı</span>
                </button>
                <button className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors text-left">
                  <FiCalendar className="w-5 h-5 text-accent-400 mb-2" />
                  <span className="block text-sm font-medium">Ders Programı</span>
                </button>
                <button className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors text-left">
                  <FiClipboard className="w-5 h-5 text-green-400 mb-2" />
                  <span className="block text-sm font-medium">Notlarım</span>
                </button>
                <button className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors text-left">
                  <FiBell className="w-5 h-5 text-orange-400 mb-2" />
                  <span className="block text-sm font-medium">Duyurular</span>
                </button>
              </>
            )}
            {user?.role === 'faculty' && (
              <>
                <button className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors text-left">
                  <FiUsers className="w-5 h-5 text-primary-400 mb-2" />
                  <span className="block text-sm font-medium">Yoklama Al</span>
                </button>
                <button className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors text-left">
                  <FiClipboard className="w-5 h-5 text-accent-400 mb-2" />
                  <span className="block text-sm font-medium">Not Girişi</span>
                </button>
                <button className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors text-left">
                  <FiBook className="w-5 h-5 text-green-400 mb-2" />
                  <span className="block text-sm font-medium">Ders Materyali</span>
                </button>
                <button className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors text-left">
                  <FiCalendar className="w-5 h-5 text-orange-400 mb-2" />
                  <span className="block text-sm font-medium">Sınav Planla</span>
                </button>
              </>
            )}
            {user?.role === 'admin' && (
              <>
                <button className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors text-left">
                  <FiUsers className="w-5 h-5 text-primary-400 mb-2" />
                  <span className="block text-sm font-medium">Kullanıcı Ekle</span>
                </button>
                <button className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors text-left">
                  <FiBook className="w-5 h-5 text-accent-400 mb-2" />
                  <span className="block text-sm font-medium">Ders Ekle</span>
                </button>
                <button className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors text-left">
                  <FiTrendingUp className="w-5 h-5 text-green-400 mb-2" />
                  <span className="block text-sm font-medium">Raporlar</span>
                </button>
                <button className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors text-left">
                  <FiCalendar className="w-5 h-5 text-orange-400 mb-2" />
                  <span className="block text-sm font-medium">Takvim</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h2 className="font-display text-xl font-bold mb-4">Son Aktiviteler</h2>
          <div className="space-y-4">
            {[
              { time: '2 saat önce', text: 'Yeni duyuru: Dönem sonu sınav programı yayınlandı', type: 'info' },
              { time: '5 saat önce', text: 'BM301 dersi için ödev yüklendi', type: 'success' },
              { time: '1 gün önce', text: 'Profil bilgileriniz güncellendi', type: 'default' },
              { time: '2 gün önce', text: 'BM201 vize sonuçları açıklandı', type: 'warning' },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors"
              >
                <div className={`w-2 h-2 mt-2 rounded-full ${
                  activity.type === 'success' ? 'bg-green-500' :
                  activity.type === 'warning' ? 'bg-yellow-500' :
                  activity.type === 'info' ? 'bg-blue-500' : 'bg-slate-500'
                }`} />
                <div>
                  <p className="text-sm text-slate-300">{activity.text}</p>
                  <span className="text-xs text-slate-500">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Placeholder for upcoming features */}
      <div className="mt-8 p-6 border-2 border-dashed border-slate-700 rounded-2xl text-center">
        <p className="text-slate-500">
          🚀 Yeni özellikler yakında eklenecek: Ders yönetimi, yoklama sistemi, not girişi ve daha fazlası!
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;

