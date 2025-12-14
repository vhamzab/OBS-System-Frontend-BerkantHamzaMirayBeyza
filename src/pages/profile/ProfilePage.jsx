import { useState, useRef, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { FiCamera, FiMail, FiPhone, FiUser, FiHash, FiLock, FiSave, FiBookOpen, FiFileText, FiDownload } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';
import { getFileUrl } from '../../services/api';
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

// Student Department Section Component
const StudentDepartmentSection = ({ studentNumber, currentDepartment, onDepartmentUpdate }) => {
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState(currentDepartment?.id || '');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await userService.getAllDepartments();
      if (response.success) {
        setDepartments(response.data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDepartmentChange = async (deptId) => {
    if (!deptId || deptId === currentDepartment?.id) return;

    setSaving(true);
    try {
      const response = await userService.updateStudentDepartment(deptId);
      if (response.success) {
        const selectedDepartment = departments.find(d => d.id === deptId);
        toast.success('Bölüm başarıyla güncellendi!');
        setSelectedDept(deptId);
        onDepartmentUpdate(selectedDepartment);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Bölüm güncellenirken hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <Input
        label="Öğrenci Numarası"
        name="studentNumber"
        icon={FiHash}
        value={studentNumber || '-'}
        disabled
      />
      <div>
        <label className="block text-sm font-medium mb-2">
          Bölüm
          {!currentDepartment && (
            <span className="text-amber-400 text-xs ml-2">(Lütfen seçin)</span>
          )}
        </label>
        <div className="relative">
          <FiBookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <select
            value={selectedDept}
            onChange={(e) => handleDepartmentChange(e.target.value)}
            disabled={loading || saving}
            className="input pl-10 w-full appearance-none cursor-pointer"
          >
            <option value="">-- Bölüm Seçin --</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name} ({dept.code})
              </option>
            ))}
          </select>
          {saving && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
        {currentDepartment && (
          <p className="text-xs text-slate-500 mt-1">
            Mevcut: {currentDepartment.name}
          </p>
        )}
      </div>
    </div>
  );
};


// Faculty Department Section Component
const FacultyDepartmentSection = ({ employeeNumber, currentDepartment, onDepartmentUpdate }) => {
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState(currentDepartment?.id || '');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await userService.getAllDepartments();
      if (response.success) {
        setDepartments(response.data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDepartmentChange = async (deptId) => {
    if (!deptId || deptId === currentDepartment?.id) return;

    setSaving(true);
    try {
      const response = await userService.updateFacultyDepartment(deptId);
      if (response.success) {
        const selectedDepartment = departments.find(d => d.id === deptId);
        toast.success('Bölüm başarıyla güncellendi!');
        setSelectedDept(deptId);
        onDepartmentUpdate(selectedDepartment);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Bölüm güncellenirken hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <Input
        label="Sicil Numarası"
        name="employeeNumber"
        icon={FiHash}
        value={employeeNumber || '-'}
        disabled
      />
      <div>
        <label className="block text-sm font-medium mb-2">
          Bölüm
          {!currentDepartment && (
            <span className="text-amber-400 text-xs ml-2">(Lütfen seçin)</span>
          )}
        </label>
        <div className="relative">
          <FiBookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <select
            value={selectedDept}
            onChange={(e) => handleDepartmentChange(e.target.value)}
            disabled={loading || saving}
            className="input pl-10 w-full appearance-none cursor-pointer"
          >
            <option value="">-- Bölüm Seçin --</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name} ({dept.code})
              </option>
            ))}
          </select>
          {saving && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
        {currentDepartment && (
          <p className="text-xs text-slate-500 mt-1">
            Mevcut: {currentDepartment.name}
          </p>
        )}
      </div>
    </div>
  );
};


const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [certificateLoading, setCertificateLoading] = useState(false);
  const fileInputRef = useRef(null);

  const getRoleLabel = (role) => {
    const roles = {
      student: 'Öğrenci',
      faculty: 'Öğretim Üyesi',
      admin: 'Yönetici',
    };
    return roles[role] || role;
  };

  const handleDownloadCertificate = async () => {
    try {
      setCertificateLoading(true);
      const blob = await userService.downloadCertificate();

      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ogrenci_belgesi_${user?.student?.student_number || 'obs'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Öğrenci belgesi indirildi');
    } catch (error) {
      console.error('Certificate download error:', error);
      toast.error('Belge indirilirken hata oluştu');
    } finally {
      setCertificateLoading(false);
    }
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
        // Get full URL for the profile picture
        const fullUrl = getFileUrl(response.data.profilePictureUrl);
        updateUser({ profile_picture_url: fullUrl });
        toast.success('Profil fotoğrafı güncellendi');
        // Reset file input to allow uploading the same file again
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Yükleme başarısız');
    } finally {
      setUploadLoading(false);
    }
  };

  // Get profile picture URL with fallback
  const getProfilePictureUrl = () => {
    if (user?.profile_picture_url) {
      // If it's already a full URL, return as is, otherwise convert it
      return getFileUrl(user.profile_picture_url);
    }
    return null;
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
              <div className="w-36 h-36 sm:w-48 sm:h-48 rounded-2xl bg-gradient-to-br from-primary-500 via-primary-400 to-accent-500 flex items-center justify-center overflow-hidden border-2 border-slate-700/50 shadow-2xl relative">
                {getProfilePictureUrl() ? (
                  <img
                    src={getProfilePictureUrl()}
                    alt={`${user?.first_name} ${user?.last_name}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // If image fails to load, hide it and show initials
                      e.target.style.display = 'none';
                      const parent = e.target.parentElement;
                      if (parent) {
                        const initials = parent.querySelector('.profile-initials');
                        if (initials) initials.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <span
                  className={`profile-initials text-white font-bold text-5xl sm:text-6xl ${getProfilePictureUrl() ? 'hidden' : 'flex'} items-center justify-center absolute inset-0`}
                >
                  {user?.first_name?.[0]?.toUpperCase() || ''}{user?.last_name?.[0]?.toUpperCase() || ''}
                </span>
              </div>
              <button
                onClick={handlePictureClick}
                disabled={uploadLoading}
                className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer disabled:cursor-not-allowed z-10"
                aria-label="Profil fotoğrafı değiştir"
              >
                {uploadLoading ? (
                  <div className="spinner" />
                ) : (
                  <FiCamera className="w-8 h-8 text-white" />
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

        {/* Documents Card - Student Only */}
        {user?.role === 'student' && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl font-bold">Belgelerim</h3>
              <FiFileText className="w-5 h-5 text-primary-400" />
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center">
                  <span className="font-bold text-xs">PDF</span>
                </div>
                <div>
                  <h4 className="font-medium">Öğrenci Belgesi</h4>
                  <p className="text-xs text-slate-400">Resmi, barkodlu öğrenci belgesi</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadCertificate}
                loading={certificateLoading}
              >
                <FiDownload className="w-4 h-4 mr-2" />
                İndir
              </Button>
            </div>
          </div>
        )}

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
            {user?.role === 'student' && (
              <StudentDepartmentSection
                studentNumber={user.student?.student_number}
                currentDepartment={user.student?.department}
                onDepartmentUpdate={(dept) => {
                  updateUser({
                    student: {
                      ...user.student,
                      department: dept
                    }
                  });
                }}
              />
            )}

            {user?.role === 'faculty' && (
              <FacultyDepartmentSection
                employeeNumber={user.faculty?.employee_number}
                currentDepartment={user.faculty?.department}
                onDepartmentUpdate={(dept) => {
                  updateUser({
                    faculty: {
                      ...user.faculty,
                      department: dept
                    }
                  });
                }}
              />
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
