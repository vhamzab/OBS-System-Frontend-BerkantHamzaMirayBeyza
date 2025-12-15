import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiFileText, FiCheck, FiX, FiClock, FiUser, 
  FiCalendar, FiFile, FiMessageCircle, FiFilter
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import attendanceService from '../../services/attendanceService';
import { getFileUrl } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

const ExcuseRequestsPage = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [filter, setFilter] = useState('pending');
  const [showNoteModal, setShowNoteModal] = useState(null);
  const [note, setNote] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  const isFaculty = user?.role === 'faculty' || user?.role === 'admin';

  useEffect(() => {
    fetchRequests();
  }, [filter, pagination.page]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      
      let response;
      if (isFaculty) {
        response = await attendanceService.getExcuseRequests({
          status: filter === 'all' ? undefined : filter,
          page: pagination.page,
        });
      } else {
        response = await attendanceService.getMyExcuseRequests();
      }
      
      if (response.success) {
        setRequests(isFaculty ? response.data.requests : response.data);
        if (response.data.pagination) {
          setPagination((prev) => ({
            ...prev,
            totalPages: response.data.pagination.totalPages,
          }));
        }
      }
    } catch (error) {
      toast.error('Talepler yüklenirken hata oluştu');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      setProcessing(id);
      const response = await attendanceService.approveExcuseRequest(id, note);
      
      if (response.success) {
        toast.success('Mazeret onaylandı');
        setShowNoteModal(null);
        setNote('');
        fetchRequests();
      }
    } catch (error) {
      toast.error('İşlem sırasında hata oluştu');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (id) => {
    try {
      setProcessing(id);
      const response = await attendanceService.rejectExcuseRequest(id, note);
      
      if (response.success) {
        toast.success('Mazeret reddedildi');
        setShowNoteModal(null);
        setNote('');
        fetchRequests();
      }
    } catch (error) {
      toast.error('İşlem sırasında hata oluştu');
    } finally {
      setProcessing(null);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'approved':
        return { color: 'text-green-400', bg: 'bg-green-500/20', label: 'Onaylandı', icon: FiCheck };
      case 'rejected':
        return { color: 'text-red-400', bg: 'bg-red-500/20', label: 'Reddedildi', icon: FiX };
      default:
        return { color: 'text-amber-400', bg: 'bg-amber-500/20', label: 'Beklemede', icon: FiClock };
    }
  };

  const getExcuseTypeLabel = (type) => {
    const types = {
      medical: 'Sağlık',
      family_emergency: 'Aile Acili',
      official: 'Resmi İşlem',
      other: 'Diğer',
    };
    return types[type] || type;
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
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-2">
          {isFaculty ? 'Mazeret Talepleri' : 'Mazeret Taleplerim'}
        </h1>
        <p className="text-slate-400">
          {isFaculty 
            ? 'Öğrencilerin mazeret taleplerini inceleyin' 
            : 'Gönderdiğiniz mazeret taleplerini görüntüleyin'}
        </p>
      </div>

      {/* Filter (Faculty only) */}
      {isFaculty && (
        <div className="flex items-center gap-2 mb-6">
          <FiFilter className="w-4 h-4 text-slate-400" />
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="input"
          >
            <option value="pending">Beklemede</option>
            <option value="approved">Onaylananlar</option>
            <option value="rejected">Reddedilenler</option>
            <option value="all">Tümü</option>
          </select>
        </div>
      )}

      {/* Requests List */}
      {requests.length === 0 ? (
        <div className="card text-center py-16">
          <FiFileText className="w-16 h-16 mx-auto text-slate-600 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Talep Bulunamadı</h2>
          <p className="text-slate-400">
            {isFaculty ? 'Bekleyen mazeret talebi bulunmuyor.' : 'Henüz mazeret talebiniz bulunmuyor.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => {
            const statusConfig = getStatusConfig(request.status);
            const StatusIcon = statusConfig.icon;
            
            return (
              <div key={request.id} className="card">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Request Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl ${statusConfig.bg} flex items-center justify-center shrink-0`}>
                        <StatusIcon className={`w-6 h-6 ${statusConfig.color}`} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{request.course?.code}</span>
                          <span className="px-2 py-0.5 rounded bg-slate-700 text-xs">
                            {getExcuseTypeLabel(request.excuseType)}
                          </span>
                          <span className={`px-2 py-0.5 rounded ${statusConfig.bg} ${statusConfig.color} text-xs`}>
                            {statusConfig.label}
                          </span>
                        </div>
                        <div className="text-sm text-slate-400">{request.course?.name}</div>
                        
                        {isFaculty && request.student && (
                          <div className="flex items-center gap-2 mt-2 text-sm text-slate-400">
                            <FiUser className="w-4 h-4" />
                            {request.student.name} ({request.student.studentNumber})
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <FiCalendar className="w-4 h-4" />
                            {new Date(request.sessionDate).toLocaleDateString('tr-TR')}
                          </span>
                          <span className="flex items-center gap-1">
                            <FiClock className="w-4 h-4" />
                            {new Date(request.createdAt).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Reason */}
                    <div className="mt-4 p-3 rounded-lg bg-slate-800/50">
                      <div className="text-sm text-slate-400 mb-1">Açıklama:</div>
                      <div className="text-sm">{request.reason}</div>
                    </div>
                    
                    {/* Document */}
                    {request.documentUrl && (
                      <a
                        href={getFileUrl(request.documentUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mt-3 text-sm text-primary-400 hover:text-primary-300"
                      >
                        <FiFile className="w-4 h-4" />
                        Belgeyi Görüntüle
                      </a>
                    )}
                    
                    {/* Notes */}
                    {request.notes && (
                      <div className="mt-3 p-3 rounded-lg bg-primary-500/10 border border-primary-500/30">
                        <div className="text-xs text-primary-400 mb-1">Öğretim Üyesi Notu:</div>
                        <div className="text-sm">{request.notes}</div>
                      </div>
                    )}
                  </div>

                  {/* Actions (Faculty only, pending requests) */}
                  {isFaculty && request.status === 'pending' && (
                    <div className="flex gap-2 lg:flex-col">
                      <button
                        onClick={() => setShowNoteModal({ id: request.id, action: 'approve' })}
                        disabled={processing === request.id}
                        className="btn bg-green-500 hover:bg-green-600 text-white flex-1"
                      >
                        <FiCheck className="w-4 h-4 mr-1" />
                        Onayla
                      </button>
                      <button
                        onClick={() => setShowNoteModal({ id: request.id, action: 'reject' })}
                        disabled={processing === request.id}
                        className="btn bg-red-500 hover:bg-red-600 text-white flex-1"
                      >
                        <FiX className="w-4 h-4 mr-1" />
                        Reddet
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page === 1}
            className="btn btn-secondary"
          >
            Önceki
          </button>
          <span className="px-4 py-2 text-slate-400">
            Sayfa {pagination.page} / {pagination.totalPages}
          </span>
          <button
            onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page === pagination.totalPages}
            className="btn btn-secondary"
          >
            Sonraki
          </button>
        </div>
      )}

      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card max-w-md mx-4 w-full">
            <h3 className="font-display text-xl font-semibold mb-4">
              {showNoteModal.action === 'approve' ? 'Mazereti Onayla' : 'Mazereti Reddet'}
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Not (Opsiyonel)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="input w-full"
                placeholder="Öğrenciye iletilecek not..."
              />
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowNoteModal(null);
                  setNote('');
                }}
                className="btn btn-secondary"
                disabled={processing}
              >
                İptal
              </button>
              <button
                onClick={() => {
                  if (showNoteModal.action === 'approve') {
                    handleApprove(showNoteModal.id);
                  } else {
                    handleReject(showNoteModal.id);
                  }
                }}
                className={`btn ${
                  showNoteModal.action === 'approve' 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-red-500 hover:bg-red-600'
                } text-white`}
                disabled={processing}
              >
                {processing ? (
                  <LoadingSpinner size="sm" />
                ) : showNoteModal.action === 'approve' ? (
                  'Onayla'
                ) : (
                  'Reddet'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExcuseRequestsPage;


