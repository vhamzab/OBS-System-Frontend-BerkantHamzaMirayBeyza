import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiDownload, FiUser, FiBook, FiCheck, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import courseService from '../../services/courseService';
import enrollmentService from '../../services/enrollmentService';
import gradeService from '../../services/gradeService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

import { useTranslation } from 'react-i18next';
const GradebookPage = () => {
  const { t } = useTranslation();
  const { sectionId } = useParams();
  const [section, setSection] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changes, setChanges] = useState({});

  useEffect(() => {
    fetchData();
  }, [sectionId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch section details
      const sectionRes = await courseService.getSectionById(sectionId);
      if (sectionRes.success) {
        setSection(sectionRes.data);
      }

      // Fetch students
      const studentsRes = await enrollmentService.getSectionStudents(sectionId);
      if (studentsRes.success) {
        setStudents(studentsRes.data);
      }
    } catch (error) {
      toast.error('Veriler yüklenirken hata oluştu');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeChange = (enrollmentId, field, value) => {
    // Validate grade
    const numValue = parseFloat(value);
    if (value !== '' && (isNaN(numValue) || numValue < 0 || numValue > 100)) {
      return;
    }

    setChanges((prev) => ({
      ...prev,
      [enrollmentId]: {
        ...prev[enrollmentId],
        [field]: value === '' ? null : numValue,
      },
    }));
  };

  const calculateLetterGrade = (midterm, final, homework) => {
    if (midterm === null || final === null) return '-';

    const hwGrade = homework !== null ? homework : 0;
    const avg = (midterm * 0.3) + (final * 0.5) + (hwGrade * 0.2);

    if (avg >= 90) return 'AA';
    if (avg >= 85) return 'BA';
    if (avg >= 80) return 'BB';
    if (avg >= 75) return 'CB';
    if (avg >= 70) return 'CC';
    if (avg >= 65) return 'DC';
    if (avg >= 60) return 'DD';
    if (avg >= 50) return 'FD';
    return 'FF';
  };

  const handleSaveGrades = async () => {
    const changedEntries = Object.entries(changes).filter(([_, grades]) =>
      Object.values(grades).some(v => v !== undefined)
    );

    if (changedEntries.length === 0) {
      toast.info('Kaydedilecek değişiklik yok');
      return;
    }

    try {
      setSaving(true);

      const gradesPayload = changedEntries.map(([enrollmentId, grades]) => ({
        enrollment_id: enrollmentId,
        midterm: grades.midterm,
        final: grades.final,
        homework: grades.homework,
      }));

      const response = await gradeService.bulkEnterGrades(sectionId, gradesPayload);

      if (response.success) {
        toast.success(`${response.data.results.length} öğrencinin notu güncellendi`);

        if (response.data.errors.length > 0) {
          toast.error(`${response.data.errors.length} hata oluştu`);
        }

        setChanges({});
        fetchData(); // Refresh data
      }
    } catch (error) {
      toast.error('Notlar kaydedilirken hata oluştu');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['No', t('auth.firstName'), t('auth.lastName'), t('grades.midterm'), t('grades.final'), t('grades.assignment'), t('grades.average'), t('grades.letterGrade')];

    const rows = students.map((s) => [
      s.student.studentNumber,
      s.student.firstName,
      s.student.lastName,
      s.grades?.midterm || '',
      s.grades?.final || '',
      s.grades?.homework || '',
      s.grades?.average || '',
      s.grades?.letterGrade || '',
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `notlar_${section?.course?.code}_${section?.sectionNumber}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const hasChanges = Object.keys(changes).length > 0;

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
          <h1 className="font-display text-2xl font-bold">
            {section?.course?.name} - Not Defteri
          </h1>
        </div>

        <div className="flex gap-3">
          <button onClick={exportToCSV} className="btn btn-secondary">
            <FiDownload className="w-4 h-4 mr-2" />
            CSV İndir
          </button>
          <button
            onClick={handleSaveGrades}
            disabled={!hasChanges || saving}
            className={`btn ${hasChanges ? 'btn-primary' : 'btn-secondary opacity-50'}`}
          >
            {saving ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <FiSave className="w-4 h-4 mr-2" />{t('common.save')}</>
            )}
          </button>
        </div>
      </div>

      {/* Auto-calculation Info Banner */}
      <div className="card mb-6 bg-gradient-to-r from-primary-500/10 to-accent-500/10 border border-primary-500/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center shrink-0">
            <FiCheck className="w-5 h-5 text-primary-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-primary-400 mb-1">Otomatik Hesaplama Sistemi</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
              Notlar kaydedildiğinde sistem otomatik olarak <strong>ortalama not</strong> (Vize %30 + Final %50 + Ödev %20),
              <strong> harf notu</strong> ve <strong>not puanı</strong> hesaplar. Ayrıca öğrencilerin <strong>CGPA</strong> değerleri de güncellenir.
            </p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      {hasChanges && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6 flex items-center gap-3">
          <FiAlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="text-amber-200">
            Kaydedilmemiş değişiklikler var. Değişiklikleri kaydetmeyi unutmayın.
          </span>
        </div>
      )}

      {/* Gradebook Table */}
      {students.length === 0 ? (
        <div className="card text-center py-16">
          <FiUser className="w-16 h-16 mx-auto text-gray-700 dark:text-gray-200 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Öğrenci Bulunamadı</h2>
          <p className="text-gray-600 dark:text-gray-300">Bu derse kayıtlı öğrenci bulunmuyor.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700/50 bg-gray-100 dark:bg-gray-800/50">
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">{t('roles.student')}</th>
                  <th className="text-center py-4 px-3 text-sm font-medium text-gray-600 dark:text-gray-300 w-24">Vize (30%)</th>
                  <th className="text-center py-4 px-3 text-sm font-medium text-gray-600 dark:text-gray-300 w-24">Final (50%)</th>
                  <th className="text-center py-4 px-3 text-sm font-medium text-gray-600 dark:text-gray-300 w-24">Ödev (20%)</th>
                  <th className="text-center py-4 px-3 text-sm font-medium text-gray-600 dark:text-gray-300 w-20">{t('grades.average')}</th>
                  <th className="text-center py-4 px-3 text-sm font-medium text-gray-600 dark:text-gray-300 w-20">Harf</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const currentGrades = {
                    midterm: changes[student.enrollmentId]?.midterm ?? student.grades?.midterm,
                    final: changes[student.enrollmentId]?.final ?? student.grades?.final,
                    homework: changes[student.enrollmentId]?.homework ?? student.grades?.homework,
                  };

                  const previewLetter = calculateLetterGrade(
                    currentGrades.midterm,
                    currentGrades.final,
                    currentGrades.homework
                  );

                  const hasChange = changes[student.enrollmentId];

                  return (
                    <tr
                      key={student.enrollmentId}
                      className={`border-b border-gray-200 dark:border-gray-700/30 ${hasChange ? 'bg-primary-500/5' : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800/30'} transition-colors`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center">
                            <FiUser className="w-5 h-5 text-primary-400" />
                          </div>
                          <div>
                            <div className="font-medium">
                              {student.student.firstName} {student.student.lastName}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-300">{student.student.studentNumber}</div>
                          </div>
                          {hasChange && (
                            <span className="ml-2 text-amber-400">
                              <FiCheck className="w-4 h-4" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.5"
                          value={currentGrades.midterm ?? ''}
                          onChange={(e) => handleGradeChange(student.enrollmentId, 'midterm', e.target.value)}
                          className="input w-full text-center"
                          placeholder="-"
                        />
                      </td>
                      <td className="py-3 px-3">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.5"
                          value={currentGrades.final ?? ''}
                          onChange={(e) => handleGradeChange(student.enrollmentId, 'final', e.target.value)}
                          className="input w-full text-center"
                          placeholder="-"
                        />
                      </td>
                      <td className="py-3 px-3">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.5"
                          value={currentGrades.homework ?? ''}
                          onChange={(e) => handleGradeChange(student.enrollmentId, 'homework', e.target.value)}
                          className="input w-full text-center"
                          placeholder="-"
                        />
                      </td>
                      <td className="py-3 px-3 text-center">
                        {currentGrades.midterm !== null && currentGrades.final !== null ? (
                          <span className="font-medium">
                            {((currentGrades.midterm * 0.3) + (currentGrades.final * 0.5) + ((currentGrades.homework || 0) * 0.2)).toFixed(1)}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${previewLetter === '-' ? 'bg-primary-50 text-gray-600 dark:text-gray-300' :
                          ['AA', 'BA'].includes(previewLetter) ? 'bg-green-500/20 text-green-400' :
                            ['BB', 'CB'].includes(previewLetter) ? 'bg-emerald-500/20 text-emerald-400' :
                              ['CC', 'DC'].includes(previewLetter) ? 'bg-amber-500/20 text-amber-400' :
                                ['DD', 'FD'].includes(previewLetter) ? 'bg-orange-500/20 text-orange-400' :
                                  'bg-red-500/20 text-red-400'
                          }`}>
                          {previewLetter}
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

      {/* Grade Scale Reference */}
      <div className="card mt-8">
        <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
          <FiBook className="w-5 h-5 text-primary-400" />
          Harf Notu Skalası
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { grade: 'AA', range: '90-100', point: '4.00', color: 'green' },
            { grade: 'BA', range: '85-89', point: '3.50', color: 'green' },
            { grade: 'BB', range: '80-84', point: '3.00', color: 'emerald' },
            { grade: 'CB', range: '75-79', point: '2.50', color: 'emerald' },
            { grade: 'CC', range: '70-74', point: '2.00', color: 'amber' },
            { grade: 'DC', range: '65-69', point: '1.50', color: 'amber' },
            { grade: 'DD', range: '60-64', point: '1.00', color: 'orange' },
            { grade: 'FD', range: '50-59', point: '0.50', color: 'orange' },
            { grade: 'FF', range: '0-49', point: '0.00', color: 'red' },
          ].map((item) => (
            <div
              key={item.grade}
              className={`p-3 rounded-xl bg-${item.color}-500/10 border border-${item.color}-500/30`}
            >
              <div className={`text-lg font-bold text-${item.color}-400`}>{item.grade}</div>
              <div className="text-xs text-gray-600 dark:text-gray-300">{item.range}</div>
              <div className="text-xs text-gray-700 dark:text-gray-200">{item.point}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GradebookPage;






