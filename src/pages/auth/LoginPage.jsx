import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
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
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const from = location.state?.from?.pathname || '/dashboard';

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
            rememberMe: false,
        },
        validationSchema,
        onSubmit: async (values) => {
            setLoading(true);
            try {
                const result = await login(values.email, values.password);
                if (result.success) {
                    toast.success('Giriş başarılı!');
                    navigate('/dashboard', { replace: true });
                } else {
                    toast.error(result.message || 'Giriş başarısız');
                }
            } catch (error) {
                if (error.response?.status === 401) {
                    toast.error('E-posta veya şifre hatalı');
                } else if (error.response?.status === 0) {
                    toast.error('Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.');
                } else {
                    toast.error(error.message || 'Giriş sırasında bir hata oluştu');
                }
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
            {/* Overlay for better readability */}
            <div className="absolute inset-0 bg-slate-900/30 z-0" />

            <div className="w-full max-w-md relative z-10">
                {/* Header with Logo */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-3 mb-6">
                        <img
                            src="/resimler/logo.png"
                            alt="BHMB Üniversitesi Logo"
                            className="w-16 h-16 object-contain rounded-2xl shadow-lg"
                        />
                    </Link>
                    <h1 className="font-display text-3xl font-bold mb-2 text-white drop-shadow-lg">
                        Tekrar Hoş Geldiniz
                    </h1>
                    <p className="text-slate-200 drop-shadow">
                        BHMB Üniversitesi hesabınıza giriş yapın
                    </p>
                </div>

                {/* Form */}
                <div className="card backdrop-blur-sm bg-slate-800/80">
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

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="rememberMe"
                                    checked={formik.values.rememberMe}
                                    onChange={formik.handleChange}
                                    className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-primary-500 focus:ring-primary-500"
                                />
                                <span className="text-sm text-slate-300">Beni hatırla</span>
                            </label>
                            <Link to="/forgot-password" className="text-sm text-primary-400 hover:text-primary-300 transition-colors">
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
                            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
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
