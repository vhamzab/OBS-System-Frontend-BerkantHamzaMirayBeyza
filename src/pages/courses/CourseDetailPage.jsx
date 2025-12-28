import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  FiBook, FiClock, FiUsers, FiArrowLeft, FiCalendar, 
  FiMapPin, FiUser, FiCheckCircle, FiAlertCircle, FiLink,
  FiXCircle, FiInfo
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import courseService from '../../services/courseService';
import enrollmentService from '../../services/enrollmentService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

import { useTranslation } from 'react-i18next';
const CourseDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [prerequisites, setPrerequisites] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);
  const [eligibility, setEligibility] = useState({});

  const isStudent = user?.role === 'student';

  const dayNames = {
    monday: 'Pazartesi',
    tuesday: 'Salı',
    wednesday: 'Çarşamba',
    thursday: 'Perşembe',
    friday: 'Cuma',
    saturday: 'Cumartesi',
    sunday: 'Pazar',
  };

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await courseService.getCourseById(id);
      
      if (response.success) {
        setCourse(response.data.course);
        setPrerequisites(response.data.prerequisites || []);
        setSections(response.data.sections || []);

        // Check eligibility for each section if student
        if (isStudent && response.data.sections?.length > 0) {
          for (const section of response.data.sections) {
            try {
              const eligRes = await enrollmentService.checkEligibility(section.id);
              setEligibility((prev) => ({
                ...prev,
                [section.id]: eligRes.data,
              }));
            } catch (err) {
              console.error('Eligibility check error:', err);
            }
          }
        }
      }
    } catch (error) {
      toast.error('Ders bilgileri yüklenirken hata oluştu');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (sectionId) => {
    if (!isStudent) {
      toast.error('Sadece öğrenciler ders kaydı yapabilir');
      return;
    }

    if (!sectionId) {
      toast.error('Section ID bulunamadı');
      return;
    }

    try {
      setEnrolling(sectionId);
      console.log('📝 Enrollment attempt for section:', sectionId);
      
      const response = await enrollmentService.enrollInCourse(sectionId);
      console.log('✅ Enrollment response:', response);
      
      if (response.success) {
        toast.success(response.message || 'Derse başarıyla kayıt oldunuz!');
        // Refresh course data to update eligibility
        await fetchCourse();
        // Navigate after a short delay to show success message
        setTimeout(() => {
          navigate('/my-courses');
        }, 1500);
      } else {
        toast.error(response.message || 'Kayıt olurken hata oluştu');
      }
    } catch (error) {
      console.error('❌ Enrollment error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Kayıt olurken hata oluştu';
      toast.error(errorMessage);
    } finally {
      setEnrolling(null);
    }
  };

  const formatSchedule = (schedule) => {
    if (!schedule || !Array.isArray(schedule)) return 'Belirtilmemiş';
    
    return schedule.map((slot) => 
      `${dayNames[slot.day] || slot.day} ${slot.start_time}-${slot.end_time}`
    ).join(', ');
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="card text-center py-16">
          <FiAlertCircle className="w-16 h-16 mx-auto text-red-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Ders Bulunamadı</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Aradığınız ders mevcut değil veya silinmiş olabilir.</p>
          <Link to="/courses" className="btn btn-primary">
            <FiArrowLeft className="w-4 h-4 mr-2" />
            Ders Kataloğuna Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Back Button */}
      <Link to="/courses" className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 dark:text-gray-100 mb-6 transition-colors">
        <FiArrowLeft className="w-4 h-4 mr-2" />
        Ders Kataloğuna Dön
      </Link>

      {/* Course Header */}
      <div className="card mb-8">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center shrink-0">
            <FiBook className="w-10 h-10 text-primary-400" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <span className="px-3 py-1 rounded-full bg-primary-500/20 text-primary-400 text-sm font-medium">
                  {course.code}
                </span>
                <h1 className="font-sans text-2xl md:text-3xl font-semibold mt-2">{course.name}</h1>
              </div>
              <div className="flex gap-4 text-center">
                <div className="px-4 py-2 rounded-xl bg-primary-600 border-2 border-primary-700 shadow-lg hover:scale-105 transition-all duration-300">
                  <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{course.credits}</div>
                  <div className="text-xs text-primary-100 font-medium">{t('courses.credits')}</div>
                </div>
                <div className="px-4 py-2 rounded-xl bg-accent-600 border-2 border-accent-700 shadow-lg hover:scale-105 transition-all duration-300">
                  <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{course.ects}</div>
                  <div className="text-xs text-accent-100 font-medium">AKTS</div>
                </div>
              </div>
            </div>
            
            <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 mb-4">{course.description || 'Açıklama bulunmuyor.'}</p>
            
            {course.department && (
              <div className="text-sm text-gray-600 dark:text-gray-300">
                <span className="font-medium">Bölüm:</span> {course.department.name}
              </div>
            )}
            
            {course.syllabus_url && (
              <a
                href={course.syllabus_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-primary-400 hover:text-primary-300 mt-2 transition-colors"
              >
                <FiLink className="w-4 h-4 mr-1" />
                Ders İzlencesi
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Prerequisites */}
        <div className="lg:col-span-1">
          <div className="card">
            <h2 className="font-sans text-lg font-semibold mb-4">Önkoşullar</h2>
            
            {prerequisites.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-300 text-sm">Bu ders için önkoşul bulunmuyor.</p>
            ) : (
              <ul className="space-y-3">
                {prerequisites.map((prereq) => {
                  // Check if prerequisite completion status is available
                  const isCompleted = prereq.completed === true;
                  const isIncomplete = prereq.completed === false;
                  const statusUnknown = prereq.completed === undefined;
                  
                  return (
                    <li key={prereq.id}>
                      <Link
                        to={`/courses/${prereq.id}`}
                        className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                          isCompleted
                            ? 'bg-green-500/10 border border-green-500/20 hover:bg-green-500/20'
                            : isIncomplete
                            ? 'bg-red-500/10 border border-red-500/20 hover:bg-red-500/20'
                            : 'bg-gray-100 dark:bg-gray-800/50 hover:bg-primary-50/50'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                          isCompleted
                            ? 'bg-green-500/20'
                            : isIncomplete
                            ? 'bg-red-500/20'
                            : 'bg-amber-500/20'
                        }`}>
                          {isCompleted ? (
                            <FiCheckCircle className="w-5 h-5 text-green-400" />
                          ) : isIncomplete ? (
                            <FiXCircle className="w-5 h-5 text-red-400" />
                          ) : (
                            <FiBook className="w-5 h-5 text-amber-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm flex items-center gap-2 flex-wrap">
                            {prereq.code}
                            {isCompleted && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                                Tamamlandı
                              </span>
                            )}
                            {isIncomplete && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">
                                Eksik
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-300 truncate">{prereq.name}</div>
                          <div className={`text-xs mt-1 ${
                            isCompleted ? 'text-green-400' : isIncomplete ? 'text-red-400' : 'text-amber-400'
                          }`}>
                            Min Not: {prereq.min_grade || 'DD'}
                          </div>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Available Sections */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="font-sans text-lg font-semibold mb-4">Mevcut Sectionlar</h2>
            
            {sections.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-300 text-sm">Bu ders için aktif section bulunmuyor.</p>
            ) : (
              <div className="space-y-4">
                {sections.map((section) => {
                  const elig = eligibility[section.id];
                  const canEnroll = elig?.eligible && section.availableSeats > 0;
                  
                  return (
                    <div
                      key={section.id}
                      className="p-4 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 shadow-md"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-gray-800 dark:text-gray-100">Section {section.sectionNumber}</span>
                            <span className="px-2 py-0.5 rounded bg-blue-100 border border-blue-300 text-blue-700 text-xs font-medium">
                              {section.semester === 'fall' ? 'Güz' : section.semester === 'spring' ? 'Bahar' : 'Yaz'} {section.year}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700 dark:text-gray-200">
                            {section.instructor && (
                              <div className="flex items-center gap-2">
                                <FiUser className="w-4 h-4" />
                                {section.instructor}
                              </div>
                            )}
                            {section.classroom && (
                              <div className="flex items-center gap-2">
                                <FiMapPin className="w-4 h-4" />
                                {section.classroom}
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <FiCalendar className="w-4 h-4" />
                              {formatSchedule(section.schedule)}
                            </div>
                            <div className="flex items-center gap-2">
                              <FiUsers className="w-4 h-4" />
                              {section.enrolledCount}/{section.capacity} Kayıtlı
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          <div className={`text-sm font-semibold px-3 py-1 rounded-lg border-2 ${
                            section.availableSeats > 5 
                              ? 'text-green-700 bg-green-50 border-green-300' 
                              : section.availableSeats > 0 
                              ? 'text-amber-700 bg-amber-50 border-amber-300' 
                              : 'text-red-700 bg-red-50 border-red-300'
                          }`}>
                            {section.availableSeats > 0 ? `${section.availableSeats} Boş Yer` : 'Dolu'}
                          </div>
                          
                          {isStudent && (
                            <>
                              {elig && (
                                <div className="w-full mb-2">
                                  {!elig.eligible && elig.issues && elig.issues.length > 0 && (
                                    <div className="text-xs text-red-700 bg-red-50 border-2 border-red-300 rounded-lg p-3 mb-2 shadow-sm">
                                      <div className="flex items-start gap-2">
                                        <FiAlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
                                        <div className="flex-1">
                                          <div className="font-semibold mb-1 text-red-800">Kayıt Yapılamaz:</div>
                                          <ul className="list-disc list-inside space-y-0.5 text-red-700">
                                            {elig.issues.map((issue, idx) => (
                                              <li key={idx}>{issue}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  {elig.eligible && (
                                    <div className="text-xs text-green-700 bg-green-50 border-2 border-green-300 rounded-lg p-3 mb-2 flex items-center gap-2 shadow-sm">
                                      <FiCheckCircle className="w-4 h-4 text-green-600" />
                                      <span className="font-medium">Kayıt için uygunsunuz</span>
                                    </div>
                                  )}
                                  {elig.details && (
                                    <details className="text-xs text-gray-700 dark:text-gray-200 mt-2">
                                      <summary className="cursor-pointer hover:text-gray-900 dark:hover:text-gray-100 dark:text-gray-100 font-medium flex items-center gap-1">
                                        <FiInfo className="w-3 h-3" />
                                        Detaylı Bilgi
                                      </summary>
                                      <div className="mt-2 space-y-1 pl-4">
                                        {elig.details.prerequisites && (
                                          <div>
                                            <span className="font-medium text-gray-800 dark:text-gray-100">Önkoşullar: </span>
                                            {elig.details.prerequisites.satisfied ? (
                                              <span className="text-green-700 font-medium">✓ Tamamlandı</span>
                                            ) : (
                                              <span className="text-red-700 font-medium">
                                                ✗ Eksik: {elig.details.prerequisites.missing?.map(m => m.courseCode).join(', ')}
                                              </span>
                                            )}
                                          </div>
                                        )}
                                        {elig.details.scheduleConflict && (
                                          <div>
                                            <span className="font-medium text-gray-800 dark:text-gray-100">Çakışma: </span>
                                            {elig.details.scheduleConflict.hasConflict ? (
                                              <span className="text-red-700 font-medium">✗ Var</span>
                                            ) : (
                                              <span className="text-green-700 font-medium">✓ Yok</span>
                                            )}
                                          </div>
                                        )}
                                        {elig.details.hasCapacity !== undefined && (
                                          <div>
                                            <span className="font-medium text-gray-800 dark:text-gray-100">Kapasite: </span>
                                            {elig.details.hasCapacity ? (
                                              <span className="text-green-700 font-medium">✓ Yer var</span>
                                            ) : (
                                              <span className="text-red-700 font-medium">✗ Dolu</span>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </details>
                                  )}
                                </div>
                              )}
                              <button
                                onClick={() => handleEnroll(section.id)}
                                disabled={!canEnroll || enrolling === section.id}
                                className={`btn w-full ${
                                  canEnroll
                                    ? 'btn-primary'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 cursor-not-allowed border-2 border-gray-300 dark:border-gray-600 shadow-sm font-medium'
                                }`}
                              >
                                {enrolling === section.id ? (
                                  <>
                                    <LoadingSpinner size="sm" />
                                    <span className="ml-2">Kayıt yapılıyor...</span>
                                  </>
                                ) : canEnroll ? (
                                  <>
                                    <FiCheckCircle className="w-4 h-4 mr-2" />{t('common.register')}</>
                                ) : (
                                  <>
                                    <FiXCircle className="w-4 h-4 mr-2" />
                                    Kayıt Yapılamaz
                                  </>
                                )}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;






