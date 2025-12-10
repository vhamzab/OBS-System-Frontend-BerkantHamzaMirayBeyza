import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FiCheck, FiX, FiLoader, FiMail } from 'react-icons/fi';
import authService from '../../services/authService';

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Geçersiz doğrulama linki. Token bulunamadı.');
        return;
      }

      try {
        const response = await authService.verifyEmail(token);
        
        if (response.success) {
          setStatus('success');
          setMessage(response.message || 'E-posta adresiniz başarıyla doğrulandı!');
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(response.message || 'E-posta doğrulaması başarısız oldu.');
        }
      } catch (error) {
        setStatus('error');
        const errorMessage = error.response?.data?.message || 'E-posta doğrulaması sırasında bir hata oluştu.';
        setMessage(errorMessage);
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-accent-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="card text-center">
          {/* Loading State */}
          {status === 'loading' && (
            <>
              <div className="w-20 h-20 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiLoader className="w-10 h-10 text-primary-500 animate-spin" />
              </div>
              <h1 className="font-display text-2xl font-bold mb-4">
                E-posta Doğrulanıyor...
              </h1>
              <p className="text-slate-400">
                Lütfen bekleyin, e-posta adresiniz doğrulanıyor.
              </p>
            </>
          )}

          {/* Success State */}
          {status === 'success' && (
            <>
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiCheck className="w-10 h-10 text-green-500" />
              </div>
              <h1 className="font-display text-2xl font-bold mb-4 text-green-400">
                Doğrulama Başarılı! 🎉
              </h1>
              <p className="text-slate-400 mb-6">{message}</p>
              <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
                <p className="text-sm text-slate-300">
                  <span className="text-green-400 font-semibold">3 saniye</span> içinde giriş sayfasına yönlendirileceksiniz...
                </p>
              </div>
              <Link 
                to="/login" 
                className="btn-primary inline-flex items-center gap-2"
              >
                <FiCheck className="w-4 h-4" />
                Hemen Giriş Yap
              </Link>
            </>
          )}

          {/* Error State */}
          {status === 'error' && (
            <>
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiX className="w-10 h-10 text-red-500" />
              </div>
              <h1 className="font-display text-2xl font-bold mb-4 text-red-400">
                Doğrulama Başarısız
              </h1>
              <p className="text-slate-400 mb-6">{message}</p>
              
              <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
                <p className="text-sm text-slate-300 mb-2">
                  Doğrulama linkinizin süresi dolmuş olabilir.
                </p>
                <p className="text-xs text-slate-400">
                  Yeni bir doğrulama linki almak için giriş sayfasından talep edebilirsiniz.
                </p>
              </div>

              <Link 
                to="/login" 
                className="btn-primary inline-flex items-center justify-center gap-2"
              >
                <FiMail className="w-4 h-4" />
                Giriş Sayfasına Git
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
