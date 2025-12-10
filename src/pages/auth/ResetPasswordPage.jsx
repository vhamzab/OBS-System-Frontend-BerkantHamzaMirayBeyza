import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { FiLock, FiCheck } from 'react-icons/fi';
import authService from '../../services/authService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const validationSchema = Yup.object({
  password: Yup.string()
    .min(8, 'Şifre en az 8 karakter olmalıdır')
    .matches(/[A-Z]/, 'Şifre en az bir büyük harf içermelidir')
    .matches(/[a-z]/, 'Şifre en az bir küçük harf içermelidir')
    .matches(/[0-9]/, 'Şifre en az bir rakam içermelidir')
    .required('Şifre zorunludur'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Şifreler eşleşmiyor')
    .required('Şifre tekrarı zorunludur'),
});

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      toast.error('Geçersiz token. Lütfen şifre sıfırlama sayfasından tekrar deneyin.');
      navigate('/forgot-password');
    }
  }, [searchParams, navigate]);

  const formik = useFormik({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await authService.resetPassword(token, values.password, values.confirmPassword);
        setSuccess(true);
        toast.success('Şifreniz başarıyla sıfırlandı');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (error) {
        const message = error.response?.data?.message || 'Şifre sıfırlanırken bir hata oluştu';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
  });

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="card text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiCheck className="w-8 h-8 text-green-500" />
            </div>
            <h1 className="font-display text-2xl font-bold mb-4">
              Şifre Sıfırlandı
            </h1>
            <p className="text-slate-400 mb-6">
              Şifreniz başarıyla sıfırlandı. Yeni şifrenizle giriş yapabilirsiniz.
            </p>
            <p className="text-sm text-slate-500">
              3 saniye içinde giriş sayfasına yönlendirileceksiniz...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-500/20 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/25">
              <span className="text-white font-bold text-2xl">Ü</span>
            </div>
          </Link>
          <h1 className="font-display text-3xl font-bold mb-2">
            Yeni Şifre Belirle
          </h1>
          <p className="text-slate-400">
            Hesabınız için yeni bir şifre belirleyin
          </p>
        </div>

        {/* Form */}
        <div className="card">
          <form onSubmit={formik.handleSubmit} className="space-y-5">
            <Input
              label="Yeni Şifre"
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

            <Input
              label="Yeni Şifre Tekrar"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              icon={FiLock}
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.confirmPassword}
              touched={formik.touched.confirmPassword}
              required
            />

            <div className="p-3 bg-slate-800/50 rounded-lg">
              <p className="text-xs text-slate-400 font-medium mb-2">Şifre gereksinimleri:</p>
              <ul className="text-xs text-slate-500 space-y-1">
                <li className={formik.values.password.length >= 8 ? 'text-green-400' : ''}>
                  • En az 8 karakter
                </li>
                <li className={/[A-Z]/.test(formik.values.password) ? 'text-green-400' : ''}>
                  • En az bir büyük harf
                </li>
                <li className={/[a-z]/.test(formik.values.password) ? 'text-green-400' : ''}>
                  • En az bir küçük harf
                </li>
                <li className={/[0-9]/.test(formik.values.password) ? 'text-green-400' : ''}>
                  • En az bir rakam
                </li>
              </ul>
            </div>

            <Button type="submit" loading={loading} fullWidth>
              Şifreyi Sıfırla
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

