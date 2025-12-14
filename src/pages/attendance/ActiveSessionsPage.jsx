import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiClock, FiMapPin, FiUsers, FiCheckCircle, FiAlertCircle, FiBook } from 'react-icons/fi';
import toast from 'react-hot-toast';
import attendanceService from '../../services/attendanceService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ActiveSessionsPage = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchActiveSessions();
        // Refresh every 30 seconds
        const interval = setInterval(fetchActiveSessions, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchActiveSessions = async () => {
        try {
            const response = await attendanceService.getActiveSessions();
            if (response.success) {
                setSessions(response.data || []);
            }
        } catch (error) {
            // Silent error on refresh
            if (loading) {
                toast.error('Aktif yoklamalar yüklenirken hata oluştu');
            }
            console.error(error);
        } finally {
            setLoading(false);
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
        <div className="p-6 lg:p-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 rounded-xl bg-primary-500/20">
                    <FiClock className="w-6 h-6 text-primary-400" />
                </div>
                <div>
                    <h1 className="font-display text-3xl font-bold">Aktif Yoklamalar</h1>
                    <p className="text-slate-400">Katılabileceğiniz aktif yoklama oturumları</p>
                </div>
            </div>

            {sessions.length === 0 ? (
                <div className="card text-center py-16">
                    <FiAlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Aktif Yoklama Yok</h3>
                    <p className="text-slate-400 mb-4">
                        Şu anda kayıtlı olduğunuz derslerde aktif yoklama bulunmuyor.
                    </p>
                    <Link to="/my-courses" className="btn btn-secondary">
                        Derslerime Git
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {sessions.map((session) => (
                        <div key={session.id} className="card p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <FiBook className="w-5 h-5 text-primary-400" />
                                        <h3 className="font-semibold text-lg">
                                            {session.course?.code || 'Ders'} - {session.course?.name || 'İsimsiz'}
                                        </h3>
                                    </div>

                                    <div className="flex flex-wrap gap-4 text-sm text-slate-400 mb-4">
                                        <div className="flex items-center gap-1">
                                            <FiClock className="w-4 h-4" />
                                            <span>Başlangıç: {session.startTime}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <FiMapPin className="w-4 h-4" />
                                            <span>{session.classroom || 'Sınıf belirtilmemiş'}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <FiUsers className="w-4 h-4" />
                                            <span>{session.attendanceCount || 0} kişi katıldı</span>
                                        </div>
                                    </div>

                                    {session.requiresQR && (
                                        <div className="text-xs text-amber-400 mb-2">
                                            ⚠️ Bu yoklama QR kod gerektirir
                                        </div>
                                    )}
                                </div>

                                <div className="ml-4">
                                    {session.alreadyCheckedIn ? (
                                        <div className="flex items-center gap-2 text-green-400 px-4 py-2 bg-green-500/10 rounded-lg">
                                            <FiCheckCircle className="w-5 h-5" />
                                            <span className="font-medium">Katıldınız</span>
                                        </div>
                                    ) : (
                                        <Link
                                            to={`/attendance/give/${session.id}`}
                                            className="btn btn-primary"
                                        >
                                            Yoklama Ver
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-6 p-4 bg-slate-800/50 rounded-xl text-sm text-slate-400">
                <strong className="text-slate-300">💡 Bilgi:</strong> Yoklama oturumları belirli bir süre sonra
                kapanır. Yoklamaya zamanında katıldığınızdan emin olun. Sayfa her 30 saniyede otomatik yenilenir.
            </div>
        </div>
    );
};

export default ActiveSessionsPage;
