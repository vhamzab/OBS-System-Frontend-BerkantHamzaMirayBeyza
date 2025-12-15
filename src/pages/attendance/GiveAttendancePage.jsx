import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiMapPin, FiCheckCircle, FiAlertCircle, FiNavigation, 
  FiClock, FiLoader, FiBook, FiCamera
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import attendanceService from '../../services/attendanceService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const GiveAttendancePage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [useQR, setUseQR] = useState(false);
  const [success, setSuccess] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchSession();
  }, [sessionId]);

  const fetchSession = async () => {
    try {
      setLoading(true);
      const response = await attendanceService.getSession(sessionId);
      
      if (response.success) {
        setSession(response.data.session);
        
        // Check if already checked in
        const alreadyCheckedIn = response.data.records?.some(
          (r) => r.student?.id === response.data.session?.currentStudentId
        );
        
        if (alreadyCheckedIn) {
          toast.info('Bu yoklamaya zaten katıldınız');
        }
      }
    } catch (error) {
      toast.error('Yoklama bilgileri yüklenirken hata oluştu');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Tarayıcınız konum servislerini desteklemiyor');
      return;
    }

    setGettingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setGettingLocation(false);
      },
      (error) => {
        setGettingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Konum izni reddedildi. Lütfen tarayıcı ayarlarından izin verin.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Konum bilgisi alınamıyor. Lütfen GPS\'i açık olduğundan emin olun.');
            break;
          case error.TIMEOUT:
            setLocationError('Konum alınırken zaman aşımı. Lütfen tekrar deneyin.');
            break;
          default:
            setLocationError('Konum alınırken hata oluştu.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000; // Earth's radius in meters
    const toRad = (deg) => (deg * Math.PI) / 180;
    
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) ** 2;
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return Math.round(R * c);
  };

  const handleSubmit = async () => {
    if (!useQR && !location) {
      toast.error('Lütfen önce konumunuzu alın');
      return;
    }

    try {
      setSubmitting(true);
      
      const response = await attendanceService.checkIn(
        sessionId,
        useQR ? {} : location,
        useQR ? qrCode : null
      );
      
      if (response.success) {
        setSuccess(true);
        setResult(response.data);
        toast.success('Yoklama başarıyla verildi!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Yoklama verilirken hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="p-6 lg:p-8 max-w-2xl mx-auto">
        <div className="card text-center py-16">
          <FiAlertCircle className="w-16 h-16 mx-auto text-red-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Oturum Bulunamadı</h2>
          <p className="text-slate-400 mb-4">Bu yoklama oturumu mevcut değil veya sona ermiş olabilir.</p>
          <button onClick={() => navigate('/my-attendance')} className="btn btn-primary">
            Devam Durumuma Git
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="p-6 lg:p-8 max-w-2xl mx-auto">
        <div className="card text-center py-16">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <FiCheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">Yoklama Verildi!</h2>
          <p className="text-slate-400 mb-6">
            {session.course?.code} - {session.course?.name} dersine katılımınız kaydedildi.
          </p>
          
          <div className="inline-flex flex-col items-center gap-2 px-6 py-4 rounded-xl bg-slate-800/50 mb-6">
            <span className="text-sm text-slate-400">Durum</span>
            <span className={`text-lg font-bold ${
              result?.status === 'present' ? 'text-green-400' : 'text-amber-400'
            }`}>
              {result?.status === 'present' ? 'Katıldı' : 'Geç Kaldı'}
            </span>
            {result?.distance && (
              <span className="text-sm text-slate-500">
                Mesafe: {result.distance}m
              </span>
            )}
          </div>

          {result?.isFlagged && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
              <FiAlertCircle className="w-5 h-5 text-amber-400 mx-auto mb-2" />
              <p className="text-sm text-amber-200">
                Yoklamanız şüpheli olarak işaretlendi. Öğretim üyesi tarafından incelenecektir.
              </p>
            </div>
          )}

          <button onClick={() => navigate('/my-attendance')} className="btn btn-primary">
            Devam Durumuma Git
          </button>
        </div>
      </div>
    );
  }

  const distanceToClass = location && session.location?.latitude
    ? calculateDistance(
        location.latitude,
        location.longitude,
        parseFloat(session.location.latitude),
        parseFloat(session.location.longitude)
      )
    : null;

  const isWithinRange = distanceToClass !== null && distanceToClass <= (session.location?.radius || 15) + 10;

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-2">Yoklama Ver</h1>
        <p className="text-slate-400">Konumunuzu paylaşarak yoklamaya katılın</p>
      </div>

      {/* Session Info */}
      <div className="card mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center">
            <FiBook className="w-7 h-7 text-primary-400" />
          </div>
          <div>
            <div className="font-semibold">{session.course?.code} - {session.course?.name}</div>
            <div className="text-sm text-slate-400">
              {session.instructor} • {session.classroom}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <span className="flex items-center gap-1">
            <FiClock className="w-4 h-4" />
            {session.startTime} - {session.endTime}
          </span>
          <span className="flex items-center gap-1">
            <FiMapPin className="w-4 h-4" />
            Yarıçap: {session.location?.radius || 15}m
          </span>
        </div>
      </div>

      {/* Method Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setUseQR(false)}
          className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
            !useQR
              ? 'bg-primary-500 text-white'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          <FiMapPin className="w-4 h-4 inline mr-2" />
          GPS ile
        </button>
        <button
          onClick={() => setUseQR(true)}
          className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
            useQR
              ? 'bg-primary-500 text-white'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          <FiCamera className="w-4 h-4 inline mr-2" />
          QR Kod ile
        </button>
      </div>

      {useQR ? (
        /* QR Code Input */
        <div className="card mb-6">
          <h3 className="font-semibold mb-4">QR Kod Girin</h3>
          <input
            type="text"
            value={qrCode}
            onChange={(e) => setQrCode(e.target.value.toUpperCase())}
            placeholder="ATT-XXXXXXXX-..."
            className="input w-full font-mono text-lg text-center"
          />
          <p className="text-xs text-slate-500 mt-2">
            QR kodunu öğretim üyesinden alabilirsiniz
          </p>
        </div>
      ) : (
        /* GPS Location */
        <div className="card mb-6">
          <h3 className="font-semibold mb-4">Konum Bilgisi</h3>
          
          {locationError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2 text-red-400">
                <FiAlertCircle className="w-5 h-5" />
                {locationError}
              </div>
            </div>
          )}

          {!location ? (
            <button
              onClick={getLocation}
              disabled={gettingLocation}
              className="btn btn-secondary w-full py-4"
            >
              {gettingLocation ? (
                <>
                  <FiLoader className="w-5 h-5 mr-2 animate-spin" />
                  Konum Alınıyor...
                </>
              ) : (
                <>
                  <FiNavigation className="w-5 h-5 mr-2" />
                  Konumumu Al
                </>
              )}
            </button>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-800/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Konumunuz</span>
                  <button
                    onClick={getLocation}
                    className="text-sm text-primary-400 hover:text-primary-300"
                  >
                    Yenile
                  </button>
                </div>
                <div className="font-mono text-sm">
                  {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Doğruluk: ±{Math.round(location.accuracy)}m
                </div>
              </div>

              {distanceToClass !== null && (
                <div className={`p-4 rounded-xl ${
                  isWithinRange ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'
                }`}>
                  <div className="flex items-center gap-2">
                    {isWithinRange ? (
                      <FiCheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <FiAlertCircle className="w-5 h-5 text-red-400" />
                    )}
                    <span className={isWithinRange ? 'text-green-400' : 'text-red-400'}>
                      Dersliğe uzaklık: {distanceToClass}m
                    </span>
                  </div>
                  {!isWithinRange && (
                    <p className="text-sm text-red-300 mt-2">
                      Dersliğe daha yakın olmanız gerekmektedir.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={submitting || (!useQR && !location) || (useQR && !qrCode)}
        className="btn btn-primary w-full py-4"
      >
        {submitting ? (
          <LoadingSpinner size="sm" />
        ) : (
          <>
            <FiCheckCircle className="w-5 h-5 mr-2" />
            Yoklama Ver
          </>
        )}
      </button>
    </div>
  );
};

export default GiveAttendancePage;



