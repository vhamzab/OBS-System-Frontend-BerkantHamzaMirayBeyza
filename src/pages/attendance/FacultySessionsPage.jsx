import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiCalendar, FiClock, FiUsers, FiCheckCircle, FiXCircle, FiBook, FiFilter } from 'react-icons/fi';
import toast from 'react-hot-toast';
import attendanceService from '../../services/attendanceService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const FacultySessionsPage = () => {
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchSessions();
    }, [statusFilter]);

    const fetchSessions = async () => {
        try {
            setLoading(true);
            const params = statusFilter !== 'all' ? { status: statusFilter } : {};
            const response = await attendanceService.getInstructorSessions(params);
            if (response.success) {
                setSessions(response.data);
            }
        } catch (error) {
            toast.error('Yoklama oturumları yüklenirken hata oluştu');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'active':
                return (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400">
                        Aktif
                    </span>
                );
            case 'closed':
                return (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-500/20 text-slate-400">
                        Kapatıldı
                    </span>
                );
            default:
                return (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-500/20 text-amber-400">
                        {status}
                    </span>
                );
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
        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="font-display text-3xl font-bold">Yoklama Oturumları</h1>
                    <p className="text-slate-400">Tüm yoklama oturumlarınızı görüntüleyin</p>
                </div>
                <Link to="/attendance/start" className="btn btn-primary">
                    Yeni Yoklama Başlat
                </Link>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <FiFilter className="text-slate-400" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="input py-2"
                    >
                        <option value="all">Tüm Oturumlar</option>
                        <option value="active">Aktif</option>
                        <option value="closed">Kapatıldı</option>
                    </select>
                </div>
                <span className="text-slate-400 text-sm">
                    Toplam {sessions.length} oturum
                </span>
            </div>

            {sessions.length === 0 ? (
                <div className="card text-center py-16">
                    <FiCalendar className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Yoklama Oturumu Bulunamadı</h3>
                    <p className="text-slate-400 mb-4">
                        Henüz hiç yoklama oturumu başlatmamışsınız.
                    </p>
                    <Link to="/attendance/start" className="btn btn-primary">
                        İlk Yoklamayı Başlat
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {sessions.map((session) => (
                        <div key={session.id} className="card p-6 hover:ring-1 hover:ring-primary-500/50 transition-all">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center">
                                        <FiBook className="w-7 h-7 text-primary-400" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-lg">
                                                {session.course?.code} - {session.course?.name}
                                            </h3>
                                            {getStatusBadge(session.status)}
                                        </div>
                                        <p className="text-slate-400 text-sm mb-3">
                                            Section {session.sectionNumber}
                                        </p>

                                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                                            <span className="flex items-center gap-1">
                                                <FiCalendar className="w-4 h-4" />
                                                {formatDate(session.date)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <FiClock className="w-4 h-4" />
                                                {session.startTime} - {session.endTime}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <FiUsers className="w-4 h-4" />
                                                {session.attendanceCount || 0} / {session.enrolledCount || 0} katılım
                                            </span>
                                            <span className="flex items-center gap-1">
                                                {session.attendanceRate >= 70 ? (
                                                    <FiCheckCircle className="w-4 h-4 text-green-400" />
                                                ) : (
                                                    <FiXCircle className="w-4 h-4 text-red-400" />
                                                )}
                                                %{session.attendanceRate || 0}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {session.status === 'active' && (
                                        <Link
                                            to="/attendance/start"
                                            className="btn btn-secondary"
                                        >
                                            Yönet
                                        </Link>
                                    )}
                                    <Link
                                        to={`/attendance/report/${session.sectionId}`}
                                        className="btn btn-outline"
                                    >
                                        Rapor
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FacultySessionsPage;
