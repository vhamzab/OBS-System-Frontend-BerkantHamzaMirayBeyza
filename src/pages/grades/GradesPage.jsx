import { useState, useEffect } from 'react';
import { FiDownload, FiTrendingUp, FiBook, FiAward, FiBarChart2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import gradeService from '../../services/gradeService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const GradesPage = () => {
  const [grades, setGrades] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState('all');

  const semesterNames = {
    fall: 'Güz',
    spring: 'Bahar',
    summer: 'Yaz',
  };

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      setLoading(true);
      const response = await gradeService.getMyGrades();
      
      if (response.success) {
        setGrades(response.data.grades);
        setSummary(response.data.summary);
      }
    } catch (error) {
      toast.error('Notlar yüklenirken hata oluştu');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTranscript = async () => {
    try {
      setDownloading(true);
      await gradeService.downloadTranscriptPDF();
      toast.success('Transkript indirildi');
    } catch (error) {
      toast.error('Transkript indirilirken hata oluştu');
      console.error(error);
    } finally {
      setDownloading(false);
    }
  };

  const getGradeColor = (letterGrade) => {
    if (!letterGrade) return 'text-slate-400';
    const grade = letterGrade.toUpperCase();
    if (['AA', 'BA'].includes(grade)) return 'text-green-400';
    if (['BB', 'CB'].includes(grade)) return 'text-emerald-400';
    if (['CC', 'DC'].includes(grade)) return 'text-amber-400';
    if (['DD', 'FD'].includes(grade)) return 'text-orange-400';
    return 'text-red-400';
  };

  const getGradeBg = (letterGrade) => {
    if (!letterGrade) return 'bg-slate-700/50';
    const grade = letterGrade.toUpperCase();
    if (['AA', 'BA'].includes(grade)) return 'bg-green-500/20';
    if (['BB', 'CB'].includes(grade)) return 'bg-emerald-500/20';
    if (['CC', 'DC'].includes(grade)) return 'bg-amber-500/20';
    if (['DD', 'FD'].includes(grade)) return 'bg-orange-500/20';
    return 'bg-red-500/20';
  };

  const filteredGrades = selectedSemester === 'all'
    ? grades
    : grades.filter((g) => `${g.year}-${g.semester}` === selectedSemester);

  const semesters = [...new Set(grades.map((g) => `${g.year}-${g.semester}`))].sort().reverse();

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold mb-2">Notlarım</h1>
          <p className="text-slate-400">Akademik performansınızı görüntüleyin</p>
        </div>
        <button
          onClick={handleDownloadTranscript}
          disabled={downloading}
          className="btn btn-primary"
        >
          {downloading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <>
              <FiDownload className="w-4 h-4 mr-2" />
              Transkript İndir
            </>
          )}
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center">
                <FiTrendingUp className="w-7 h-7 text-primary-400" />
              </div>
              <div>
                <div className="text-3xl font-bold text-primary-400">
                  {summary.cgpa?.toFixed(2) || '0.00'}
                </div>
                <div className="text-sm text-slate-400">Genel Not Ortalaması</div>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                <FiAward className="w-7 h-7 text-emerald-400" />
              </div>
              <div>
                <div className="text-3xl font-bold text-emerald-400">
                  {summary.totalCredits || 0}
                </div>
                <div className="text-sm text-slate-400">Toplam Kredi</div>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                <FiBook className="w-7 h-7 text-amber-400" />
              </div>
              <div>
                <div className="text-3xl font-bold text-amber-400">
                  {grades.length}
                </div>
                <div className="text-sm text-slate-400">Toplam Ders</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Semester GPA Chart */}
      {summary?.semesters && summary.semesters.length > 0 && (
        <div className="card mb-8">
          <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
            <FiBarChart2 className="w-5 h-5 text-primary-400" />
            Dönem Bazlı GPA
          </h2>
          <div className="flex items-end gap-4 h-32 overflow-x-auto pb-2">
            {summary.semesters.map((sem, idx) => (
              <div key={idx} className="flex flex-col items-center min-w-[80px]">
                <div 
                  className="w-12 bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-lg transition-all duration-500"
                  style={{ height: `${(sem.gpa / 4) * 100}%` }}
                />
                <div className="text-sm font-bold mt-2">{sem.gpa.toFixed(2)}</div>
                <div className="text-xs text-slate-400">
                  {semesterNames[sem.semester]} {sem.year}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-4 mb-6">
        <label className="text-sm text-slate-400">Dönem:</label>
        <select
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
          className="input"
        >
          <option value="all">Tüm Dönemler</option>
          {semesters.map((sem) => {
            const [year, semester] = sem.split('-');
            return (
              <option key={sem} value={sem}>
                {semesterNames[semester]} {year}
              </option>
            );
          })}
        </select>
      </div>

      {/* Grades Table */}
      {filteredGrades.length === 0 ? (
        <div className="card text-center py-16">
          <FiBook className="w-16 h-16 mx-auto text-slate-600 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Not Bulunamadı</h2>
          <p className="text-slate-400">Seçili dönem için not kaydı bulunmuyor.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left py-4 px-4 text-sm font-medium text-slate-400">Ders</th>
                  <th className="text-center py-4 px-4 text-sm font-medium text-slate-400">Kredi</th>
                  <th className="text-center py-4 px-4 text-sm font-medium text-slate-400">Vize</th>
                  <th className="text-center py-4 px-4 text-sm font-medium text-slate-400">Final</th>
                  <th className="text-center py-4 px-4 text-sm font-medium text-slate-400">Ortalama</th>
                  <th className="text-center py-4 px-4 text-sm font-medium text-slate-400">Harf</th>
                  <th className="text-center py-4 px-4 text-sm font-medium text-slate-400">Puan</th>
                </tr>
              </thead>
              <tbody>
                {filteredGrades.map((grade, idx) => (
                  <tr 
                    key={idx}
                    className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                          <FiBook className="w-5 h-5 text-primary-400" />
                        </div>
                        <div>
                          <div className="font-medium">{grade.course?.name}</div>
                          <div className="text-xs text-slate-400">{grade.course?.code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">{grade.course?.credits}</td>
                    <td className="py-4 px-4 text-center">
                      {grade.grades?.midterm !== null ? grade.grades.midterm : '-'}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {grade.grades?.final !== null ? grade.grades.final : '-'}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {grade.grades?.average !== null ? parseFloat(grade.grades.average).toFixed(1) : '-'}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {grade.grades?.letterGrade ? (
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${getGradeBg(grade.grades.letterGrade)} ${getGradeColor(grade.grades.letterGrade)}`}>
                          {grade.grades.letterGrade}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="py-4 px-4 text-center font-medium">
                      {grade.grades?.gradePoint !== null ? parseFloat(grade.grades.gradePoint).toFixed(2) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradesPage;

