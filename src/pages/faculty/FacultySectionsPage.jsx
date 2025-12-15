import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiBook, FiUsers, FiMapPin, FiCalendar, FiClipboard, 
  FiBarChart2, FiPlay, FiClock
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import courseService from '../../services/courseService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const FacultySectionsPage = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState('current');

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
  }, [selectedSemester]);

  const fetchSections = async () => {
    try {
      setLoading(true);
      
      const params = {};
      if (selectedSemester !== 'all') {
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
        
        if (selectedSemester === 'current') {
          params.semester = semester;
          params.year = currentYear;
        }
      }

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
          <h1 className="font-display text-3xl font-bold mb-2">Derslerim</h1>
          <p className="text-slate-400">Verdiğiniz dersleri yönetin</p>
        </div>
        
        <select
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
          className="input"
        >
          <option value="" disabled>Dönem seçiniz...</option>
          <option value="current">Mevcut Dönem</option>
          <option value="all">Tüm Dönemler</option>
        </select>
      </div>

      {sections.length === 0 ? (
        <div className="card text-center py-16">
          <FiBook className="w-16 h-16 mx-auto text-slate-600 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Ders Bulunamadı</h2>
          <p className="text-slate-400">Bu dönemde size atanmış ders bulunmuyor.</p>
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
                      <span className="px-2 py-0.5 rounded bg-slate-700 text-xs font-medium">
                        {section.course?.code}
                      </span>
                      <span className="text-xs text-slate-500">
                        Section {section.sectionNumber}
                      </span>
                    </div>
                    <h3 className="font-display text-lg font-semibold">{section.course?.name}</h3>
                    <div className="text-sm text-slate-400">
                      {semesterNames[section.semester]} {section.year}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-gray-50 text-center border border-gray-200">
                    <div className="text-lg font-bold text-primary-700">{section.enrolledCount}</div>
                    <div className="text-xs text-gray-600">Öğrenci</div>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 text-center border border-gray-200">
                    <div className="text-lg font-bold text-emerald-600">{section.course?.credits}</div>
                    <div className="text-xs text-gray-600">Kredi</div>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 text-center border border-gray-200">
                    <div className="text-lg font-bold text-amber-600">{section.capacity}</div>
                    <div className="text-xs text-gray-600">Kapasite</div>
                  </div>
                </div>

                {/* Schedule */}
                {scheduleItems.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {scheduleItems.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800/50 text-xs">
                        <FiClock className="w-3 h-3 text-primary-400" />
                        <span className="font-medium">{item.day}</span>
                        <span className="text-slate-400">{item.time}</span>
                      </div>
                    ))}
                  </div>
                )}

                {section.classroom && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <FiMapPin className="w-4 h-4" />
                    {section.classroom}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-700/50">
                  <Link
                    to={`/gradebook/${section.id}`}
                    className="btn btn-secondary flex-1 min-w-[140px]"
                  >
                    <FiClipboard className="w-4 h-4 mr-2" />
                    Not Defteri
                  </Link>
                  <Link
                    to={`/attendance/report/${section.id}`}
                    className="btn btn-secondary flex-1 min-w-[140px]"
                  >
                    <FiBarChart2 className="w-4 h-4 mr-2" />
                    Yoklama Raporu
                  </Link>
                  <Link
                    to={`/attendance/start?section=${section.id}`}
                    className="btn btn-primary flex-1 min-w-[140px]"
                  >
                    <FiPlay className="w-4 h-4 mr-2" />
                    Yoklama Aç
                  </Link>
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

