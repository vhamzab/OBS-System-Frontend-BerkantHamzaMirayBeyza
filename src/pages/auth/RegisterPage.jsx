import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiUser, FiHash, FiCheck, FiSend } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';

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
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const roleOptions = [
    { value: 'student', label: 'Öğrenci' },
    { value: 'faculty', label: 'Öğretim Üyesi' },
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
          setRegisteredEmail(values.email);
          setRegistrationSuccess(true);
          toast.success('Kayıt başarılı! E-postanızı kontrol edin.');
        }
      } catch (error) {
        const message = error.response?.data?.message || 'Kayıt olurken bir hata oluştu';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
  });

  // Email doğrulama başarı ekranı
  if (registrationSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-accent-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl" />
        </div>

        <div className="w-full max-w-md relative">
          <div className="card text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiSend className="w-10 h-10 text-green-500" />
            </div>
            
            <h1 className="font-display text-2xl font-bold mb-4 text-green-400">
              Kayıt Başarılı! 🎉
            </h1>
            
            <p className="text-slate-300 mb-6">
              E-posta adresinize bir doğrulama linki gönderdik.
            </p>

            <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center gap-2 mb-3">
                <FiMail className="w-5 h-5 text-primary-400" />
                <span className="text-primary-400 font-medium">{registeredEmail}</span>
              </div>
              <p className="text-sm text-slate-400">
                E-posta kutunuzu kontrol edin ve doğrulama linkine tıklayarak hesabınızı aktifleştirin.
              </p>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6">
              <p className="text-sm text-amber-300">
                ⚠️ E-posta gelmedi mi? Spam klasörünü kontrol edin.
              </p>
            </div>

            <Link 
              to="/login" 
              className="btn-primary inline-flex items-center justify-center gap-2 w-full"
            >
              <FiCheck className="w-4 h-4" />
              Giriş Sayfasına Git
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
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-accent-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-lg relative">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/25">
              <span className="text-white font-bold text-2xl">Ü</span>
            </div>
          </Link>
          <h1 className="font-display text-3xl font-bold mb-2">
            Hesap Oluşturun
          </h1>
          <p className="text-slate-400">
            Üniversite OBS'ye kayıt olun
          </p>
        </div>

        {/* Form */}
        <div className="card">
          <form onSubmit={formik.handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Ad"
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
                label="Soyad"
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
              placeholder="ornek@university.edu"
              icon={FiMail}
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.email}
              touched={formik.touched.email}
              required
            />

            <div className="grid grid-cols-2 gap-4">
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
              <Input
                label="Şifre Tekrar"
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
                label="Öğrenci Numarası"
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
                className="w-5 h-5 mt-0.5 rounded border-slate-600 bg-slate-800 text-primary-500 focus:ring-primary-500 focus:ring-offset-slate-900"
              />
              <span className="text-sm text-slate-400">
                <Link to="/terms" className="link">Kullanım koşullarını</Link> ve{' '}
                <Link to="/privacy" className="link">gizlilik politikasını</Link> okudum ve kabul ediyorum.
              </span>
            </label>
            {formik.touched.terms && formik.errors.terms && (
              <p className="error-text">{formik.errors.terms}</p>
            )}

            <Button type="submit" loading={loading} fullWidth>
              Kayıt Ol
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-400">
              Zaten hesabınız var mı?{' '}
              <Link to="/login" className="link font-medium">
                Giriş Yap
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

