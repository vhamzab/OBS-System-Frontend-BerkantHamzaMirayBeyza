import { useState, useRef } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { FiCamera, FiMail, FiPhone, FiUser, FiHash, FiLock, FiSave } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const profileSchema = Yup.object({
  firstName: Yup.string()
    .min(2, 'Ad en az 2 karakter olmalıdır')
    .required('Ad zorunludur'),
  lastName: Yup.string()
    .min(2, 'Soyad en az 2 karakter olmalıdır')
    .required('Soyad zorunludur'),
  phone: Yup.string()
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/, 'Geçerli bir telefon numarası giriniz')
    .nullable(),
});

const passwordSchema = Yup.object({
  currentPassword: Yup.string()
    .required('Mevcut şifre zorunludur'),
  newPassword: Yup.string()
    .min(8, 'Şifre en az 8 karakter olmalıdır')
    .matches(/[A-Z]/, 'Şifre en az bir büyük harf içermelidir')
    .matches(/[a-z]/, 'Şifre en az bir küçük harf içermelidir')
    .matches(/[0-9]/, 'Şifre en az bir rakam içermelidir')
    .required('Yeni şifre zorunludur'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Şifreler eşleşmiyor')
    .required('Şifre tekrarı zorunludur'),
});

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const fileInputRef = useRef(null);

  const getRoleLabel = (role) => {
    const roles = {
      student: 'Öğrenci',
      faculty: 'Öğretim Üyesi',
      admin: 'Yönetici',
    };
    return roles[role] || role;
  };

  const profileFormik = useFormik({
    initialValues: {
      firstName: user?.first_name || '',
      lastName: user?.last_name || '',
      phone: user?.phone || '',
    },
    validationSchema: profileSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setProfileLoading(true);
      try {
        const response = await userService.updateProfile(values);
        if (response.success) {
          updateUser({
            first_name: values.firstName,
            last_name: values.lastName,
            phone: values.phone,
          });
          toast.success('Profil bilgileri güncellendi');
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Güncelleme başarısız');
      } finally {
        setProfileLoading(false);
      }
    },
  });

  const passwordFormik = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: passwordSchema,
    onSubmit: async (values, { resetForm }) => {
      setPasswordLoading(true);
      try {
        await userService.changePassword(
          values.currentPassword,
          values.newPassword,
          values.confirmPassword
        );
        toast.success('Şifre başarıyla değiştirildi');
        resetForm();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Şifre değiştirilemedi');
      } finally {
        setPasswordLoading(false);
      }
    },
  });

  const handlePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handlePictureChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      toast.error('Sadece JPG ve PNG formatları desteklenmektedir');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Dosya boyutu 5MB\'dan küçük olmalıdır');
      return;
    }

    setUploadLoading(true);
    try {
      const response = await userService.uploadProfilePicture(file);
      if (response.success) {
        updateUser({ profile_picture_url: response.data.profilePictureUrl });
        toast.success('Profil fotoğrafı güncellendi');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Yükleme başarısız');
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <h1 className="font-display text-3xl font-bold mb-8">Profilim</h1>

      <div className="grid gap-6">
        {/* Profile Picture & Info Card */}
        <div className="card">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Profile Picture */}
            <div className="relative group">
              <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center overflow-hidden">
                {user?.profile_picture_url ? (
                  <img
                    src={user.profile_picture_url}
                    alt={user.first_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-3xl">
                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                  </span>
                )}
              </div>
              <button
                onClick={handlePictureClick}
                disabled={uploadLoading}
                className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                {uploadLoading ? (
                  <div className="spinner" />
                ) : (
                  <FiCamera className="w-6 h-6 text-white" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handlePictureChange}
                className="hidden"
              />
            </div>

            {/* User Info */}
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold mb-1">
                {user?.first_name} {user?.last_name}
              </h2>
              <p className="text-slate-400 mb-3">{user?.email}</p>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/20 text-primary-400 text-sm font-medium">
                {getRoleLabel(user?.role)}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="card">
          <h3 className="font-display text-xl font-bold mb-6">Profil Bilgileri</h3>
          <form onSubmit={profileFormik.handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="Ad"
                name="firstName"
                icon={FiUser}
                value={profileFormik.values.firstName}
                onChange={profileFormik.handleChange}
                onBlur={profileFormik.handleBlur}
                error={profileFormik.errors.firstName}
                touched={profileFormik.touched.firstName}
                required
              />
              <Input
                label="Soyad"
                name="lastName"
                icon={FiUser}
                value={profileFormik.values.lastName}
                onChange={profileFormik.handleChange}
                onBlur={profileFormik.handleBlur}
                error={profileFormik.errors.lastName}
                touched={profileFormik.touched.lastName}
                required
              />
            </div>

            <Input
              label="E-posta"
              name="email"
              type="email"
              icon={FiMail}
              value={user?.email || ''}
              disabled
            />

            <Input
              label="Telefon"
              name="phone"
              icon={FiPhone}
              placeholder="+90 5XX XXX XX XX"
              value={profileFormik.values.phone}
              onChange={profileFormik.handleChange}
              onBlur={profileFormik.handleBlur}
              error={profileFormik.errors.phone}
              touched={profileFormik.touched.phone}
            />

            {/* Role-specific fields */}
            {user?.student && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  label="Öğrenci Numarası"
                  name="studentNumber"
                  icon={FiHash}
                  value={user.student.student_number}
                  disabled
                />
                <Input
                  label="Bölüm"
                  name="department"
                  value={user.student.department?.name || '-'}
                  disabled
                />
              </div>
            )}

            {user?.faculty && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  label="Personel Numarası"
                  name="employeeNumber"
                  icon={FiHash}
                  value={user.faculty.employee_number}
                  disabled
                />
                <Input
                  label="Bölüm"
                  name="department"
                  value={user.faculty.department?.name || '-'}
                  disabled
                />
              </div>
            )}

            <div className="flex justify-end">
              <Button type="submit" loading={profileLoading}>
                <FiSave className="w-4 h-4" />
                Değişiklikleri Kaydet
              </Button>
            </div>
          </form>
        </div>

        {/* Password Change Form */}
        <div className="card">
          <h3 className="font-display text-xl font-bold mb-6">Şifre Değiştir</h3>
          <form onSubmit={passwordFormik.handleSubmit} className="space-y-5">
            <Input
              label="Mevcut Şifre"
              name="currentPassword"
              type="password"
              icon={FiLock}
              placeholder="••••••••"
              value={passwordFormik.values.currentPassword}
              onChange={passwordFormik.handleChange}
              onBlur={passwordFormik.handleBlur}
              error={passwordFormik.errors.currentPassword}
              touched={passwordFormik.touched.currentPassword}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="Yeni Şifre"
                name="newPassword"
                type="password"
                icon={FiLock}
                placeholder="••••••••"
                value={passwordFormik.values.newPassword}
                onChange={passwordFormik.handleChange}
                onBlur={passwordFormik.handleBlur}
                error={passwordFormik.errors.newPassword}
                touched={passwordFormik.touched.newPassword}
                required
              />
              <Input
                label="Yeni Şifre Tekrar"
                name="confirmPassword"
                type="password"
                icon={FiLock}
                placeholder="••••••••"
                value={passwordFormik.values.confirmPassword}
                onChange={passwordFormik.handleChange}
                onBlur={passwordFormik.handleBlur}
                error={passwordFormik.errors.confirmPassword}
                touched={passwordFormik.touched.confirmPassword}
                required
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" loading={passwordLoading}>
                <FiLock className="w-4 h-4" />
                Şifreyi Değiştir
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

