import { useState, useEffect } from 'react';
import { 
  FiCheck, FiX, FiUser, FiBook, FiCalendar, 
  FiMail, FiClock, FiCheckCircle, FiAlertCircle,
  FiUsers, FiFilter
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import enrollmentService from '../../services/enrollmentService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const EnrollmentApprovalsPage = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});
  const [showRejectModal, setShowRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedEnrollments, setSelectedEnrollments] = useState([]);
  const [filterCourse, setFilterCourse] = useState('all');

  const semesterNames = {
    fall: 'Güz',
    spring: 'Bahar',
    summer: 'Yaz',
  };

  useEffect(() => {
    fetchPendingEnrollments();
  }, []);

  const fetchPendingEnrollments = async () => {
    try {
      setLoading(true);
      console.log('📋 EnrollmentApprovalsPage: Fetching pending enrollments...');
      const response = await enrollmentService.getPendingEnrollments();
      console.log('✅ EnrollmentApprovalsPage: Pending enrollments fetched:', response);
      
      if (response.success) {
        setEnrollments(response.data || []);
        console.log(`✅ EnrollmentApprovalsPage: ${response.data?.length || 0} pending enrollments loaded`);
      } else {
        console.warn('⚠️ EnrollmentApprovalsPage: Response not successful:', response);
        toast.error(response.message || 'Bekleyen kayıtlar yüklenirken hata oluştu');
      }
    } catch (error) {
      console.error('❌ EnrollmentApprovalsPage: Fetch error:', error);
      toast.error(error.response?.data?.message || 'Bekleyen kayıtlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (enrollmentId) => {
    try {
      setProcessing((prev) => ({ ...prev, [enrollmentId]: 'approving' }));
      console.log('✅ EnrollmentApprovalsPage: Approving enrollment:', enrollmentId);
      
      const response = await enrollmentService.approveEnrollment(enrollmentId);
      
      if (response.success) {
        toast.success(response.message || 'Kayıt onaylandı');
        setEnrollments((prev) => prev.filter((e) => e.id !== enrollmentId));
        setSelectedEnrollments((prev) => prev.filter((id) => id !== enrollmentId));
      } else {
        toast.error(response.message || 'Kayıt onaylanırken hata oluştu');
      }
    } catch (error) {
      console.error('❌ EnrollmentApprovalsPage: Approve error:', error);
      toast.error(error.response?.data?.message || 'Kayıt onaylanırken hata oluştu');
    } finally {
      setProcessing((prev) => ({ ...prev, [enrollmentId]: null }));
    }
  };

  const handleReject = async (enrollmentId) => {
    try {
      setProcessing((prev) => ({ ...prev, [enrollmentId]: 'rejecting' }));
      console.log('❌ EnrollmentApprovalsPage: Rejecting enrollment:', enrollmentId);
      
      const response = await enrollmentService.rejectEnrollment(enrollmentId, rejectReason);
      
      if (response.success) {
        toast.success(response.message || 'Kayıt reddedildi');
        setEnrollments((prev) => prev.filter((e) => e.id !== enrollmentId));
        setSelectedEnrollments((prev) => prev.filter((id) => id !== enrollmentId));
        setShowRejectModal(null);
        setRejectReason('');
      } else {
        toast.error(response.message || 'Kayıt reddedilirken hata oluştu');
      }
    } catch (error) {
      console.error('❌ EnrollmentApprovalsPage: Reject error:', error);
      toast.error(error.response?.data?.message || 'Kayıt reddedilirken hata oluştu');
    } finally {
      setProcessing((prev) => ({ ...prev, [enrollmentId]: null }));
    }
  };

  const handleBulkApprove = async () => {
    if (selectedEnrollments.length === 0) {
      toast.error('Lütfen onaylanacak kayıtları seçin');
      return;
    }

    try {
      setProcessing((prev) => ({ ...prev, bulk: true }));
      console.log('✅ EnrollmentApprovalsPage: Bulk approving:', selectedEnrollments);
      
      const response = await enrollmentService.approveAllEnrollments(selectedEnrollments);
      
      if (response.success) {
        toast.success(response.message || 'Seçili kayıtlar onaylandı');
        setEnrollments((prev) => prev.filter((e) => !selectedEnrollments.includes(e.id)));
        setSelectedEnrollments([]);
      } else {
        toast.error(response.message || 'Toplu onay sırasında hata oluştu');
      }
    } catch (error) {
      console.error('❌ EnrollmentApprovalsPage: Bulk approve error:', error);
      toast.error(error.response?.data?.message || 'Toplu onay sırasında hata oluştu');
    } finally {
      setProcessing((prev) => ({ ...prev, bulk: false }));
    }
  };

  const toggleSelectEnrollment = (enrollmentId) => {
    setSelectedEnrollments((prev) =>
      prev.includes(enrollmentId)
        ? prev.filter((id) => id !== enrollmentId)
        : [...prev, enrollmentId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedEnrollments.length === filteredEnrollments.length) {
      setSelectedEnrollments([]);
    } else {
      setSelectedEnrollments(filteredEnrollments.map((e) => e.id));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get unique courses for filter
  const uniqueCourses = [...new Map(enrollments.map((e) => [e.course.code, e.course])).values()];

  // Filter enrollments by course
  const filteredEnrollments = filterCourse === 'all'
    ? enrollments
    : enrollments.filter((e) => e.course.code === filterCourse);

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
          <h1 className="font-display text-3xl font-bold mb-2">Ders Kayıt Onayları</h1>
          <p className="text-slate-400">
            Öğrencilerin ders kayıt taleplerini onaylayın veya reddedin
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Course Filter */}
          {uniqueCourses.length > 1 && (
            <div className="flex items-center gap-2">
              <FiFilter className="w-4 h-4 text-slate-400" />
              <select
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                className="input text-white text-sm"
                style={{ color: '#ffffff' }}
              >
                <option value="all" style={{ color: '#ffffff', backgroundColor: '#0f172a' }}>
                  Tüm Dersler
                </option>
                {uniqueCourses.map((course) => (
                  <option 
                    key={course.code} 
                    value={course.code}
                    style={{ color: '#ffffff', backgroundColor: '#0f172a' }}
                  >
                    {course.code} - {course.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Bulk Actions */}
          {selectedEnrollments.length > 0 && (
            <button
              onClick={handleBulkApprove}
              disabled={processing.bulk}
              className="btn btn-primary"
            >
              {processing.bulk ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <FiCheckCircle className="w-4 h-4 mr-2" />
                  Seçilenleri Onayla ({selectedEnrollments.length})
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <FiClock className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-400">{enrollments.length}</div>
              <div className="text-sm text-slate-400">Bekleyen Kayıt</div>
            </div>
          </div>
        </div>
        
        <div className="card bg-gradient-to-br from-primary-500/10 to-blue-500/10 border-primary-500/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
              <FiBook className="w-6 h-6 text-primary-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-primary-400">{uniqueCourses.length}</div>
              <div className="text-sm text-slate-400">Farklı Ders</div>
            </div>
          </div>
        </div>
        
        <div className="card bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <FiUsers className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-400">{selectedEnrollments.length}</div>
              <div className="text-sm text-slate-400">Seçili Kayıt</div>
            </div>
          </div>
        </div>
      </div>

      {/* Enrollments List */}
      {filteredEnrollments.length === 0 ? (
        <div className="card text-center py-16">
          <FiCheckCircle className="w-16 h-16 mx-auto text-emerald-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Bekleyen Kayıt Yok</h2>
          <p className="text-slate-400">
            {enrollments.length === 0
              ? 'Şu anda onaylanacak ders kaydı bulunmuyor.'
              : 'Seçili filtreye uygun bekleyen kayıt yok.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Select All Header */}
          <div className="card bg-slate-800/30 py-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedEnrollments.length === filteredEnrollments.length}
                onChange={toggleSelectAll}
                className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-primary-500 focus:ring-primary-500 focus:ring-offset-slate-800"
              />
              <span className="text-sm text-slate-400">
                {selectedEnrollments.length === filteredEnrollments.length
                  ? 'Tümünün seçimini kaldır'
                  : 'Tümünü seç'}
              </span>
            </label>
          </div>

          {/* Enrollment Cards */}
          {filteredEnrollments.map((enrollment) => {
            const isSelected = selectedEnrollments.includes(enrollment.id);
            const isProcessing = processing[enrollment.id];

            return (
              <div
                key={enrollment.id}
                className={`card transition-all duration-200 ${
                  isSelected ? 'ring-2 ring-primary-500 bg-primary-500/5' : ''
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Checkbox */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectEnrollment(enrollment.id)}
                      className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-primary-500 focus:ring-primary-500 focus:ring-offset-slate-800"
                    />
                  </div>

                  {/* Student Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center shrink-0">
                        <FiUser className="w-6 h-6 text-primary-400" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-display text-lg font-semibold">
                            {enrollment.student.firstName} {enrollment.student.lastName}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-700 text-xs font-medium">
                            {enrollment.student.studentNumber}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                          <span className="flex items-center gap-1">
                            <FiMail className="w-4 h-4" />
                            {enrollment.student.email}
                          </span>
                          {enrollment.student.department && (
                            <span className="flex items-center gap-1">
                              <FiBook className="w-4 h-4" />
                              {enrollment.student.department}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Course Info */}
                  <div className="lg:w-64 px-4 py-3 rounded-xl bg-slate-800/50">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded bg-primary-500/20 text-primary-400 text-xs font-medium">
                        {enrollment.course.code}
                      </span>
                      <span className="text-xs text-slate-500">
                        Section {enrollment.section.sectionNumber}
                      </span>
                    </div>
                    <div className="font-medium text-sm">{enrollment.course.name}</div>
                    <div className="text-xs text-slate-400 mt-1">
                      {semesterNames[enrollment.section.semester]} {enrollment.section.year} • {enrollment.course.credits} Kredi
                    </div>
                  </div>

                  {/* Date */}
                  <div className="lg:w-40 text-sm">
                    <div className="flex items-center gap-2 text-slate-400">
                      <FiCalendar className="w-4 h-4" />
                      <span>{formatDate(enrollment.createdAt)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApprove(enrollment.id)}
                      disabled={isProcessing}
                      className="btn bg-emerald-500 hover:bg-emerald-600 text-white px-4"
                      title="Onayla"
                    >
                      {isProcessing === 'approving' ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <FiCheck className="w-4 h-4 mr-1" />
                          Onayla
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => setShowRejectModal(enrollment.id)}
                      disabled={isProcessing}
                      className="btn bg-red-500/10 text-red-400 hover:bg-red-500/20 px-4"
                      title="Reddet"
                    >
                      {isProcessing === 'rejecting' ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <FiX className="w-4 h-4 mr-1" />
                          Reddet
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card max-w-md mx-4 w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                <FiAlertCircle className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="font-display text-xl font-semibold">Kaydı Reddet</h3>
            </div>
            
            <p className="text-slate-400 mb-4">
              Bu ders kaydını reddetmek istediğinizden emin misiniz?
            </p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Red Sebebi (Opsiyonel)
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Öğrenciye gösterilecek red sebebini yazın..."
                className="input w-full h-24 resize-none"
                style={{ color: '#ffffff' }}
              />
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowRejectModal(null);
                  setRejectReason('');
                }}
                className="btn btn-secondary"
                disabled={processing[showRejectModal]}
              >
                İptal
              </button>
              <button
                onClick={() => handleReject(showRejectModal)}
                className="btn bg-red-500 hover:bg-red-600 text-white"
                disabled={processing[showRejectModal]}
              >
                {processing[showRejectModal] ? <LoadingSpinner size="sm" /> : 'Reddet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnrollmentApprovalsPage;

