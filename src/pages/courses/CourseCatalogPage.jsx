import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiFilter, FiBook, FiClock, FiUsers, FiChevronRight, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import courseService from '../../services/courseService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { testApiConnection, testCoursesEndpoint } from '../../utils/apiTest';
import { useAuth } from '../../context/AuthContext';

// Debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Skeleton loader component
const CourseCardSkeleton = () => (
  <div className="card animate-pulse">
    <div className="flex items-start justify-between mb-4">
      <div className="w-12 h-12 rounded-xl bg-slate-700"></div>
      <div className="w-16 h-6 rounded-full bg-slate-700"></div>
    </div>
    <div className="h-6 bg-slate-700 rounded mb-2"></div>
    <div className="h-4 bg-slate-700 rounded mb-4 w-3/4"></div>
    <div className="flex items-center gap-4">
      <div className="h-4 bg-slate-700 rounded w-20"></div>
      <div className="h-4 bg-slate-700 rounded w-20"></div>
    </div>
  </div>
);

const CourseCatalogPage = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);
  const [search, setSearch] = useState('');
  // Auto-set department filter for students with a department
  const [departmentFilter, setDepartmentFilter] = useState(
    user?.role === 'student' && user?.student?.department?.id
      ? user.student.department.id
      : ''
  );
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  // Debounce search input
  const debouncedSearch = useDebounce(search, 500);

  // Test API connection on mount (only in production or when needed)
  useEffect(() => {
    const testConnection = async () => {
      // Only test in production or when explicitly needed
      if (!import.meta.env.DEV) {
        console.log('🌍 Production environment detected, testing API connection...');
        const healthTest = await testApiConnection();
        if (!healthTest.success) {
          console.error('❌ API health check failed:', healthTest.error);
          toast.error('Backend sunucusuna bağlanılamadı. Lütfen daha sonra tekrar deneyin.');
        }

        const coursesTest = await testCoursesEndpoint();
        if (!coursesTest.success) {
          console.error('❌ Courses endpoint test failed:', coursesTest.error);
        }
      }
    };

    testConnection();
  }, []);

  // Fetch departments on mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setDepartmentsLoading(true);
        console.log('🏢 Fetching departments...');
        const response = await courseService.getDepartments();
        console.log('🏢 Departments response:', response);
        if (response.success) {
          setDepartments([
            { id: '', code: '', name: 'Tüm Bölümler' },
            ...response.data,
          ]);
        } else {
          console.warn('⚠️ Departments fetch returned unsuccessful:', response);
        }
      } catch (error) {
        console.error('❌ Error fetching departments:', error);
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        // Fallback to hardcoded departments if API fails
        setDepartments([
          { id: '', code: '', name: 'Tüm Bölümler' },
          { id: 'CSE', code: 'CSE', name: 'Bilgisayar Mühendisliği' },
          { id: 'MATH', code: 'MATH', name: 'Matematik' },
          { id: 'PHYS', code: 'PHYS', name: 'Fizik' },
          { id: 'BA', code: 'BA', name: 'İşletme' },
        ]);
      } finally {
        setDepartmentsLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  // Fetch courses when pagination, search, or filter changes
  useEffect(() => {
    fetchCourses();
  }, [pagination.page, debouncedSearch, departmentFilter]);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }
      if (departmentFilter) {
        params.department_id = departmentFilter;
      }

      console.log('📚 Fetching courses with params:', params);
      const response = await courseService.getCourses(params);
      console.log('📚 Courses response:', response);

      if (response.success) {
        setCourses(response.data.courses);
        setPagination((prev) => ({
          ...prev,
          total: response.data.pagination.total,
          totalPages: response.data.pagination.totalPages,
        }));
      } else {
        console.error('❌ Courses fetch failed:', response);
        toast.error(response.message || 'Dersler yüklenirken hata oluştu');
      }
    } catch (error) {
      console.error('❌ Courses fetch error:', error);
      toast.error(error.message || 'Dersler yüklenirken hata oluştu');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, debouncedSearch, departmentFilter, pagination.limit]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleDepartmentChange = (e) => {
    setDepartmentFilter(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setSearch('');
    setDepartmentFilter('');
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const hasActiveFilters = search.trim() || departmentFilter;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-2">Ders Kataloğu</h1>
        <p className="text-slate-400">Mevcut dersleri görüntüleyin ve kayıt olun</p>
      </div>

      {/* Search and Filter */}
      <div className="card mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Ders kodu veya adı ile ara..."
              value={search}
              onChange={handleSearchChange}
              className="input pl-10 pr-10 w-full"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <FiX className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex gap-4">
            <select
              value={departmentFilter}
              onChange={handleDepartmentChange}
              disabled={departmentsLoading}
              className="input min-w-[200px]"
            >
              {departments.map((dept) => (
                <option key={dept.id || 'all'} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="btn btn-secondary"
                title="Filtreleri temizle"
              >
                <FiX className="w-4 h-4 mr-2" />
                Temizle
              </button>
            )}
          </div>
        </div>

        {/* Active filters indicator */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-slate-400">Aktif filtreler:</span>
            {search.trim() && (
              <span className="px-3 py-1 rounded-full bg-primary-500/20 text-primary-400 text-sm flex items-center gap-2">
                Arama: "{search}"
                <button
                  onClick={() => setSearch('')}
                  className="hover:text-primary-300"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            )}
            {departmentFilter && (
              <span className="px-3 py-1 rounded-full bg-primary-500/20 text-primary-400 text-sm flex items-center gap-2">
                Bölüm: {departments.find(d => d.id === departmentFilter)?.name || departmentFilter}
                <button
                  onClick={() => setDepartmentFilter('')}
                  className="hover:text-primary-300"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Results count */}
      {!loading && (
        <div className="mb-4 text-sm text-slate-400">
          {pagination.total > 0 ? (
            <>
              Toplam <span className="font-semibold text-slate-200">{pagination.total}</span> ders bulundu
              {hasActiveFilters && ' (filtrelenmiş)'}
            </>
          ) : (
            'Sonuç bulunamadı'
          )}
        </div>
      )}

      {/* Course Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="card text-center py-16">
          <FiBook className="w-16 h-16 mx-auto text-slate-600 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Ders Bulunamadı</h2>
          <p className="text-slate-400 mb-4">
            {hasActiveFilters
              ? 'Arama kriterlerinize uygun ders bulunamadı. Filtreleri değiştirmeyi deneyin.'
              : 'Henüz hiç ders eklenmemiş.'}
          </p>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="btn btn-primary mt-4">
              Filtreleri Temizle
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {courses.map((course) => (
              <Link
                key={course.id}
                to={`/courses/${course.id}`}
                className="card hover:border-primary-500/50 transition-all duration-300 group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center group-hover:from-primary-500/30 group-hover:to-accent-500/30 transition-all">
                    <FiBook className="w-6 h-6 text-primary-400" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-slate-700/50 text-xs font-medium group-hover:bg-slate-700/70 transition-colors">
                    {course.code}
                  </span>
                </div>

                <h3 className="font-display text-lg font-semibold mb-2 group-hover:text-primary-400 transition-colors line-clamp-2">
                  {course.name}
                </h3>

                <p className="text-slate-400 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
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
            <div className="flex justify-center items-center gap-4">
              <button
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Önceki
              </button>
              <div className="flex items-center gap-2">
                {[...Array(pagination.totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  // Show first page, last page, current page, and pages around current
                  if (
                    pageNum === 1 ||
                    pageNum === pagination.totalPages ||
                    (pageNum >= pagination.page - 1 && pageNum <= pagination.page + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPagination((prev) => ({ ...prev, page: pageNum }))}
                        className={`px-4 py-2 rounded-lg transition-colors ${pagination.page === pageNum
                            ? 'bg-primary-500 text-white'
                            : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    pageNum === pagination.page - 2 ||
                    pageNum === pagination.page + 2
                  ) {
                    return <span key={pageNum} className="text-slate-400">...</span>;
                  }
                  return null;
                })}
              </div>
              <button
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
                className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sonraki
              </button>
              <span className="text-sm text-slate-400 ml-4">
                Sayfa {pagination.page} / {pagination.totalPages}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CourseCatalogPage;
