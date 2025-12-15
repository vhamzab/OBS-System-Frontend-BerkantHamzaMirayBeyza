import { Link } from 'react-router-dom';
import { FiHome, FiArrowLeft } from 'react-icons/fi';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
      </div>

      <div className="text-center relative">
        {/* 404 Number */}
        <h1 className="font-display text-[150px] sm:text-[200px] font-bold leading-none gradient-text mb-4">
          404
        </h1>

        {/* Message */}
        <h2 className="font-display text-2xl sm:text-3xl font-bold mb-4 text-gray-800">
          Sayfa Bulunamadı
        </h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Aradığınız sayfa mevcut değil veya taşınmış olabilir. 
          Ana sayfaya dönerek devam edebilirsiniz.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            <FiHome className="w-5 h-5" />
            Ana Sayfaya Git
          </Link>
          <button
            onClick={() => window.history.back()}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <FiArrowLeft className="w-5 h-5" />
            Geri Dön
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;

