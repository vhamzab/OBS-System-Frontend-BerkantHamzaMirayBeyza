import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
import authService from '../../services/authService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const validationSchema = Yup.object({
    firstName: Yup.string()
        .min(2, 'İsim en az 2 karakter olmalıdır')
        .required('İsim zorunludur'),
    lastName: Yup.string()
        .min(2, 'Soyisim en az 2 karakter olmalıdır')
        .required('Soyisim zorunludur'),
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
});

const RegisterPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const formik = useFormik({
        initialValues: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
        validationSchema,
        onSubmit: async (values) => {
            setLoading(true);
            try {
                await authService.register({
                    firstName: values.firstName,
                    lastName: values.lastName,
                    email: values.email,
                    password: values.password,
                });
                toast.success('Kayıt başarılı! Lütfen e-posta adresinizi doğrulayın.');
                navigate('/login');
            } catch (error) {
                toast.error(error.response?.data?.message || 'Kayıt sırasında bir hata oluştu');
            } finally {
                setLoading(false);
            }
        },
    });

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
            {/* Background Image with blur */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: 'url(/resimler/ArkaPlan.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    filter: 'blur(3px)',
                }}
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-slate-900/30 z-0" />

            <div className="w-full max-w-md relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-3 mb-6">
                        <img
                            src="/resimler/logo.png"
                            alt="BHMB Üniversitesi Logo"
                            className="w-16 h-16 object-contain rounded-2xl shadow-lg"
                        />
                    </Link>
                    <h1 className="font-display text-3xl font-bold mb-2 text-white drop-shadow-lg">
                        Hesap Oluştur
                    </h1>
                    <p className="text-slate-200 drop-shadow">
                        BHMB Üniversitesi'ne kayıt olun
                    </p>
                </div>

                {/* Form */}
                <div className="card backdrop-blur-sm bg-slate-800/80">
                    <form onSubmit={formik.handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="İsim"
                                name="firstName"
                                type="text"
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
                                label="Soyisim"
                                name="lastName"
                                type="text"
                                placeholder="Soyadınız"
                                icon={FiUser}
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

                        <div className="relative">
                            <Input
                                label="Şifre"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                icon={FiLock}
                                value={formik.values.password}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.errors.password}
                                touched={formik.touched.password}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-9 text-slate-400 hover:text-white transition-colors"
                            >
                                {showPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>

                        <div className="relative">
                            <Input
                                label="Şifre Tekrarı"
                                name="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                icon={FiLock}
                                value={formik.values.confirmPassword}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.errors.confirmPassword}
                                touched={formik.touched.confirmPassword}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-9 text-slate-400 hover:text-white transition-colors"
                            >
                                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>

                        <Button type="submit" loading={loading} fullWidth>
                            Kayıt Ol
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-slate-400">
                            Zaten hesabınız var mı?{' '}
                            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
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
