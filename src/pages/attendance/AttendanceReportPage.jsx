import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  FiArrowLeft, FiDownload, FiUser, FiAlertTriangle, 
  FiCheckCircle, FiXCircle, FiFlag, FiFilter
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import courseService from '../../services/courseService';
import attendanceService from '../../services/attendanceService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

import { useTranslation } from 'react-i18next';
const AttendanceReportPage = () => {
  const { t } = useTranslation();
  const { sectionId } = useParams();
  const [section, setSection] = useState(null);
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, [sectionId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [sectionRes, reportRes] = await Promise.all([
        courseService.getSectionById(sectionId),
        attendanceService.getAttendanceReport(sectionId),
      ]);
      
      if (sectionRes.success) {
        setSection(sectionRes.data);
      }
      
      if (reportRes.success) {
        setReport(reportRes.data.students);
      }
    } catch (error) {
      toast.error('Rapor yüklenirken hata oluştu');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Öğrenci No', 'Ad', 'Soyad', 'Katıldı', 'Geç', 'Mazeretli', 'Devamsız', 'Oran', 'Durum', 'Şüpheli'];
    const rows = report.map((s) => [
      s.studentNumber,
      s.firstName,
      s.lastName,
      s.present,
      s.late,
      s.excused,
      s.absent,
      `${s.attendancePercentage}%`,
      s.status,
      s.isFlagged ? t('common.yes') : 'Hayır',
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `yoklama_raporu_${section?.course?.code}_${section?.sectionNumber}.csv`;
    link.click();
  };

  const filteredReport = report.filter((s) => {
    if (filter === 'all') return true;
    if (filter === 'warning') return s.status === 'warning' || s.status === 'critical';
    if (filter === 'flagged') return s.isFlagged;
    return true;
  });

  const getStatusConfig = (status) => {
    switch (status) {
      case 'critical':
        return { color: 'text-red-400', bg: 'bg-red-500/20', icon: FiXCircle };
      case 'warning':
        return { color: 'text-amber-400', bg: 'bg-amber-500/20', icon: FiAlertTriangle };
      default:
        return { color: 'text-green-400', bg: 'bg-green-500/20', icon: FiCheckCircle };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const warningCount = report.filter((s) => s.status === 'warning' || s.status === 'critical').length;
  const flaggedCount = report.filter((s) => s.isFlagged).length;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Back Button */}
      <Link to="/faculty/sections" className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 dark:text-gray-100 mb-6 transition-colors">
        <FiArrowLeft className="w-4 h-4 mr-2" />
        Derslerime Dön
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-primary-500/20 text-primary-400 text-sm font-medium">
              {section?.course?.code}
            </span>
            <span className="text-gray-600 dark:text-gray-300">Section {section?.sectionNumber}</span>
          </div>
          <h1 className="font-display text-2xl font-bold">{t('attendance.attendanceReport')}</h1>
        </div>
        
        <button onClick={exportToCSV} className="btn btn-secondary">
          <FiDownload className="w-4 h-4 mr-2" />
          Excel İndir
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card text-center">
          <div className="text-3xl font-bold text-gray-800 dark:text-gray-100">{report.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">{t('dashboard.totalStudents')}</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-green-400">
            {report.filter((s) => s.status === 'ok').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">İyi Durumda</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-amber-400">{warningCount}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Uyarı/Kritik</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-red-400">{flaggedCount}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Şüpheli</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-6">
        <FiFilter className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input"
        >
          <option value="all">Tüm Öğrenciler ({report.length})</option>
          <option value="warning">Uyarı/Kritik ({warningCount})</option>
          <option value="flagged">Şüpheli ({flaggedCount})</option>
        </select>
      </div>

      {/* Report Table */}
      {filteredReport.length === 0 ? (
        <div className="card text-center py-16">
          <FiUser className="w-16 h-16 mx-auto text-gray-700 dark:text-gray-200 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Öğrenci Bulunamadı</h2>
          <p className="text-gray-600 dark:text-gray-300">Seçili filtreye uygun öğrenci bulunmuyor.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700/50 bg-gray-100 dark:bg-gray-800/50">
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">{t('roles.student')}</th>
                  <th className="text-center py-4 px-3 text-sm font-medium text-gray-600 dark:text-gray-300">Katıldı</th>
                  <th className="text-center py-4 px-3 text-sm font-medium text-gray-600 dark:text-gray-300">{t('attendance.late')}</th>
                  <th className="text-center py-4 px-3 text-sm font-medium text-gray-600 dark:text-gray-300">Mazeretli</th>
                  <th className="text-center py-4 px-3 text-sm font-medium text-gray-600 dark:text-gray-300">Devamsız</th>
                  <th className="text-center py-4 px-3 text-sm font-medium text-gray-600 dark:text-gray-300">Oran</th>
                  <th className="text-center py-4 px-3 text-sm font-medium text-gray-600 dark:text-gray-300">{t('common.status')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredReport.map((student) => {
                  const statusConfig = getStatusConfig(student.status);
                  const StatusIcon = statusConfig.icon;
                  
                  return (
                    <tr 
                      key={student.studentId}
                      className={`border-b border-gray-200 dark:border-gray-700/30 ${
                        student.isFlagged ? 'bg-red-500/5' : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800/30'
                      } transition-colors`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            student.isFlagged ? 'bg-red-500/20' : 'bg-gradient-to-br from-primary-500/20 to-accent-500/20'
                          }`}>
                            {student.isFlagged ? (
                              <FiFlag className="w-5 h-5 text-red-400" />
                            ) : (
                              <FiUser className="w-5 h-5 text-primary-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {student.firstName} {student.lastName}
                              {student.isFlagged && (
                                <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-xs">
                                  Şüpheli
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-300">{student.studentNumber}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="font-medium text-green-400">{student.present}</span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="font-medium text-amber-400">{student.late}</span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="font-medium text-blue-400">{student.excused}</span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="font-medium text-red-400">{student.absent}</span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 h-2 rounded-full bg-primary-50 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                student.status === 'critical' ? 'bg-red-500' :
                                student.status === 'warning' ? 'bg-amber-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${student.attendancePercentage}%` }}
                            />
                          </div>
                          <span className="font-medium">{student.attendancePercentage}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${statusConfig.bg} ${statusConfig.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          <span className="text-xs font-medium">
                            {student.status === 'critical' ? 'Kritik' : 
                             student.status === 'warning' ? 'Uyarı' : 'İyi'}
                          </span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceReportPage;





