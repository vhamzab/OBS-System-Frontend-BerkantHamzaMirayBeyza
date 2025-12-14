import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, Award } from 'lucide-react';

/**
 * GPA Trend Chart Component
 * Displays GPA trend over semesters
 */
const GPATrendChart = ({
  semesters = [],
  cgpa = 0,
  title = 'GPA Trend',
  className = '',
}) => {
  // Semester name mapping
  const semesterNames = {
    fall: 'Güz',
    spring: 'Bahar',
    summer: 'Yaz',
  };

  // Calculate trend
  const trend = useMemo(() => {
    if (semesters.length < 2) return 'stable';
    
    const recent = semesters.slice(-2);
    const older = semesters.slice(-4, -2);
    
    const avgRecent = recent.reduce((acc, s) => acc + (s.gpa || 0), 0) / recent.length;
    const avgOlder = older.length > 0
      ? older.reduce((acc, s) => acc + (s.gpa || 0), 0) / older.length
      : avgRecent;
    
    if (avgRecent > avgOlder + 0.1) return 'up';
    if (avgRecent < avgOlder - 0.1) return 'down';
    return 'stable';
  }, [semesters]);

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500';
  const trendText = trend === 'up' ? 'Yükseliyor' : trend === 'down' ? 'Düşüyor' : 'Stabil';

  // GPA color based on value
  const getGPAColor = (gpa) => {
    if (gpa >= 3.5) return 'text-green-600';
    if (gpa >= 3.0) return 'text-blue-600';
    if (gpa >= 2.5) return 'text-yellow-600';
    if (gpa >= 2.0) return 'text-orange-600';
    return 'text-red-600';
  };

  const getGPABg = (gpa) => {
    if (gpa >= 3.5) return 'bg-green-50 border-green-200';
    if (gpa >= 3.0) return 'bg-blue-50 border-blue-200';
    if (gpa >= 2.5) return 'bg-yellow-50 border-yellow-200';
    if (gpa >= 2.0) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  // Get honor status
  const getHonorStatus = (gpa) => {
    if (gpa >= 3.5) return { label: 'Yüksek Şeref', color: 'text-green-600', bg: 'bg-green-100' };
    if (gpa >= 3.0) return { label: 'Şeref', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (gpa >= 2.5) return { label: 'İyi', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (gpa >= 2.0) return { label: 'Geçer', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { label: 'Düşük', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const honorStatus = getHonorStatus(cgpa);
  const maxGPA = 4.0;

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <div className={`flex items-center gap-1 ${trendColor}`}>
          <TrendIcon className="h-4 w-4" />
          <span className="text-sm">{trendText}</span>
        </div>
      </div>

      {/* CGPA Display */}
      <div className={`text-center p-6 rounded-lg border ${getGPABg(cgpa)} mb-6`}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <Award className={`h-6 w-6 ${getGPAColor(cgpa)}`} />
          <span className={`text-4xl font-bold ${getGPAColor(cgpa)}`}>
            {cgpa.toFixed(2)}
          </span>
        </div>
        <p className="text-sm text-gray-600">Genel Not Ortalaması (CGPA)</p>
        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${honorStatus.bg} ${honorStatus.color}`}>
          {honorStatus.label}
        </span>
      </div>

      {/* Semester GPA Chart */}
      {semesters && semesters.length > 0 && (
        <>
          <p className="text-sm font-medium text-gray-700 mb-4">Dönemlik GPA</p>
          
          {/* Visual chart */}
          <div className="relative h-40 mb-4">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between">
              {[4.0, 3.0, 2.0, 1.0, 0].map((val) => (
                <div key={val} className="flex items-center">
                  <span className="text-xs text-gray-400 w-8">{val.toFixed(1)}</span>
                  <div className="flex-1 border-t border-gray-100" />
                </div>
              ))}
            </div>

            {/* Chart bars */}
            <div className="absolute inset-0 ml-10 flex items-end justify-around pb-0">
              {semesters.slice(-8).map((semester, index) => {
                const height = (semester.gpa / maxGPA) * 100;
                return (
                  <div key={index} className="flex flex-col items-center gap-1 flex-1 max-w-16">
                    <span className={`text-xs font-medium ${getGPAColor(semester.gpa)}`}>
                      {semester.gpa.toFixed(2)}
                    </span>
                    <div
                      className={`w-8 rounded-t transition-all duration-500 ${
                        semester.gpa >= 3.0 ? 'bg-green-500' :
                        semester.gpa >= 2.0 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ height: `${Math.max(height, 5)}%` }}
                    />
                    <span className="text-xs text-gray-500 text-center">
                      {semesterNames[semester.semester] || semester.semester}
                      <br />
                      {semester.year}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Semester details */}
          <div className="space-y-2 mt-6">
            {semesters.slice(-4).reverse().map((semester, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">
                  {semester.year} {semesterNames[semester.semester] || semester.semester}
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">
                    {semester.totalCredits || semester.credits} kredi
                  </span>
                  <span className={`text-sm font-medium ${getGPAColor(semester.gpa)}`}>
                    {semester.gpa.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* GPA Scale legend */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            3.0+ Başarılı
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
            2.0-2.99 Orta
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            &lt;2.0 Düşük
          </span>
        </div>
      </div>
    </div>
  );
};

export default GPATrendChart;
