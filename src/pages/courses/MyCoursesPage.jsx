import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiBook, FiClock, FiUser, FiMapPin, FiCalendar, 
  FiAlertTriangle, FiCheckCircle, FiXCircle, FiTrash2,
  FiLoader, FiInfo
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import enrollmentService from '../../services/enrollmentService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const MyCoursesPage = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dropping, setDropping] = useState(null);
  const [showDropModal, setShowDropModal] = useState(null);

  const dayNames = {
    monday: 'Pzt',
    tuesday: 'Sal',
    wednesday: 'Çar',
    thursday: 'Per',
    friday: 'Cum',
    saturday: 'Cmt',
    sunday: 'Paz',
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      console.log('📚 MyCoursesPage: Fetching enrollments...');
      // Fetch all enrollments (pending, enrolled, rejected) - not just enrolled
      const response = await enrollmentService.getMyCourses({});
      console.log('✅ MyCoursesPage: Enrollments fetched:', response);
      
      if (response.success) {
        // Filter to show pending, enrolled and rejected (not dropped, completed, failed, withdrawn)
        const activeEnrollments = (response.data || []).filter(
          (e) => ['pending', 'enrolled', 'rejected'].includes(e.status)
        );
        setEnrollments(activeEnrollments);
        console.log(`✅ MyCoursesPage: ${activeEnrollments.length} active enrollments loaded`);
      } else {
        console.warn('⚠️ MyCoursesPage: Response not successful:', response);
        toast.error(response.message || 'Dersler yüklenirken hata oluştu');
      }
    } catch (error) {
      console.error('❌ MyCoursesPage: Fetch enrollments error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      
      // Daha açıklayıcı hata mesajları
      let errorMessage = 'Dersler yüklenirken hata oluştu';
      if (error.response?.status === 403) {
        errorMessage = error.response?.data?.message || 'Öğrenci kaydı bulunamadı. Lütfen yönetici ile iletişime geçin.';
      } else if (error.response?.status === 500) {
        errorMessage = error.response?.data?.message || 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.';
      } else if (!error.response) {
        errorMessage = 'Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = async (enrollmentId) => {
    try {
      setDropping(enrollmentId);
      console.log('🗑️ MyCoursesPage: Dropping enrollment:', enrollmentId);
      const response = await enrollmentService.dropCourse(enrollmentId);
      console.log('✅ MyCoursesPage: Drop response:', response);
      
      if (response.success) {
        toast.success(response.message || 'Ders başarıyla bırakıldı');
        setEnrollments((prev) => prev.filter((e) => e.id !== enrollmentId));
        console.log('✅ MyCoursesPage: Enrollment removed from list');
      } else {
        console.warn('⚠️ MyCoursesPage: Drop response not successful:', response);
        toast.error(response.message || 'Ders bırakılırken hata oluştu');
      }
    } catch (error) {
      console.error('❌ MyCoursesPage: Drop error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      const errorMessage = error.response?.data?.message || error.message || 'Ders bırakılırken hata oluştu';
      toast.error(errorMessage);
    } finally {
      setDropping(null);
      setShowDropModal(null);
    }
  };

  const formatSchedule = (schedule) => {
    if (!schedule || !Array.isArray(schedule)) return [];
    return schedule.map((slot) => ({
      day: dayNames[slot.day] || slot.day,
      time: `${slot.start_time}-${slot.end_time}`,
    }));
  };

  const getAttendanceStatus = (attendance) => {
    if (!attendance) return { color: 'text-slate-400', bg: 'bg-slate-700', label: 'Bilinmiyor' };
    
    if (attendance.status === 'critical') {
      return { color: 'text-red-400', bg: 'bg-red-500/20', label: 'Kritik', icon: FiXCircle };
    } else if (attendance.status === 'warning') {
      return { color: 'text-amber-400', bg: 'bg-amber-500/20', label: 'Uyarı', icon: FiAlertTriangle };
    }
    return { color: 'text-green-400', bg: 'bg-green-500/20', label: 'İyi', icon: FiCheckCircle };
  };

  const getEnrollmentStatus = (status) => {
    switch (status) {
      case 'pending':
        return {
          color: 'text-amber-400',
          bg: 'bg-amber-500/20',
          border: 'border-amber-500/30',
          label: 'Onay Bekliyor',
          icon: FiLoader,
          description: 'Öğretim üyesi onayı bekleniyor',
        };
      case 'enrolled':
        return {
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/20',
          border: 'border-emerald-500/30',
          label: 'Kayıtlı',
          icon: FiCheckCircle,
          description: 'Derse kayıtlısınız',
        };
      case 'rejected':
        return {
          color: 'text-red-400',
          bg: 'bg-red-500/20',
          border: 'border-red-500/30',
          label: 'Reddedildi',
          icon: FiXCircle,
          description: 'Kayıt talebiniz reddedildi',
        };
      default:
        return {
          color: 'text-slate-400',
          bg: 'bg-slate-700',
          border: 'border-slate-600',
          label: status,
          icon: FiInfo,
          description: '',
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
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold mb-2">Derslerim</h1>
          <p className="text-slate-400">Kayıtlı olduğunuz dersler</p>
        </div>
        <Link to="/courses" className="btn btn-primary">
          <FiBook className="w-4 h-4 mr-2" />
          Ders Ekle
        </Link>
      </div>

      {/* Enrollments */}
      {enrollments.length === 0 ? (
        <div className="card text-center py-16">
          <FiBook className="w-16 h-16 mx-auto text-slate-600 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Henüz Ders Kaydınız Yok</h2>
          <p className="text-slate-400 mb-4">Ders kataloğundan ders ekleyebilirsiniz.</p>
          <Link to="/courses" className="btn btn-primary">
            Ders Kataloğuna Git
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {enrollments.map((enrollment) => {
            const attendanceStatus = getAttendanceStatus(enrollment.attendance);
            const scheduleItems = formatSchedule(enrollment.section?.schedule);
            
            return (
              <div key={enrollment.id} className="card">
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Course Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center shrink-0">
                        <FiBook className="w-7 h-7 text-primary-400" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded bg-slate-700 text-xs font-medium">
                            {enrollment.course?.code}
                          </span>
                          <span className="text-xs text-slate-500">
                            Section {enrollment.section?.sectionNumber}
                          </span>
                        </div>
                        
                        <Link 
                          to={`/courses/${enrollment.course?.id}`}
                          className="font-sans text-lg font-semibold hover:text-primary-600 transition-colors"
                        >
                          {enrollment.course?.name}
                        </Link>
                        
                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-400">
                          {enrollment.section?.instructor && (
                            <span className="flex items-center gap-1">
                              <FiUser className="w-4 h-4" />
                              {enrollment.section.instructor}
                            </span>
                          )}
                          {enrollment.section?.classroom && (
                            <span className="flex items-center gap-1">
                              <FiMapPin className="w-4 h-4" />
                              {enrollment.section.classroom}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <FiClock className="w-4 h-4" />
                            {enrollment.course?.credits} Kredi
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Schedule */}
                  <div className="flex flex-wrap gap-2 lg:w-48">
                    {scheduleItems.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-1 px-2 py-1 rounded bg-blue-50 border border-blue-200 text-xs shadow-sm">
                        <FiCalendar className="w-3 h-3 text-blue-600" />
                        <span className="font-medium text-blue-700">{item.day}</span>
                        <span className="text-blue-600">{item.time}</span>
                      </div>
                    ))}
                  </div>

                  {/* Attendance */}
                  <div className="flex items-center gap-4">
                    <div className={`px-4 py-2 rounded-xl border-2 shadow-md hover:scale-105 transition-all duration-300 ${
                      attendanceStatus.color === 'text-red-400' 
                        ? 'bg-red-100 border-red-300' 
                        : attendanceStatus.color === 'text-amber-400'
                        ? 'bg-amber-100 border-amber-300'
                        : 'bg-green-100 border-green-300'
                    }`}>
                      <div className="flex items-center gap-2">
                        {attendanceStatus.icon && (
                          <attendanceStatus.icon className={`w-4 h-4 ${
                            attendanceStatus.color === 'text-red-400' 
                              ? 'text-red-700' 
                              : attendanceStatus.color === 'text-amber-400'
                              ? 'text-amber-700'
                              : 'text-green-700'
                          }`} />
                        )}
                        <span className={`text-lg font-bold ${
                          attendanceStatus.color === 'text-red-400' 
                            ? 'text-red-700' 
                            : attendanceStatus.color === 'text-amber-400'
                            ? 'text-amber-700'
                            : 'text-green-700'
                        }`}>
                          %{enrollment.attendance?.attendancePercentage || 100}
                        </span>
                      </div>
                      <div className={`text-xs font-medium mt-1 ${
                        attendanceStatus.color === 'text-red-400' 
                          ? 'text-red-600' 
                          : attendanceStatus.color === 'text-amber-400'
                          ? 'text-amber-600'
                          : 'text-green-600'
                      }`}>Devam</div>
                    </div>

                    {/* Actions */}
                    <button
                      onClick={() => setShowDropModal(enrollment.id)}
                      className="p-2 rounded-lg bg-red-100 border-2 border-red-300 text-red-700 hover:bg-red-200 hover:scale-110 transition-all duration-300 shadow-md"
                      title="Dersi Bırak"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Grades Preview */}
                {(enrollment.grades?.midterm || enrollment.grades?.final) && (
                  <div className="mt-4 pt-4 border-t border-slate-700/50">
                    <div className="flex items-center gap-6 text-sm">
                      <span className="text-slate-400">Notlar:</span>
                      {enrollment.grades?.midterm && (
                        <span>
                          <span className="text-slate-400">Vize:</span>{' '}
                          <span className="font-medium">{enrollment.grades.midterm}</span>
                        </span>
                      )}
                      {enrollment.grades?.final && (
                        <span>
                          <span className="text-slate-400">Final:</span>{' '}
                          <span className="font-medium">{enrollment.grades.final}</span>
                        </span>
                      )}
                      {enrollment.grades?.letterGrade && (
                        <span className="px-2 py-0.5 rounded bg-primary-500/20 text-primary-400 font-medium">
                          {enrollment.grades.letterGrade}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Drop Confirmation Modal */}
      {showDropModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card max-w-md mx-4">
            <h3 className="font-display text-xl font-semibold mb-4">Dersi Bırak</h3>
            <p className="text-slate-400 mb-6">
              Bu dersi bırakmak istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDropModal(null)}
                className="btn btn-secondary"
                disabled={dropping}
              >
                İptal
              </button>
              <button
                onClick={() => handleDrop(showDropModal)}
                className="btn bg-red-500 hover:bg-red-600 text-white"
                disabled={dropping}
              >
                {dropping ? <LoadingSpinner size="sm" /> : 'Dersi Bırak'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCoursesPage;


