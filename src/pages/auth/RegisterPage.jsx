import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiUser, FiHash } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';

import { useTranslation } from 'react-i18next';
import PasswordStrengthMeter from '../../components/common/PasswordStrengthMeter';

const validationSchema = Yup.object({
  firstName: Yup.string()
    .min(2, 'Ad en az 2 karakter olmalıdır')
    .required('Ad zorunludur'),
  lastName: Yup.string()
    .min(2, 'Soyad en az 2 karakter olmalıdır')
    .required('Soyad zorunludur'),
  email: Yup.string()
    .email('Geçerli bir e-posta adresi giriniz')
    .required('E-posta adresi zorunludur'),
  password: Yup.string()
    .min(8, 'Şifre en az 8 karakter olmalıdır')
    .matches(/[A-Z]/, 'Şifre en az bir büyük harf içermelidir')
    .matches(/[a-z]/, 'Şifre en az bir küçük harf içermelidir')
    .matches(/[0-9]/, 'Şifre en az bir rakam içermelidir')
    .required('Şifre zorunludur'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Şifreler eşleşmiyor')
    .required('Şifre tekrarı zorunludur'),
  role: Yup.string()
    .oneOf(['student', 'faculty'], 'Geçerli bir kullanıcı tipi seçiniz')
    .required('Kullanıcı tipi zorunludur'),
  studentNumber: Yup.string().when('role', {
    is: 'student',
    then: (schema) => schema
      .matches(/^[0-9]{8,12}$/, 'Geçerli bir öğrenci numarası giriniz')
      .required('Öğrenci numarası zorunludur'),
    otherwise: (schema) => schema,
  }),
  employeeNumber: Yup.string().when('role', {
    is: 'faculty',
    then: (schema) => schema
      .min(4, 'Personel numarası en az 4 karakter olmalıdır')
      .required('Personel numarası zorunludur'),
    otherwise: (schema) => schema,
  }),
  terms: Yup.boolean()
    .oneOf([true], 'Kullanım koşullarını kabul etmelisiniz'),
});

const RegisterPage = () => {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const roleOptions = [
    { value: 'student', label: t('roles.student') },
    { value: 'faculty', label: t('roles.faculty') },
  ];

  const titleOptions = [
    { value: 'professor', label: 'Profesör' },
    { value: 'associate_professor', label: 'Doçent' },
    { value: 'assistant_professor', label: 'Doktor Öğretim Üyesi' },
    { value: 'lecturer', label: 'Öğretim Görevlisi' },
    { value: 'research_assistant', label: 'Araştırma Görevlisi' },
  ];

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: '',
      studentNumber: '',
      employeeNumber: '',
      title: '',
      terms: false,
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const response = await register(values);
        
        if (response.success) {
          toast.success(response.message || 'Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
          navigate('/login');
        }
      } catch (error) {
        const message = error.response?.data?.message || 'Kayıt olurken bir hata oluştu';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-primary-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-lg relative">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <img 
              src="/logo2.png" 
              alt="Doğu Karadeniz Üniversitesi Logo" 
              className="w-32 h-32 object-contain rounded-lg shadow-lg"
            />
          </Link>
          <h1 className="font-sans text-3xl font-normal mb-2 text-gray-800 dark:text-gray-100">
            Hesap Oluşturun
          </h1>
          <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500">
            Doğu Karadeniz Üniversitesi (DKÜ) OBS'ye kayıt olun
          </p>
        </div>

        {/* Form */}
        <div className="card relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary-500/10 to-accent-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="relative z-10">
            <form onSubmit={formik.handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t('auth.firstName')}
                name="firstName"
                placeholder="Adınız"
                icon={FiUser}
                value={formik.values.firstName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.errors.firstName}
                touched={formik.touched.firstName}
                required
              />
              <Input
                label={t('auth.lastName')}
                name="lastName"
                placeholder="Soyadınız"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.errors.lastName}
                touched={formik.touched.lastName}
                required
              />
            </div>

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

            <div className="grid grid-cols-2 gap-4">
              <div>
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
                <PasswordStrengthMeter password={formik.values.password} />
              </div>
              <Input
                label={t('auth.confirmPassword')}
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.errors.confirmPassword}
                touched={formik.touched.confirmPassword}
                required
              />
            </div>

            <Select
              label="Kullanıcı Tipi"
              name="role"
              options={roleOptions}
              placeholder="Kullanıcı tipi seçiniz"
              value={formik.values.role}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.role}
              touched={formik.touched.role}
              required
            />

            {formik.values.role === 'student' && (
              <Input
                label={t('profile.studentNumber')}
                name="studentNumber"
                placeholder="20210001"
                icon={FiHash}
                value={formik.values.studentNumber}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.errors.studentNumber}
                touched={formik.touched.studentNumber}
                required
              />
            )}

            {formik.values.role === 'faculty' && (
              <>
                <Input
                  label="Personel Numarası"
                  name="employeeNumber"
                  placeholder="AK0001"
                  icon={FiHash}
                  value={formik.values.employeeNumber}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.errors.employeeNumber}
                  touched={formik.touched.employeeNumber}
                  required
                />
                <Select
                  label="Ünvan"
                  name="title"
                  options={titleOptions}
                  placeholder="Ünvan seçiniz"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </>
            )}

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="terms"
                checked={formik.values.terms}
                onChange={formik.handleChange}
                className="w-5 h-5 mt-0.5 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-primary-500 focus:ring-primary-500 focus:ring-offset-white dark:ring-offset-gray-900 dark:focus:ring-offset-gray-900"
              />
              <span className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
                <Link to="/terms" className="link">Kullanım koşullarını</Link> ve{' '}
                <Link to="/privacy" className="link">gizlilik politikasını</Link> okudum ve kabul ediyorum.
              </span>
            </label>
            {formik.touched.terms && formik.errors.terms && (
              <p className="error-text">{formik.errors.terms}</p>
            )}

            <Button type="submit" loading={loading} fullWidth>{t('common.register')}</Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Zaten hesabınız var mı?{' '}
              <Link to="/login" className="link font-semibold hover:underline">{t('common.login')}</Link>
            </p>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

