import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiBook, FiCheckCircle, FiAlertTriangle, FiXCircle, 
  FiCalendar, FiPercent, FiMapPin, FiClock
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import attendanceService from '../../services/attendanceService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

import { useTranslation } from 'react-i18next';
const MyAttendancePage = () => {
  const { t } = useTranslation();
  const [attendance, setAttendance] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('📊 MyAttendancePage: Fetching attendance data...');
      
      const [attendanceRes, activeRes] = await Promise.all([
        attendanceService.getMyAttendance(),
        attendanceService.getActiveSessions(),
      ]);
      
      console.log('✅ MyAttendancePage: Data fetched:', { attendanceRes, activeRes });
      
      if (attendanceRes.success) {
        setAttendance(attendanceRes.data || []);
        console.log(`✅ MyAttendancePage: ${attendanceRes.data?.length || 0} attendance records loaded`);
      } else {
        console.warn('⚠️ MyAttendancePage: Attendance response not successful:', attendanceRes);
        toast.error(attendanceRes.message || 'Yoklama bilgileri yüklenirken hata oluştu');
      }
      
      if (activeRes.success) {
        setActiveSessions(activeRes.data || []);
        console.log(`✅ MyAttendancePage: ${activeRes.data?.length || 0} active sessions loaded`);
      } else {
        console.warn('⚠️ MyAttendancePage: Active sessions response not successful:', activeRes);
      }
    } catch (error) {
      console.error('❌ MyAttendancePage: Fetch data error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast.error(error.response?.data?.message || 'Veriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'critical':
        return {
          color: 'text-red-400',
          bg: 'bg-red-500/20',
          border: 'border-red-500/30',
          icon: FiXCircle,
          label: 'Kritik',
        };
      case 'warning':
        return {
          color: 'text-amber-400',
          bg: 'bg-amber-500/20',
          border: 'border-amber-500/30',
          icon: FiAlertTriangle,
          label: 'Uyarı',
        };
      default:
        return {
          color: 'text-green-400',
          bg: 'bg-green-500/20',
          border: 'border-green-500/30',
          icon: FiCheckCircle,
          label: 'İyi',
        };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="font-sans text-3xl font-bold mb-2">Devam Durumum</h1>
        <p className="text-gray-600 dark:text-gray-300">Derslere katılım durumunuzu görüntüleyin</p>
      </div>

      {/* Active Sessions Banner */}
      {activeSessions.length > 0 && (
        <div className="mb-8">
          <h2 className="font-sans text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />{t('attendance.activeSessions')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeSessions.map((session) => (
              <div
                key={session.id}
                className={`card border-2 ${
                  session.alreadyCheckedIn ? 'border-green-500/30 bg-green-500/5' : 'border-primary-500/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{session.course?.code}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">{session.course?.name}</div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-700 dark:text-gray-200">
                      <span className="flex items-center gap-1">
                        <FiMapPin className="w-3 h-3" />
                        {session.classroom || 'Belirtilmemiş'}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiClock className="w-3 h-3" />
                        {session.startTime}
                      </span>
                    </div>
                  </div>
                  
                  {session.alreadyCheckedIn ? (
                    <div className="flex items-center gap-2 text-green-400">
                      <FiCheckCircle className="w-5 h-5" />
                      <span className="text-sm">Verildi</span>
                    </div>
                  ) : (
                    <Link
                      to={`/attendance/give/${session.id}`}
                      className="btn btn-primary"
                    >{t('attendance.giveAttendance')}</Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attendance Summary */}
      {attendance.length === 0 ? (
        <div className="card text-center py-16">
          <FiCalendar className="w-16 h-16 mx-auto text-gray-700 dark:text-gray-200 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Devam Kaydı Yok</h2>
          <p className="text-gray-600 dark:text-gray-300">Henüz devam kaydınız bulunmuyor.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {attendance.map((course) => {
            const statusConfig = getStatusConfig(course.status);
            const StatusIcon = statusConfig.icon;
            
            return (
              <div key={course.sectionId} className={`card border ${statusConfig.border}`}>
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl ${statusConfig.bg} flex items-center justify-center`}>
                    <FiBook className={`w-6 h-6 ${statusConfig.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{course.course?.code}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${statusConfig.bg} ${statusConfig.color}`}>
                        <StatusIcon className="w-3 h-3 inline mr-1" />
                        {statusConfig.label}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">{course.course?.name}</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-300">{t('attendance.attendanceRate')}</span>
                    <span className={`font-bold ${statusConfig.color}`}>
                      %{course.attendancePercentage}
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        course.status === 'critical' ? 'bg-red-500' :
                        course.status === 'warning' ? 'bg-amber-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${course.attendancePercentage}%` }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-green-100 border-2 border-green-300 shadow-md hover:scale-105 transition-all duration-300">
                    <div className="text-lg font-bold text-green-700">{course.present}</div>
                    <div className="text-xs text-green-600 font-medium">Katıldı</div>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-100 border-2 border-amber-300 shadow-md hover:scale-105 transition-all duration-300">
                    <div className="text-lg font-bold text-amber-700">{course.late}</div>
                    <div className="text-xs text-amber-600 font-medium">{t('attendance.late')}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-blue-100 border-2 border-blue-300 shadow-md hover:scale-105 transition-all duration-300">
                    <div className="text-lg font-bold text-blue-700">{course.excused}</div>
                    <div className="text-xs text-blue-600 font-medium">Mazeretli</div>
                  </div>
                  <div className="p-2 rounded-lg bg-red-100 border-2 border-red-300 shadow-md hover:scale-105 transition-all duration-300">
                    <div className="text-lg font-bold text-red-700">{course.absent}</div>
                    <div className="text-xs text-red-600 font-medium">Devamsız</div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700/50 flex justify-between items-center">
                  <span className="text-sm text-gray-700 dark:text-gray-200">
                    Toplam: {course.totalSessions} oturum
                  </span>
                  <Link
                    to={`/attendance/excuse?section=${course.sectionId}`}
                    className="text-sm text-primary-400 hover:text-primary-300"
                  >
                    Mazeret Bildir
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Warning Box */}
      {attendance.some((c) => c.status === 'critical') && (
        <div className="mt-8 p-6 rounded-xl bg-red-500/10 border border-red-500/30">
          <div className="flex items-start gap-4">
            <FiAlertTriangle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-400 mb-2">Kritik Devamsızlık Uyarısı</h3>
              <p className="text-sm text-red-200">
                Bazı derslerinizde devamsızlık oranınız %30'u aşmıştır. 
                Devamsızlık sınırını aşan öğrenciler dersten başarısız sayılabilir. 
                Lütfen danışmanınızla görüşün.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAttendancePage;





