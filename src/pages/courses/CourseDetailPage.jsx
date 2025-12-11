import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  FiBook, FiClock, FiUsers, FiArrowLeft, FiCalendar, 
  FiMapPin, FiUser, FiCheckCircle, FiAlertCircle, FiLink
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import courseService from '../../services/courseService';
import enrollmentService from '../../services/enrollmentService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

const CourseDetailPage = () => {
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
    if (!isStudent) return;

    try {
      setEnrolling(sectionId);
      const response = await enrollmentService.enrollInCourse(sectionId);
      
      if (response.success) {
        toast.success(response.message || 'Derse başarıyla kayıt oldunuz!');
        navigate('/my-courses');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Kayıt olurken hata oluştu');
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
          <p className="text-slate-400 mb-4">Aradığınız ders mevcut değil veya silinmiş olabilir.</p>
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
      <Link to="/courses" className="inline-flex items-center text-slate-400 hover:text-white mb-6 transition-colors">
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
                <h1 className="font-display text-2xl md:text-3xl font-bold mt-2">{course.name}</h1>
              </div>
              <div className="flex gap-4 text-center">
                <div className="px-4 py-2 rounded-xl bg-slate-800/50">
                  <div className="text-2xl font-bold text-primary-400">{course.credits}</div>
                  <div className="text-xs text-slate-400">Kredi</div>
                </div>
                <div className="px-4 py-2 rounded-xl bg-slate-800/50">
                  <div className="text-2xl font-bold text-accent-400">{course.ects}</div>
                  <div className="text-xs text-slate-400">AKTS</div>
                </div>
              </div>
            </div>
            
            <p className="text-slate-300 mb-4">{course.description || 'Açıklama bulunmuyor.'}</p>
            
            {course.department && (
              <div className="text-sm text-slate-400">
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
            <h2 className="font-display text-lg font-semibold mb-4">Önkoşullar</h2>
            
            {prerequisites.length === 0 ? (
              <p className="text-slate-400 text-sm">Bu ders için önkoşul bulunmuyor.</p>
            ) : (
              <ul className="space-y-3">
                {prerequisites.map((prereq) => (
                  <li key={prereq.id}>
                    <Link
                      to={`/courses/${prereq.id}`}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                        <FiBook className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{prereq.code}</div>
                        <div className="text-xs text-slate-400">{prereq.name}</div>
                        <div className="text-xs text-amber-400">Min: {prereq.min_grade}</div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Available Sections */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="font-display text-lg font-semibold mb-4">Mevcut Sectionlar</h2>
            
            {sections.length === 0 ? (
              <p className="text-slate-400 text-sm">Bu ders için aktif section bulunmuyor.</p>
            ) : (
              <div className="space-y-4">
                {sections.map((section) => {
                  const elig = eligibility[section.id];
                  const canEnroll = elig?.eligible && section.availableSeats > 0;
                  
                  return (
                    <div
                      key={section.id}
                      className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold">Section {section.sectionNumber}</span>
                            <span className="px-2 py-0.5 rounded bg-slate-700 text-xs">
                              {section.semester === 'fall' ? 'Güz' : section.semester === 'spring' ? 'Bahar' : 'Yaz'} {section.year}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-400">
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
                          <div className={`text-sm font-medium ${
                            section.availableSeats > 5 ? 'text-green-400' : 
                            section.availableSeats > 0 ? 'text-amber-400' : 'text-red-400'
                          }`}>
                            {section.availableSeats > 0 ? `${section.availableSeats} Boş Yer` : 'Dolu'}
                          </div>
                          
                          {isStudent && (
                            <>
                              {elig && !elig.eligible && (
                                <div className="text-xs text-red-400 flex items-center gap-1">
                                  <FiAlertCircle className="w-3 h-3" />
                                  {elig.issues?.[0] || 'Kayıt yapılamaz'}
                                </div>
                              )}
                              <button
                                onClick={() => handleEnroll(section.id)}
                                disabled={!canEnroll || enrolling === section.id}
                                className={`btn ${canEnroll ? 'btn-primary' : 'btn-secondary opacity-50 cursor-not-allowed'}`}
                              >
                                {enrolling === section.id ? (
                                  <LoadingSpinner size="sm" />
                                ) : canEnroll ? (
                                  <>
                                    <FiCheckCircle className="w-4 h-4 mr-2" />
                                    Kayıt Ol
                                  </>
                                ) : (
                                  'Kayıt Yapılamaz'
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

