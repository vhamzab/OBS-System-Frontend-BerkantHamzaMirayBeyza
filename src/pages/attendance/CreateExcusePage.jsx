import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiFileText, FiUpload, FiX, FiCalendar, FiBook } from 'react-icons/fi';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import attendanceService from '../../services/attendanceService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';

const validationSchema = Yup.object({
  session_id: Yup.string().required('Yoklama oturumu seçilmelidir'),
  reason: Yup.string()
    .required('Mazeret nedeni zorunludur')
    .min(10, 'Mazeret nedeni en az 10 karakter olmalıdır'),
  excuse_type: Yup.string()
    .oneOf(['medical', 'family_emergency', 'official', 'other'], 'Geçerli bir mazeret tipi seçiniz')
    .required('Mazeret tipi zorunludur'),
});

const CreateExcusePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sectionId = searchParams.get('section');
  
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchSessions();
  }, [sectionId]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      
      // Get all sessions for student
      const sessionsRes = await attendanceService.getMySessions();
      if (!sessionsRes.success) {
        toast.error('Oturumlar yüklenirken hata oluştu');
        return;
      }

      let allSessions = sessionsRes.data || [];
      
      // Filter by section if provided
      if (sectionId) {
        allSessions = allSessions.filter(s => s.section?.id === sectionId);
      }

      // Filter out sessions that already have approved excuse requests
      allSessions = allSessions.filter(s => 
        !s.hasExcuseRequest || s.excuseRequestStatus !== 'approved'
      );

      setSessions(allSessions);
    } catch (error) {
      console.error('Fetch sessions error:', error);
      toast.error('Oturumlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      session_id: '',
      reason: '',
      excuse_type: 'other',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setSubmitting(true);
        
        const response = await attendanceService.createExcuseRequest(
          values.session_id,
          values.reason,
          values.excuse_type,
          selectedFile
        );

        if (response.success) {
          toast.success('Mazeret talebi başarıyla oluşturuldu');
          navigate('/my-excuse-requests');
        } else {
          toast.error(response.message || 'Mazeret talebi oluşturulurken hata oluştu');
        }
      } catch (error) {
        console.error('Create excuse error:', error);
        toast.error(error.response?.data?.message || 'Mazeret talebi oluşturulurken hata oluştu');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const excuseTypes = [
    { value: 'medical', label: 'Sağlık' },
    { value: 'family_emergency', label: 'Aile Acili' },
    { value: 'official', label: 'Resmi İşlem' },
    { value: 'other', label: 'Diğer' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-2">Mazeret Talebi Oluştur</h1>
        <p className="text-slate-400">Devamsızlığınız için mazeret talebi gönderin</p>
      </div>

      <form onSubmit={formik.handleSubmit} className="card space-y-6">
        {/* Session Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Yoklama Oturumu <span className="text-red-400">*</span>
          </label>
          <select
            name="session_id"
            value={formik.values.session_id}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`input w-full text-white ${formik.errors.session_id && formik.touched.session_id ? 'border-red-500' : ''}`}
            style={{ color: formik.values.session_id ? '#ffffff' : '#64748b' }}
          >
            <option value="" style={{ color: '#64748b', backgroundColor: '#0f172a' }}>Yoklama oturumu seçiniz</option>
            {sessions.map((session) => (
              <option key={session.id} value={session.id} style={{ color: '#ffffff', backgroundColor: '#0f172a' }}>
                {session.course?.code} - {session.course?.name} - {new Date(session.date).toLocaleDateString('tr-TR')} {session.start_time}
              </option>
            ))}
          </select>
          {formik.errors.session_id && formik.touched.session_id && (
            <p className="text-sm text-red-400 mt-1">{formik.errors.session_id}</p>
          )}
          {sessions.length === 0 && (
            <p className="text-sm text-amber-400 mt-2">
              Bu ders için yoklama oturumu bulunamadı.
            </p>
          )}
        </div>

        {/* Excuse Type */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Mazeret Tipi <span className="text-red-400">*</span>
          </label>
          <select
            name="excuse_type"
            value={formik.values.excuse_type}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`input w-full text-white ${formik.errors.excuse_type && formik.touched.excuse_type ? 'border-red-500' : ''}`}
            style={{ color: '#ffffff' }}
          >
            {excuseTypes.map((type) => (
              <option key={type.value} value={type.value} style={{ color: '#ffffff', backgroundColor: '#0f172a' }}>
                {type.label}
              </option>
            ))}
          </select>
          {formik.errors.excuse_type && formik.touched.excuse_type && (
            <p className="text-sm text-red-400 mt-1">{formik.errors.excuse_type}</p>
          )}
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Mazeret Nedeni <span className="text-red-400">*</span>
          </label>
          <textarea
            name="reason"
            value={formik.values.reason}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            rows={5}
            className={`input w-full text-white placeholder:text-slate-500 ${formik.errors.reason && formik.touched.reason ? 'border-red-500' : ''}`}
            placeholder="Mazeret nedeninizi detaylı olarak açıklayın..."
          />
          {formik.errors.reason && formik.touched.reason && (
            <p className="text-sm text-red-400 mt-1">{formik.errors.reason}</p>
          )}
        </div>

        {/* Document Upload */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Destekleyici Belge (Opsiyonel)
          </label>
          <div className="flex items-center gap-4">
            <label className="flex-1 cursor-pointer">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="hidden"
              />
              <div className="flex items-center gap-2 p-3 rounded-lg border border-slate-600 hover:border-primary-500 transition-colors">
                <FiUpload className="w-5 h-5 text-slate-400" />
                <span className="text-sm text-slate-400">
                  {selectedFile ? selectedFile.name : 'Belge seçiniz (PDF, JPG, PNG)'}
                </span>
              </div>
            </label>
            {selectedFile && (
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="p-2 text-red-400 hover:text-red-300"
              >
                <FiX className="w-5 h-5" />
              </button>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Maksimum dosya boyutu: 5MB. Destekleyici belge yüklemek talebinizin onaylanma şansını artırır.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t border-slate-700">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(-1)}
            disabled={submitting}
          >
            İptal
          </Button>
          <Button
            type="submit"
            loading={submitting}
            disabled={sessions.length === 0}
          >
            Talep Gönder
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateExcusePage;

