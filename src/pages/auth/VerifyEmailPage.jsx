import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiCheck, FiX } from 'react-icons/fi';

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('success'); // success, error
  const [message, setMessage] = useState('E-posta doğrulama süreci kaldırıldı. Doğrudan giriş yapabilirsiniz.');

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="card text-center">
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

