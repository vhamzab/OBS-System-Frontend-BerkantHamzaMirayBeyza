import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

import { useTranslation } from 'react-i18next';
/**
 * Attendance Chart Component
 * Displays attendance statistics with a visual line chart
 */
const AttendanceChart = ({
  data = [],
  title = 'Yoklama İstatistikleri',
  className = '',
}) => {
  const { t } = useTranslation();
  // Calculate statistics
  const stats = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        totalSessions: 0,
        present: 0,
        late: 0,
        excused: 0,
        absent: 0,
        attendanceRate: 100,
        trend: 'stable',
      };
    }

    const totalSessions = data.reduce((acc, d) => acc + (d.totalSessions || 0), 0);
    const present = data.reduce((acc, d) => acc + (d.present || 0), 0);
    const late = data.reduce((acc, d) => acc + (d.late || 0), 0);
    const excused = data.reduce((acc, d) => acc + (d.excused || 0), 0);
    const absent = data.reduce((acc, d) => acc + (d.absent || 0), 0);

    const attendanceRate = totalSessions > 0
      ? Math.round(((present + late + excused) / totalSessions) * 100)
      : 100;

    // Calculate trend from last 3 courses
    const recent = data.slice(-3);
    const avgRecent = recent.reduce((acc, d) => acc + (d.attendancePercentage || 100), 0) / recent.length;
    const older = data.slice(0, -3);
    const avgOlder = older.length > 0
      ? older.reduce((acc, d) => acc + (d.attendancePercentage || 100), 0) / older.length
      : avgRecent;

    let trend = 'stable';
    if (avgRecent > avgOlder + 5) trend = 'up';
    else if (avgRecent < avgOlder - 5) trend = 'down';

    return { totalSessions, present, late, excused, absent, attendanceRate, trend };
  }, [data]);

  const getStatusColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBg = (percentage) => {
    if (percentage >= 80) return 'bg-green-100';
    if (percentage >= 70) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const TrendIcon = stats.trend === 'up' ? TrendingUp : stats.trend === 'down' ? TrendingDown : Minus;
  const trendColor = stats.trend === 'up' ? 'text-green-500' : stats.trend === 'down' ? 'text-red-500' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500';

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
        <div className={`flex items-center gap-1 ${trendColor}`}>
          <TrendIcon className="h-4 w-4" />
          <span className="text-sm">
            {stats.trend === 'up' ? 'Yükseliyor' : stats.trend === 'down' ? 'Düşüyor' : 'Stabil'}
          </span>
        </div>
      </div>

      {/* Main attendance rate */}
      <div className="text-center mb-6">
        <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${getStatusBg(stats.attendanceRate)}`}>
          <div>
            <span className={`text-4xl font-bold ${getStatusColor(stats.attendanceRate)}`}>
              {stats.attendanceRate}%
            </span>
            <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">{t('attendance.attendanceRate')}</p>
          </div>
        </div>
      </div>

      {/* Statistics breakdown */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <p className="text-2xl font-bold text-green-600">{stats.present}</p>
          <p className="text-xs text-gray-600 dark:text-gray-300">Katıldı</p>
        </div>
        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
          <p className="text-xs text-gray-600 dark:text-gray-300">Geç Kaldı</p>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <p className="text-2xl font-bold text-blue-600">{stats.excused}</p>
          <p className="text-xs text-gray-600 dark:text-gray-300">Mazeretli</p>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
          <p className="text-xs text-gray-600 dark:text-gray-300">Devamsız</p>
        </div>
      </div>

      {/* Per-course breakdown (if data exists) */}
      {data && data.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Ders Bazlı Devam Durumu</p>
          {data.map((course, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-24 text-sm text-gray-600 dark:text-gray-300 truncate" title={course.course?.code}>
                {course.course?.code || `Ders ${index + 1}`}
              </div>
              <div className="flex-1 h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    (course.attendancePercentage || 100) >= 80
                      ? 'bg-green-500'
                      : (course.attendancePercentage || 100) >= 70
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${course.attendancePercentage || 100}%` }}
                />
              </div>
              <div className={`w-12 text-sm font-medium text-right ${getStatusColor(course.attendancePercentage || 100)}`}>
                {course.attendancePercentage || 100}%
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Warning thresholds */}
      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            80%+ İyi
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
            70-79% Uyarı
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            &lt;70% Kritik
          </span>
        </div>
      </div>
    </div>
  );
};

export default AttendanceChart;
