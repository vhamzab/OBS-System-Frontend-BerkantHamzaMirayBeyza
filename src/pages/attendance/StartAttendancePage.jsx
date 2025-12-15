import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiMapPin, FiClock, FiUsers, FiPlay, FiStopCircle,
  FiRefreshCw, FiBook, FiCheckCircle
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import courseService from '../../services/courseService';
import attendanceService from '../../services/attendanceService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const StartAttendancePage = () => {
  const navigate = useNavigate();
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [duration, setDuration] = useState(30);
  const [radius, setRadius] = useState(15);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [qrCode, setQrCode] = useState('');
  const [qrCountdown, setQrCountdown] = useState(5);
  const [qrRefreshing, setQrRefreshing] = useState(false);

  useEffect(() => {
    fetchSections();
    fetchActiveSession(); // Check for existing active sessions on load
  }, []);

  // Fetch active sessions from backend (persists across page reloads)
  const fetchActiveSession = async () => {
    try {
      const response = await attendanceService.getInstructorSessions({ status: 'active' });
      if (response.success && response.data.length > 0) {
        // Get the first active session
        const activeSessionData = response.data[0];
        // Fetch full session details
        const sessionResponse = await attendanceService.getSession(activeSessionData.id);
        if (sessionResponse.success) {
          setActiveSession(sessionResponse.data.session);
          setAttendanceCount(sessionResponse.data.statistics.present + sessionResponse.data.statistics.late);
          setQrCode(sessionResponse.data.session.qrCode || '');
        }
      }
    } catch (error) {
      console.error('Error fetching active session:', error);
    }
  };

  // QR Code auto-refresh every 15 seconds
  useEffect(() => {
    let qrInterval;
    let countdownInterval;

    if (activeSession) {
      // Set initial QR code
      setQrCode(activeSession.qrCode || '');
      setQrCountdown(15);

      // Countdown timer
      countdownInterval = setInterval(() => {
        setQrCountdown(prev => {
          if (prev <= 1) {
            return 15; // Reset countdown
          }
          return prev - 1;
        });
      }, 1000);

      // QR code refresh every 15 seconds
      qrInterval = setInterval(async () => {
        try {
          setQrRefreshing(true);
          const response = await attendanceService.regenerateQRCode(activeSession.id);
          if (response.success) {
            setQrCode(response.data.qr_code);
            setQrCountdown(15);
          }
        } catch (error) {
          console.error('QR regeneration error:', error);
        } finally {
          setQrRefreshing(false);
        }
      }, 15000);
    }

    return () => {
      clearInterval(qrInterval);
      clearInterval(countdownInterval);
    };
  }, [activeSession]);

  useEffect(() => {
    let interval;
    if (activeSession) {
      interval = setInterval(fetchSessionStatus, 10000); // Reduced to every 10 seconds for attendance count
    }
    return () => clearInterval(interval);
  }, [activeSession]);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const response = await courseService.getInstructorSections();

      if (response.success) {
        setSections(response.data);
        if (response.data.length > 0) {
          setSelectedSection(response.data[0].id);
        }
      }
    } catch (error) {
      toast.error('Dersler yüklenirken hata oluştu');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessionStatus = async () => {
    if (!activeSession) return;

    try {
      const response = await attendanceService.getSession(activeSession.id);
      if (response.success) {
        setAttendanceCount(response.data.statistics.present + response.data.statistics.late);

        if (response.data.session.status === 'closed') {
          setActiveSession(null);
          toast.info('Yoklama oturumu sona erdi');
        }
      }
    } catch (error) {
      console.error('Session status error:', error);
    }
  };

  const handleStartSession = async () => {
    if (!selectedSection) {
      toast.error('Lütfen bir ders seçin');
      return;
    }

    try {
      setStarting(true);
      const response = await attendanceService.createSession(selectedSection, {
        durationMinutes: duration,
        geofenceRadius: radius,
      });

      if (response.success) {
        setActiveSession(response.data.session);
        setAttendanceCount(0);
        toast.success('Yoklama başlatıldı!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Yoklama başlatılırken hata oluştu');
    } finally {
      setStarting(false);
    }
  };

  const handleCloseSession = async () => {
    if (!activeSession) return;

    try {
      const response = await attendanceService.closeSession(activeSession.id);

      if (response.success) {
        toast.success('Yoklama kapatıldı');
        setActiveSession(null);
      }
    } catch (error) {
      toast.error('Yoklama kapatılırken hata oluştu');
    }
  };

  const selectedSectionData = sections.find((s) => s.id === selectedSection);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-2">Yoklama Başlat</h1>
        <p className="text-slate-400">GPS tabanlı yoklama oturumu oluşturun</p>
      </div>

      {activeSession ? (
        /* Active Session View */
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
              <span className="font-semibold text-green-400">Aktif Oturum</span>
            </div>
            <button onClick={handleCloseSession} className="btn bg-red-500 hover:bg-red-600 text-white">
              <FiStopCircle className="w-4 h-4 mr-2" />
              Yoklamayı Kapat
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">
                {activeSession.course?.code} - {activeSession.course?.name}
              </h3>
              <div className="space-y-3 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <FiBook className="w-4 h-4" />
                  Section {activeSession.sectionNumber}
                </div>
                <div className="flex items-center gap-2">
                  <FiClock className="w-4 h-4" />
                  {activeSession.startTime} - {activeSession.endTime}
                </div>
                <div className="flex items-center gap-2">
                  <FiMapPin className="w-4 h-4" />
                  {activeSession.location?.classroom || 'Konum belirtilmemiş'}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-gradient-to-br from-primary-500/10 to-accent-500/10">
              <div className="text-5xl font-bold text-primary-400 mb-2">
                {attendanceCount}
              </div>
              <div className="text-slate-400">Yoklama Veren</div>
              <button
                onClick={fetchSessionStatus}
                className="mt-4 text-sm text-primary-400 flex items-center gap-1 hover:text-primary-300"
              >
                <FiRefreshCw className="w-4 h-4" />
                Yenile
              </button>
            </div>
          </div>

          {/* QR Code */}
          <div className="p-6 rounded-xl bg-slate-800/50 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <h4 className="font-semibold">Yoklama QR Kodu</h4>
              <span className="px-2 py-1 text-xs rounded-full bg-primary-500/20 text-primary-400">
                Otomatik Yenileme
              </span>
            </div>
            <div className={`inline-block px-6 py-3 rounded-lg bg-white text-slate-900 font-mono text-2xl font-bold transition-opacity ${qrRefreshing ? 'opacity-50' : 'opacity-100'}`}>
              {qrCode || activeSession.qrCode}
            </div>
            <div className="mt-4 flex items-center justify-center gap-3">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <FiRefreshCw className={`w-4 h-4 ${qrRefreshing ? 'animate-spin' : ''}`} />
                <span>Yeni kod: {qrCountdown}s</span>
              </div>
              <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 transition-all duration-1000"
                  style={{ width: `${(qrCountdown / 5) * 100}%` }}
                />
              </div>
            </div>
            <p className="text-sm text-slate-400 mt-3">
              QR kod her 5 saniyede bir otomatik yenilenir. Öğrenciler güncel kodu taramalıdır.
            </p>
          </div>
        </div>
      ) : (
        /* Create Session Form */
        <div className="card">
          <h2 className="font-display text-xl font-semibold mb-6">Yeni Yoklama Oturumu</h2>

          <div className="space-y-6">
            {/* Section Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Ders Seçin
              </label>
              {sections.length === 0 ? (
                <div className="text-slate-400 text-sm">
                  Size atanmış ders bulunmuyor.
                </div>
              ) : (
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="input w-full"
                >
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.course?.code} - {section.course?.name} (Section {section.sectionNumber})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Section Info */}
            {selectedSectionData && (
              <div className="p-4 rounded-xl bg-slate-800/50 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <FiUsers className="w-4 h-4 text-primary-400" />
                  <span className="text-slate-400">Kayıtlı Öğrenci:</span>
                  <span className="font-medium">{selectedSectionData.enrolledCount}</span>
                </div>
                {selectedSectionData.classroom && (
                  <div className="flex items-center gap-2 text-sm">
                    <FiMapPin className="w-4 h-4 text-primary-400" />
                    <span className="text-slate-400">Derslik:</span>
                    <span className="font-medium">{selectedSectionData.classroom}</span>
                  </div>
                )}
              </div>
            )}

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Oturum Süresi (dakika)
              </label>
              <div className="flex gap-2">
                {[15, 30, 45, 60].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDuration(d)}
                    className={`px-4 py-2 rounded-lg transition-colors ${duration === d
                      ? 'bg-primary-500 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                  >
                    {d} dk
                  </button>
                ))}
              </div>
            </div>

            {/* Geofence Radius */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                GPS Tolerans Yarıçapı (metre)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="10"
                  max="50"
                  step="5"
                  value={radius}
                  onChange={(e) => setRadius(parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="w-16 text-center font-mono bg-slate-800 px-3 py-1 rounded">
                  {radius}m
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Öğrencilerin dersliğe bu mesafe içinde olması gerekir
              </p>
            </div>

            {/* Start Button */}
            <button
              onClick={handleStartSession}
              disabled={starting || sections.length === 0}
              className="btn btn-primary w-full py-4"
            >
              {starting ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <FiPlay className="w-5 h-5 mr-2" />
                  Yoklamayı Başlat
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Recent Sessions */}
      <div className="mt-8">
        <h2 className="font-display text-xl font-semibold mb-4">Son Yoklamalar</h2>
        <button
          onClick={() => navigate('/attendance/sessions')}
          className="btn btn-secondary"
        >
          Tüm Yoklamaları Görüntüle
        </button>
      </div>
    </div>
  );
};

export default StartAttendancePage;


