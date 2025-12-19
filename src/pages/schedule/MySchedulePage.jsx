import { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiMapPin, FiBook, FiUser, FiDownload } from 'react-icons/fi';
import toast from 'react-hot-toast';
import schedulingService from '../../services/schedulingService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';

const MySchedulePage = () => {
  const [schedule, setSchedule] = useState({});
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

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
      const response = await schedulingService.getMySchedule();
      if (response.success) {
        setSchedule(response.data.schedule || {});
      }
    } catch (error) {
      toast.error('Ders programı yüklenirken hata oluştu');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportICal = async () => {
    try {
      setExporting(true);
      const blob = await schedulingService.getICalExport();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'schedule.ics';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('iCal dosyası indirildi');
    } catch (error) {
      toast.error('iCal dosyası oluşturulurken hata oluştu');
      console.error(error);
    } finally {
      setExporting(false);
    }
  };

  const getTimeSlot = (startTime, endTime) => {
    return `${startTime} - ${endTime}`;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const hasSchedule = Object.values(schedule).some((day) => day.length > 0);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold mb-2">Ders Programım</h1>
          <p className="text-slate-400">Haftalık ders programınızı görüntüleyin</p>
        </div>
        {hasSchedule && (
          <Button onClick={handleExportICal} loading={exporting}>
            <FiDownload className="mr-2" />
            iCal Export
          </Button>
        )}
      </div>

      {!hasSchedule ? (
        <div className="card text-center py-12">
          <FiCalendar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-400">Henüz ders programınız oluşturulmamış</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
          {dayOrder.map((day) => {
            const daySchedule = schedule[day] || [];
            return (
              <div key={day} className="card">
                <h3 className="font-bold text-lg mb-4 text-center">{dayNames[day]}</h3>
                {daySchedule.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm">Boş</div>
                ) : (
                  <div className="space-y-3">
                    {daySchedule.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-slate-700/50 rounded-lg border-l-4 border-blue-500"
                      >
                        <div className="font-semibold text-sm mb-1">{item.course}</div>
                        <div className="text-xs text-slate-400 mb-2">{item.courseName}</div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                          <FiClock />
                          {getTimeSlot(item.startTime, item.endTime)}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                          <FiMapPin />
                          {item.classroom}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <FiUser />
                          {item.instructor}
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

export default MySchedulePage;

