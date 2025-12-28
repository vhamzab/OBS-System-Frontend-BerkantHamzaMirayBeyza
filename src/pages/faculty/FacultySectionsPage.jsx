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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold mb-2">{t('courses.myCourses')}</h1>
          <p className="text-gray-600 dark:text-gray-300">Verdiğiniz dersleri yönetin</p>
        </div>
        
        <select
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[280px] cursor-pointer"
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
              <div key={course.id} className="card">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center shrink-0">
                    <FiBook className="w-6 h-6 text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm text-primary-600 dark:text-primary-400 mb-1">
                      {course.code}
                    </div>
                    <h3 className="font-semibold">{course.name}</h3>
                    {course.department && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {course.department.name}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 text-sm">
                  <span className="px-2 py-1 rounded bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                    {course.credits} Kredi
                  </span>
                  <span className="px-2 py-1 rounded bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300">
                    {course.ects} ECTS
                  </span>
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
              <div key={section.id} className="card">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center shrink-0">
                    <FiBook className="w-7 h-7 text-primary-400" />
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
                  <div className="p-3 rounded-xl bg-primary-100 border-2 border-primary-300 shadow-md hover:scale-105 transition-all duration-300 text-center">
                    <div className="text-lg font-bold text-primary-700 dark:text-primary-300">{section.enrolledCount}</div>
                    <div className="text-xs text-primary-600 font-medium">{t('roles.student')}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-100 border-2 border-emerald-300 shadow-md hover:scale-105 transition-all duration-300 text-center">
                    <div className="text-lg font-bold text-emerald-700">{section.course?.credits}</div>
                    <div className="text-xs text-emerald-600 font-medium">{t('courses.credits')}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-100 border-2 border-blue-300 shadow-md hover:scale-105 transition-all duration-300 text-center">
                    <div className="text-lg font-bold text-blue-700">{section.capacity}</div>
                    <div className="text-xs text-blue-600 font-medium">{t('courses.capacity')}</div>
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
                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200 dark:border-gray-700/50">
                  <Link
                    to={`/gradebook/${section.id}`}
                    className="btn btn-secondary flex-1 min-w-[140px]"
                  >
                    <FiClipboard className="w-4 h-4 mr-2" />{t('grades.gradebook')}</Link>
                  <Link
                    to={`/attendance/report/${section.id}`}
                    className="btn btn-secondary flex-1 min-w-[140px]"
                  >
                    <FiBarChart2 className="w-4 h-4 mr-2" />{t('attendance.attendanceReport')}</Link>
                  <Link
                    to={`/attendance/start?section=${section.id}`}
                    className="btn btn-primary flex-1 min-w-[140px]"
                  >
                    <FiPlay className="w-4 h-4 mr-2" />{t('nav.startAttendance')}</Link>
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


