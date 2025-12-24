import { useMemo } from 'react';

import { useTranslation } from 'react-i18next';
/**
 * Grade Distribution Chart Component
 * Displays grade distribution as a bar chart
 */
const GradeDistributionChart = ({
  grades = [],
  title = 'Not Dağılımı',
  className = '',
}) => {
  const { t } = useTranslation();
  // Grade color mapping
  const gradeColors = {
    'AA': 'bg-green-600',
    'BA': 'bg-green-500',
    'BB': 'bg-green-400',
    'CB': 'bg-lime-500',
    'CC': 'bg-yellow-500',
    'DC': 'bg-orange-400',
    'DD': 'bg-orange-500',
    'FD': 'bg-red-400',
    'FF': 'bg-red-600',
  };

  const gradeLabels = ['AA', 'BA', 'BB', 'CB', 'CC', 'DC', 'DD', 'FD', 'FF'];

  // Calculate grade distribution
  const distribution = useMemo(() => {
    const dist = {};
    gradeLabels.forEach((g) => (dist[g] = 0));

    grades.forEach((grade) => {
      const letterGrade = grade.grades?.letterGrade || grade.letterGrade;
      if (letterGrade && dist[letterGrade] !== undefined) {
        dist[letterGrade]++;
      }
    });

    return dist;
  }, [grades]);

  // Calculate statistics
  const stats = useMemo(() => {
    const validGrades = grades.filter((g) => {
      const lg = g.grades?.letterGrade || g.letterGrade;
      return lg && lg !== 'FF';
    });

    const points = validGrades.map((g) => g.grades?.gradePoint || g.gradePoint || 0);
    const avg = points.length > 0 ? points.reduce((a, b) => a + b, 0) / points.length : 0;

    const passed = validGrades.length;
    const failed = grades.filter((g) => {
      const lg = g.grades?.letterGrade || g.letterGrade;
      return lg === 'FF';
    }).length;

    return {
      average: avg.toFixed(2),
      passed,
      failed,
      total: grades.length,
      passRate: grades.length > 0 ? Math.round((passed / grades.length) * 100) : 0,
    };
  }, [grades]);

  const maxCount = Math.max(...Object.values(distribution), 1);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
        <div className="text-right">
          <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">{t('grades.average')}</p>
          <p className="text-lg font-bold text-indigo-600">{stats.average}</p>
        </div>
      </div>

      {/* Statistics summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <p className="text-2xl font-bold text-gray-700 dark:text-gray-200">{stats.total}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">{t('dashboard.totalCourses')}</p>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <p className="text-2xl font-bold text-green-600">{stats.passed}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">Geçti</p>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">Kaldı</p>
        </div>
      </div>

      {/* Bar chart */}
      <div className="space-y-3">
        {gradeLabels.map((grade) => {
          const count = distribution[grade];
          const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

          return (
            <div key={grade} className="flex items-center gap-3">
              <div className="w-8 text-sm font-medium text-gray-600 dark:text-gray-300">{grade}</div>
              <div className="flex-1 h-6 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${gradeColors[grade]} flex items-center justify-end pr-2`}
                  style={{ width: `${Math.max(percentage, count > 0 ? 10 : 0)}%` }}
                >
                  {count > 0 && (
                    <span className="text-xs text-gray-800 dark:text-gray-100 font-medium">{count}</span>
                  )}
                </div>
              </div>
              <div className="w-8 text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 text-right">{count}</div>
            </div>
          );
        })}
      </div>

      {/* Pass rate indicator */}
      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-300">Geçme Oranı</span>
          <span className={`text-sm font-medium ${stats.passRate >= 50 ? 'text-green-600' : 'text-red-600'}`}>
            {stats.passRate}%
          </span>
        </div>
        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${stats.passRate >= 50 ? 'bg-green-500' : 'bg-red-500'}`}
            style={{ width: `${stats.passRate}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default GradeDistributionChart;
