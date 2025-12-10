import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { FiMail, FiLock } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Geçerli bir e-posta adresi giriniz')
    .required('E-posta adresi zorunludur'),
  password: Yup.string()
    .required('Şifre zorunludur'),
});

const LoginPage = () => {
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
        const response = await login(values.email, values.password);
        
        if (response.success) {
          toast.success('Giriş başarılı!');
          navigate(from, { replace: true });
        }
      } catch (error) {
        const message = error.response?.data?.message || 'Giriş yapılırken bir hata oluştu';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
  });

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
            Tekrar Hoş Geldiniz
          </h1>
          <p className="text-slate-400">
            Hesabınıza giriş yapın
          </p>
        </div>

        {/* Form */}
        <div className="card">
          <form onSubmit={formik.handleSubmit} className="space-y-5">
            <Input
              label="E-posta Adresi"
              name="email"
              type="email"
              placeholder="ornek@university.edu"
              icon={FiMail}
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.email}
              touched={formik.touched.email}
              required
            />

            <Input
              label="Şifre"
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
                  className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-primary-500 focus:ring-primary-500 focus:ring-offset-slate-900"
                />
                <span className="text-sm text-slate-400">Beni hatırla</span>
              </label>
              <Link to="/forgot-password" className="text-sm link">
                Şifremi unuttum
              </Link>
            </div>

            <Button type="submit" loading={loading} fullWidth>
              Giriş Yap
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-400">
              Hesabınız yok mu?{' '}
              <Link to="/register" className="link font-medium">
                Kayıt Ol
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;

