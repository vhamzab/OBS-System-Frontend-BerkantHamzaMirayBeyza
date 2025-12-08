import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { FiMail, FiArrowLeft, FiCheck } from 'react-icons/fi';
import authService from '../../services/authService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Geçerli bir e-posta adresi giriniz')
    .required('E-posta adresi zorunludur'),
});

const ForgotPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await authService.forgotPassword(values.email);
        setSubmitted(true);
        toast.success('Şifre sıfırlama bağlantısı gönderildi');
      } catch (error) {
        // Still show success to prevent email enumeration
        setSubmitted(true);
      } finally {
        setLoading(false);
      }
    },
  });

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="card text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiCheck className="w-8 h-8 text-green-500" />
            </div>
            <h1 className="font-display text-2xl font-bold mb-4">
              E-posta Gönderildi
            </h1>
            <p className="text-slate-400 mb-6">
              Eğer <span className="text-white">{formik.values.email}</span> adresi sistemimizde kayıtlıysa, şifre sıfırlama bağlantısı gönderildi.
            </p>
            <p className="text-sm text-slate-500 mb-6">
              E-postanız birkaç dakika içinde gelecektir. Spam klasörünüzü de kontrol etmeyi unutmayın.
            </p>
            <Link to="/login" className="btn-secondary inline-flex items-center gap-2">
              <FiArrowLeft className="w-4 h-4" />
              Giriş sayfasına dön
            </Link>
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
            Şifremi Unuttum
          </h1>
          <p className="text-slate-400">
            E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim
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

            <Button type="submit" loading={loading} fullWidth>
              Sıfırlama Bağlantısı Gönder
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
              <FiArrowLeft className="w-4 h-4" />
              Giriş sayfasına dön
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

