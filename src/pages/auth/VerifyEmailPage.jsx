import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FiCheck, FiX, FiLoader } from 'react-icons/fi';
import authService from '../../services/authService';

const VerifyEmailPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await authService.verifyEmail(token);
        setStatus('success');
        setMessage(response.message || 'E-posta adresiniz başarıyla doğrulandı');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Doğrulama işlemi başarısız oldu');
      }
    };

    if (token) {
      verifyEmail();
    } else {
      setStatus('error');
      setMessage('Geçersiz doğrulama bağlantısı');
    }
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="card text-center">
          {status === 'loading' && (
            <>
              <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiLoader className="w-8 h-8 text-primary-500 animate-spin" />
              </div>
              <h1 className="font-display text-2xl font-bold mb-4">
                E-posta Doğrulanıyor
              </h1>
              <p className="text-slate-400">
                Lütfen bekleyin, e-posta adresiniz doğrulanıyor...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiCheck className="w-8 h-8 text-green-500" />
              </div>
              <h1 className="font-display text-2xl font-bold mb-4">
                Doğrulama Başarılı
              </h1>
              <p className="text-slate-400 mb-6">{message}</p>
              <p className="text-sm text-slate-500">
                3 saniye içinde giriş sayfasına yönlendirileceksiniz...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiX className="w-8 h-8 text-red-500" />
              </div>
              <h1 className="font-display text-2xl font-bold mb-4">
                Doğrulama Başarısız
              </h1>
              <p className="text-slate-400 mb-6">{message}</p>
              <Link to="/login" className="btn-primary inline-block">
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

