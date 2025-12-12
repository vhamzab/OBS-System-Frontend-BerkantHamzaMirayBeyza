import { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiMapPin, FiBook, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';
import enrollmentService from '../../services/enrollmentService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const SchedulePage = () => {
  const [schedule, setSchedule] = useState([]);
  const [semester, setSemester] = useState(null);
  const [year, setYear] = useState(null);
  const [loading, setLoading] = useState(true);

  const dayNames = {
    monday: 'Pazartesi',
    tuesday: 'Salı',
    wednesday: 'Çarşamba',
    thursday: 'Perşembe',
    friday: 'Cuma',
    saturday: 'Cumartesi',
    sunday: 'Pazar',
  };

  const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      console.log('📅 SchedulePage: Fetching schedule...');
      const response = await enrollmentService.getMySchedule();
      
      if (response.success) {
        console.log('✅ SchedulePage: Schedule fetched successfully:', response.data);
        setSchedule(response.data.schedule || []);
        setSemester(response.data.semester);
        setYear(response.data.year);
      } else {
        console.warn('⚠️ SchedulePage: Failed to fetch schedule:', response.message);
        toast.error(response.message || 'Ders programı yüklenirken hata oluştu');
      }
    } catch (error) {
      console.error('❌ SchedulePage: Error fetching schedule:', error);
      toast.error(error.response?.data?.message || 'Ders programı yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Group schedule by day
  const scheduleByDay = {};
  schedule.forEach((item) => {
    if (!scheduleByDay[item.day]) {
      scheduleByDay[item.day] = [];
    }
    scheduleByDay[item.day].push(item);
  });

  // Sort times within each day
  Object.keys(scheduleByDay).forEach((day) => {
    scheduleByDay[day].sort((a, b) => {
      const timeA = a.start_time.split(':').map(Number);
      const timeB = b.start_time.split(':').map(Number);
      return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
    });
  });

  const getSemesterName = (sem) => {
    const names = {
      fall: 'Güz',
      spring: 'Bahar',
      summer: 'Yaz',
    };
    return names[sem] || sem;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-2">Ders Programı</h1>
        <p className="text-slate-400">
          {semester && year && `${year} - ${getSemesterName(semester)} Dönemi`}
        </p>
      </div>

      {schedule.length === 0 ? (
        <div className="card text-center py-16">
          <FiCalendar className="w-16 h-16 mx-auto text-slate-600 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Ders Programı Boş</h2>
          <p className="text-slate-400 mb-4">Henüz kayıtlı olduğunuz ders bulunmuyor.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
          {dayOrder.map((day) => {
            const daySchedule = scheduleByDay[day] || [];
            
            return (
              <div key={day} className="card">
                <div className="mb-4 pb-3 border-b border-slate-700/50">
                  <h3 className="font-semibold text-lg">{dayNames[day]}</h3>
                </div>
                
                {daySchedule.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-sm">
                    Ders yok
                  </div>
                ) : (
                  <div className="space-y-3">
                    {daySchedule.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/30 hover:border-primary-500/50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <FiBook className="w-4 h-4 text-primary-400" />
                              <span className="font-semibold text-sm">{item.course.code}</span>
                            </div>
                            <p className="text-xs text-slate-400 mb-2">{item.course.name}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-2 text-slate-400">
                            <FiClock className="w-3 h-3" />
                            <span>{item.start_time} - {item.end_time}</span>
                          </div>
                          
                          {item.classroom && (
                            <div className="flex items-center gap-2 text-slate-400">
                              <FiMapPin className="w-3 h-3" />
                              <span>{item.classroom}</span>
                            </div>
                          )}
                          
                          {item.instructor && (
                            <div className="flex items-center gap-2 text-slate-400">
                              <FiUser className="w-3 h-3" />
                              <span>{item.instructor}</span>
                            </div>
                          )}
                          
                          {item.sectionNumber && (
                            <div className="text-slate-500">
                              Section {item.sectionNumber}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SchedulePage;

