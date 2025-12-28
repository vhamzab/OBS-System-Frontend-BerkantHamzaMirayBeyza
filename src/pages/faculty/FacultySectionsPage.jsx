import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiBook, FiUsers, FiMapPin, FiCalendar, FiClipboard, 
  FiBarChart2, FiPlay, FiClock
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import courseService from '../../services/courseService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

import { useTranslation } from 'react-i18next';
const FacultySectionsPage = () => {
  const { t } = useTranslation();
  const [sections, setSections] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState('');

  const dayNames = {
    monday: 'Pzt',
    tuesday: 'Sal',
    wednesday: 'Çar',
    thursday: 'Per',
    friday: 'Cum',
    saturday: 'Cmt',
    sunday: 'Paz',
  };

  const semesterNames = {
    fall: 'Güz',
    spring: 'Bahar',
    summer: 'Yaz',
  };

  useEffect(() => {
    fetchSections();
    fetchCourses();
  }, [selectedSemester]);

  const fetchSections = async () => {
    try {
      setLoading(true);
      
      const params = {};
      // If no semester selected or 'all' selected, fetch all
      // If 'current' selected, filter by current semester
      if (selectedSemester === 'current') {
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();
        let semester;
        if (currentMonth >= 1 && currentMonth <= 5) {
          semester = 'spring';
        } else if (currentMonth >= 6 && currentMonth <= 8) {
          semester = 'summer';
        } else {
          semester = 'fall';
        }
        params.semester = semester;
        params.year = currentYear;
      }
      // If empty string or 'all', don't add filters - fetch all

      const response = await courseService.getInstructorSections(params);
      
      if (response.success) {
        setSections(response.data);
      }
    } catch (error) {
      toast.error('Dersler yüklenirken hata oluştu');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await courseService.getInstructorCourses();
      
      if (response.success) {
        setCourses(response.data || []);
      }
    } catch (error) {
      console.error('Courses yüklenirken hata oluştu:', error);
    }
  };

  const formatSchedule = (schedule) => {
    if (!schedule || !Array.isArray(schedule)) return [];
    return schedule.map((slot) => ({
      day: dayNames[slot.day] || slot.day,
      time: `${slot.start_time}-${slot.end_time}`,
    }));
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 relative">
        <div className="absolute -top-4 -left-4 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl"></div>
        <div className="relative">
          <h1 className="font-display text-4xl font-bold mb-3 bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">{t('courses.myCourses')}</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Verdiğiniz dersleri yönetin</p>
        </div>
        
        <select
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
          className="px-4 py-3 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-w-[280px] cursor-pointer shadow-md hover:shadow-lg transition-all duration-300 relative z-10"
        >
          <option value="" disabled style={{ color: '#94a3b8' }}>{t('courses.selectSemester')}</option>
          <option value="current">{t('profile.currentSemester')}</option>
          <option value="all">Tüm Dönemler</option>
        </select>
      </div>

      {/* Atanan Dersler (Courses) */}
      {courses.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Size Atanan Dersler</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <div key={course.id} className="card-hover group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary-500/10 to-accent-500/10 rounded-full blur-2xl -mr-12 -mt-12"></div>
                <div className="relative z-10">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <FiBook className="w-7 h-7 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-primary-600 dark:text-primary-400 mb-1">
                        {course.code}
                      </div>
                      <h3 className="font-bold text-lg">{course.name}</h3>
                      {course.department && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {course.department.name}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 text-sm">
                    <span className="px-3 py-1.5 rounded-lg bg-primary-100/50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium border border-primary-200/50 dark:border-primary-800/50">
                      {course.credits} Kredi
                    </span>
                    <span className="px-3 py-1.5 rounded-lg bg-accent-100/50 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 font-medium border border-accent-200/50 dark:border-accent-800/50">
                      {course.ects} ECTS
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ders Bölümleri (Sections) */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-4">Ders Bölümleri</h2>
      </div>

      {sections.length === 0 ? (
        <div className="card text-center py-16">
          <FiBook className="w-16 h-16 mx-auto text-gray-700 dark:text-gray-200 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Ders Bulunamadı</h2>
          <p className="text-gray-600 dark:text-gray-300">Bu dönemde size atanmış ders bulunmuyor.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sections.map((section) => {
            const scheduleItems = formatSchedule(section.schedule);
            
            return (
              <div key={section.id} className="card-hover group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/10 to-accent-500/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
                <div className="relative z-10">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <FiBook className="w-7 h-7 text-primary-600 dark:text-primary-400" />
                    </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded bg-primary-50 text-xs font-medium">
                        {section.course?.code}
                      </span>
                      <span className="text-xs text-gray-700 dark:text-gray-200">
                        Section {section.sectionNumber}
                      </span>
                    </div>
                    <h3 className="font-sans text-lg font-semibold">{section.course?.name}</h3>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {semesterNames[section.semester]} {section.year}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/30 dark:to-primary-800/20 border border-primary-300/50 dark:border-primary-700/50 shadow-lg hover:scale-105 transition-all duration-300 text-center group">
                    <div className="text-2xl font-bold text-primary-700 dark:text-primary-300">{section.enrolledCount}</div>
                    <div className="text-xs text-primary-600 dark:text-primary-400 font-semibold mt-1">{t('roles.student')}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-800/20 border border-emerald-300/50 dark:border-emerald-700/50 shadow-lg hover:scale-105 transition-all duration-300 text-center group">
                    <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{section.course?.credits}</div>
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">{t('courses.credits')}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 border border-blue-300/50 dark:border-blue-700/50 shadow-lg hover:scale-105 transition-all duration-300 text-center group">
                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{section.capacity}</div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-1">{t('courses.capacity')}</div>
                  </div>
                </div>

                {/* Schedule */}
                {scheduleItems.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {scheduleItems.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-1 px-2 py-1 rounded bg-gray-100 dark:bg-gray-800/50 text-xs">
                        <FiClock className="w-3 h-3 text-primary-400" />
                        <span className="font-medium">{item.day}</span>
                        <span className="text-gray-600 dark:text-gray-300">{item.time}</span>
                      </div>
                    ))}
                  </div>
                )}

                {section.classroom && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mb-4">
                    <FiMapPin className="w-4 h-4" />
                    {section.classroom}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                  <Link
                    to={`/gradebook/${section.id}`}
                    className="btn-secondary flex-1 min-w-[140px] flex items-center justify-center gap-2"
                  >
                    <FiClipboard className="w-4 h-4" />{t('grades.gradebook')}</Link>
                  <Link
                    to={`/attendance/report/${section.id}`}
                    className="btn-secondary flex-1 min-w-[140px] flex items-center justify-center gap-2"
                  >
                    <FiBarChart2 className="w-4 h-4" />{t('attendance.attendanceReport')}</Link>
                  <Link
                    to={`/attendance/start?section=${section.id}`}
                    className="btn-primary flex-1 min-w-[140px] flex items-center justify-center gap-2"
                  >
                    <FiPlay className="w-4 h-4" />{t('nav.startAttendance')}</Link>
                </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FacultySectionsPage;


