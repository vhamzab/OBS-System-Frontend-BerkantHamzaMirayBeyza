import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiFilter, FiBook, FiClock, FiUsers, FiChevronRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import courseService from '../../services/courseService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CourseCatalogPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  const departments = [
    { value: '', label: 'Tüm Bölümler' },
    { value: 'CSE', label: 'Bilgisayar Mühendisliği' },
    { value: 'MATH', label: 'Matematik' },
    { value: 'PHYS', label: 'Fizik' },
    { value: 'BA', label: 'İşletme' },
  ];

  useEffect(() => {
    fetchCourses();
  }, [pagination.page, search, departmentFilter]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };
      
      if (search) params.search = search;
      if (departmentFilter) params.department_id = departmentFilter;

      const response = await courseService.getCourses(params);
      
      if (response.success) {
        setCourses(response.data.courses);
        setPagination((prev) => ({
          ...prev,
          total: response.data.pagination.total,
          totalPages: response.data.pagination.totalPages,
        }));
      }
    } catch (error) {
      toast.error('Dersler yüklenirken hata oluştu');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchCourses();
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-2">Ders Kataloğu</h1>
        <p className="text-slate-400">Mevcut dersleri görüntüleyin ve kayıt olun</p>
      </div>

      {/* Search and Filter */}
      <div className="card mb-8">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Ders kodu veya adı ile ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
          <div className="flex gap-4">
            <select
              value={departmentFilter}
              onChange={(e) => {
                setDepartmentFilter(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="input min-w-[200px]"
            >
              {departments.map((dept) => (
                <option key={dept.value} value={dept.value}>
                  {dept.label}
                </option>
              ))}
            </select>
            <button type="submit" className="btn btn-primary">
              <FiFilter className="w-4 h-4 mr-2" />
              Filtrele
            </button>
          </div>
        </form>
      </div>

      {/* Course Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : courses.length === 0 ? (
        <div className="card text-center py-16">
          <FiBook className="w-16 h-16 mx-auto text-slate-600 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Ders Bulunamadı</h2>
          <p className="text-slate-400">Arama kriterlerinize uygun ders bulunamadı.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {courses.map((course) => (
              <Link
                key={course.id}
                to={`/courses/${course.id}`}
                className="card hover:border-primary-500/50 transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center">
                    <FiBook className="w-6 h-6 text-primary-400" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-slate-700/50 text-xs font-medium">
                    {course.code}
                  </span>
                </div>
                
                <h3 className="font-display text-lg font-semibold mb-2 group-hover:text-primary-400 transition-colors">
                  {course.name}
                </h3>
                
                <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                  {course.description || 'Açıklama bulunmuyor'}
                </p>
                
                <div className="flex items-center justify-between text-sm text-slate-400">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <FiClock className="w-4 h-4" />
                      {course.credits} Kredi
                    </span>
                    <span className="flex items-center gap-1">
                      <FiUsers className="w-4 h-4" />
                      {course.ects} AKTS
                    </span>
                  </div>
                  <FiChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
                
                {course.department && (
                  <div className="mt-4 pt-4 border-t border-slate-700/50">
                    <span className="text-xs text-slate-500">{course.department.name}</span>
                  </div>
                )}
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="btn btn-secondary"
              >
                Önceki
              </button>
              <span className="px-4 py-2 text-slate-400">
                Sayfa {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
                className="btn btn-secondary"
              >
                Sonraki
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CourseCatalogPage;

