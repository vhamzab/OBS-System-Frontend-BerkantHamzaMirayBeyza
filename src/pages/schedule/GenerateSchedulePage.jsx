import { useState, useEffect } from 'react';
import { FiCalendar, FiCheck, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import schedulingService from '../../services/schedulingService';
import courseService from '../../services/courseService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';

const GenerateSchedulePage = () => {
  const [sections, setSections] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [selectedSections, setSelectedSections] = useState([]);
  const [semester, setSemester] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatedSchedule, setGeneratedSchedule] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sectionsRes, classroomsRes] = await Promise.all([
        courseService.getSections(),
        courseService.getClassrooms(),
      ]);

      if (sectionsRes.success) {
        setSections(sectionsRes.data || []);
      }
      if (classroomsRes.success) {
        setClassrooms(classroomsRes.data || []);
      }
    } catch (error) {
      toast.error('Veriler yüklenirken hata oluştu');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (selectedSections.length === 0) {
      toast.error('En az bir section seçmelisiniz');
      return;
    }

    if (!semester || !year) {
      toast.error('Dönem ve yıl seçmelisiniz');
      return;
    }

    try {
      setGenerating(true);
      const constraints = {
        sections: selectedSections.map((id) => {
          const section = sections.find((s) => s.id === id);
          return {
            id: section.id,
            course_id: section.course_id,
            instructor_id: section.instructor_id,
            capacity: section.capacity || section.enrolled_count || 30,
            course_requirements: section.course?.requirements || {},
          };
        }),
        classrooms: classrooms.map((c) => ({
          id: c.id,
          capacity: c.capacity,
          features: c.features_json || {},
        })),
        timeSlots: [
          { day_of_week: 'monday', start_time: '09:00', end_time: '17:00' },
          { day_of_week: 'tuesday', start_time: '09:00', end_time: '17:00' },
          { day_of_week: 'wednesday', start_time: '09:00', end_time: '17:00' },
          { day_of_week: 'thursday', start_time: '09:00', end_time: '17:00' },
          { day_of_week: 'friday', start_time: '09:00', end_time: '17:00' },
        ],
      };

      const response = await schedulingService.generateSchedule(constraints);
      if (response.success) {
        setGeneratedSchedule(response.data);
        toast.success('Ders programı oluşturuldu');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Program oluşturulurken hata oluştu');
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  const toggleSection = (sectionId) => {
    setSelectedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-2">Otomatik Ders Programı Oluştur</h1>
        <p className="text-slate-400">CSP algoritması ile otomatik ders programı oluşturun</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Ayarlar</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Dönem</label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="input w-full"
                >
                  <option value="">Seçiniz</option>
                  <option value="fall">Güz</option>
                  <option value="spring">Bahar</option>
                  <option value="summer">Yaz</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Yıl</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  className="input w-full"
                />
              </div>
              <Button
                onClick={handleGenerate}
                loading={generating}
                disabled={selectedSections.length === 0 || !semester || !year}
                fullWidth
              >
                Program Oluştur
              </Button>
            </div>
          </div>

          {/* Selected Sections */}
          {selectedSections.length > 0 && (
            <div className="card">
              <h3 className="font-bold mb-3">
                Seçilen Section'lar ({selectedSections.length})
              </h3>
              <div className="space-y-2">
                {selectedSections.map((id) => {
                  const section = sections.find((s) => s.id === id);
                  return (
                    <div
                      key={id}
                      className="p-2 bg-slate-700/50 rounded flex items-center justify-between"
                    >
                      <span className="text-sm">
                        {section?.course?.code} - {section?.section_number}
                      </span>
                      <button
                        onClick={() => toggleSection(id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <FiX />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sections List */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Section'ları Seçin</h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {sections.map((section) => (
                <div
                  key={section.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedSections.includes(section.id)
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-slate-700 bg-slate-700/50 hover:border-slate-600'
                  }`}
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">
                        {section.course?.code} - {section.course?.name}
                      </div>
                      <div className="text-sm text-slate-400">
                        Section {section.section_number} - Kapasite: {section.capacity}
                      </div>
                    </div>
                    {selectedSections.includes(section.id) && (
                      <FiCheck className="text-blue-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Generated Schedule Preview */}
      {generatedSchedule && (
        <div className="mt-6 card">
          <h2 className="text-xl font-bold mb-4">Oluşturulan Program</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-5 gap-4 text-sm">
              <div className="font-semibold">Ders</div>
              <div className="font-semibold">Gün</div>
              <div className="font-semibold">Saat</div>
              <div className="font-semibold">Derslik</div>
              <div className="font-semibold">İşlem</div>
            </div>
            {generatedSchedule.schedule?.map((item) => (
              <div key={item.id} className="grid grid-cols-5 gap-4 p-3 bg-slate-700/50 rounded">
                <div>{item.section?.course?.code}</div>
                <div>{item.day_of_week}</div>
                <div>
                  {item.start_time} - {item.end_time}
                </div>
                <div>{item.classroom?.building} {item.classroom?.room_number}</div>
                <div>
                  <Button size="sm" variant="secondary">
                    Kaydet
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerateSchedulePage;

