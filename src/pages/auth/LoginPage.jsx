import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { FiMail, FiLock } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

import { useTranslation } from 'react-i18next';
const validationSchema = Yup.object({
  email: Yup.string()
    .email('Geçerli bir e-posta adresi giriniz')
    .required('E-posta adresi zorunludur'),
  password: Yup.string()
    .required('Şifre zorunludur'),
});

const LoginPage = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        console.log('🔐 LoginPage: Starting login process');
        console.log('📧 Email:', values.email);
        console.log('🔑 Password length:', values.password.length);

        const response = await login(values.email, values.password);
        console.log('✅ LoginPage: Login response received:', response);

        if (response && response.success) {
          console.log('✅ LoginPage: Login successful, navigating...');
          toast.success('Giriş başarılı!');
          // Small delay to ensure state is updated
          setTimeout(() => {
            navigate(from, { replace: true });
          }, 100);
        } else {
          const errorMsg = response?.message || 'Giriş yapılırken bir hata oluştu';
          console.error('❌ LoginPage: Login failed:', errorMsg, response);
          toast.error(errorMsg);
        }
      } catch (error) {
        // Handle different error types
        console.error('❌ LoginPage: Login exception:', error);
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          config: error.config,
        });

        let message = 'Giriş yapılırken bir hata oluştu';
        if (error.message) {
          message = error.message;
        } else if (error.response?.data?.message) {
          message = error.response.data.message;
        } else if (error.response?.status === 401) {
          message = 'E-posta veya şifre hatalı';
        } else if (error.response?.status === 0 || !error.response) {
          message = 'Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.';
        }

        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-center bg-cover scale-105"
        style={{ backgroundImage: "url('/yeniArkaPLan.jpg')", filter: 'blur(2px)' }}
        aria-hidden="true"
      />

      {/* Gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/15 to-white/10 pointer-events-none" />

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <img
              src="/logo2.png"
              alt="Doğu Karadeniz Üniversitesi Logo"
              className="w-32 h-32 object-contain rounded-lg shadow-lg"
            />
          </Link>
          <h1 className="font-sans text-3xl font-normal mb-2 text-white drop-shadow-lg">{t('common.welcomeBack')}</h1>
          <p className="text-white/90 font-medium drop-shadow-md">
            Doğu Karadeniz Üniversitesi (DKÜ) hesabınıza giriş yapın
          </p>
        </div>

        {/* Form */}
        <div className="card rounded-3xl border border-gray-200/50 dark:border-gray-800/50 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary-500/10 to-accent-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="relative z-10">
            <form onSubmit={formik.handleSubmit} className="space-y-5">
            <Input
              label="E-posta Adresi"
              name="email"
              type="email"
              placeholder="ornek@dku.edu.tr"
              icon={FiMail}
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.email}
              touched={formik.touched.email}
              required
            />

            <Input
              label={t('auth.password')}
              name="password"
              type="password"
              placeholder="••••••••"
              icon={FiLock}
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.password}
              touched={formik.touched.password}
              required
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-primary-500 focus:ring-primary-500 focus:ring-offset-white dark:ring-offset-gray-900 dark:focus:ring-offset-gray-900"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">Beni hatırla</span>
              </label>
              <Link to="/forgot-password" className="text-sm link">
                Şifremi unuttum
              </Link>
            </div>

            <Button type="submit" loading={loading} fullWidth>{t('common.login')}</Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Hesabınız yok mu?{' '}
              <Link to="/register" className="link font-semibold hover:underline">{t('common.register')}</Link>
            </p>
          </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;

