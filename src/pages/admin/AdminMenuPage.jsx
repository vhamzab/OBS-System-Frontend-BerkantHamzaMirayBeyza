import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiCalendar, FiSave, FiX } from 'react-icons/fi';
import { FaUtensils } from 'react-icons/fa';
import toast from 'react-hot-toast';
import mealService from '../../services/mealService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';

const AdminMenuPage = () => {
  const [menus, setMenus] = useState([]);
  const [cafeterias, setCafeterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [formData, setFormData] = useState({
    cafeteria_id: '',
    date: new Date().toISOString().split('T')[0],
    meal_type: 'lunch',
    items_json: [],
    nutrition_json: {
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
    },
    price: 0,
    is_published: false,
  });
  const [newItem, setNewItem] = useState('');

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [menusRes, cafeteriasRes] = await Promise.all([
        mealService.getMenus({ date: selectedDate }),
        mealService.getCafeterias(),
      ]);

      if (menusRes.success) {
        setMenus(menusRes.data);
      }
      if (cafeteriasRes.success) {
        const cafeteriasData = cafeteriasRes.data || [];
        
        // Eğer kafeterya yoksa otomatik olarak seed yap
        if (Array.isArray(cafeteriasData) && cafeteriasData.length === 0) {
          try {
            console.log('No cafeterias found, seeding...');
            const seedRes = await mealService.seedCafeterias();
            if (seedRes.success) {
              // Seed'den sonra tekrar cafeterias'ları getir
              const newCafeteriasRes = await mealService.getCafeterias();
              if (newCafeteriasRes.success) {
                const newCafeteriasData = newCafeteriasRes.data || [];
                setCafeterias(newCafeteriasData);
                console.log('Cafeterias seeded:', newCafeteriasData);
                toast.success('Kafeteryalar otomatik olarak oluşturuldu');
              }
            } else {
              console.error('Seed failed:', seedRes);
              setCafeterias([]);
            }
          } catch (seedError) {
            console.error('Seed cafeterias error:', seedError);
            toast.error('Kafeteryalar yüklenirken hata oluştu');
            setCafeterias([]);
          }
        } else {
          setCafeterias(cafeteriasData);
          console.log('Cafeterias loaded:', cafeteriasData);
        }
      } else {
        setCafeterias([]);
      }
    } catch (error) {
      toast.error('Veriler yüklenirken hata oluştu');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (menu = null) => {
    if (menu) {
      setEditingMenu(menu);
      setFormData({
        cafeteria_id: menu.cafeteria_id,
        date: menu.date,
        meal_type: menu.meal_type === 'breakfast' ? 'lunch' : (menu.meal_type === 'dinner' ? 'dinner' : 'lunch'),
        items_json: menu.items_json || [],
        nutrition_json: menu.nutrition_json || {
          calories: '',
          protein: '',
          carbs: '',
          fat: '',
        },
        price: menu.price || 0,
        is_published: menu.is_published || false,
      });
    } else {
      setEditingMenu(null);
      setFormData({
        cafeteria_id: '',
        date: selectedDate,
        meal_type: 'lunch',
        items_json: [],
        nutrition_json: {
          calories: '',
          protein: '',
          carbs: '',
          fat: '',
        },
        price: 0,
        is_published: false,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingMenu(null);
    setNewItem('');
  };

  const handleAddItem = () => {
    if (newItem.trim()) {
      setFormData({
        ...formData,
        items_json: [...formData.items_json, newItem.trim()],
      });
      setNewItem('');
    }
  };

  const handleRemoveItem = (index) => {
    setFormData({
      ...formData,
      items_json: formData.items_json.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.cafeteria_id || !formData.date || !formData.meal_type) {
      toast.error('Kafeterya, tarih ve öğün tipi zorunludur');
      return;
    }

    // Validate cafeteria_id is a valid UUID (not empty string)
    if (!formData.cafeteria_id || formData.cafeteria_id.trim() === '') {
      toast.error('Geçerli bir kafeterya seçmelisiniz');
      return;
    }

    // Check if selected cafeteria exists in the list
    const selectedCafeteria = cafeterias.find(c => c.id === formData.cafeteria_id);
    if (!selectedCafeteria) {
      toast.error('Seçilen kafeterya bulunamadı. Lütfen sayfayı yenileyin ve tekrar deneyin.');
      // Refresh cafeterias
      const refreshRes = await mealService.getCafeterias();
      if (refreshRes.success) {
        setCafeterias(refreshRes.data || []);
      }
      return;
    }

    setSaving(true);
    try {
      // Clean nutrition_json - remove empty strings
      const cleanedNutrition = {};
      if (formData.nutrition_json.calories && formData.nutrition_json.calories !== '') {
        cleanedNutrition.calories = formData.nutrition_json.calories;
      }
      if (formData.nutrition_json.protein && formData.nutrition_json.protein !== '') {
        cleanedNutrition.protein = formData.nutrition_json.protein;
      }
      if (formData.nutrition_json.carbs && formData.nutrition_json.carbs !== '') {
        cleanedNutrition.carbs = formData.nutrition_json.carbs;
      }
      if (formData.nutrition_json.fat && formData.nutrition_json.fat !== '') {
        cleanedNutrition.fat = formData.nutrition_json.fat;
      }

      const cleanedFormData = {
        ...formData,
        nutrition_json: Object.keys(cleanedNutrition).length > 0 ? cleanedNutrition : {},
        price: formData.price || 0,
      };

      console.log('Creating menu with data:', cleanedFormData);

      let response;
      if (editingMenu) {
        response = await mealService.updateMenu(editingMenu.id, cleanedFormData);
      } else {
        response = await mealService.createMenu(cleanedFormData);
      }

      if (response.success) {
        toast.success(editingMenu ? 'Menü güncellendi' : 'Menü oluşturuldu');
        handleCloseModal();
        fetchData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Menü kaydedilirken hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (menuId) => {
    if (!confirm('Bu menüyü silmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      const response = await mealService.deleteMenu(menuId);
      if (response.success) {
        toast.success('Menü silindi');
        fetchData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Menü silinirken hata oluştu');
    }
  };

  const getMealTypeLabel = (type) => {
    const labels = {
      breakfast: 'Kahvaltı',
      lunch: 'Öğle Yemeği',
      dinner: 'Akşam Yemeği',
    };
    return labels[type] || type;
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold mb-2">Menü Yönetimi</h1>
          <p className="text-slate-400">Yemek menülerini oluşturun ve yönetin</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <FiPlus className="w-4 h-4 mr-2" />
          Yeni Menü
        </Button>
      </div>

      {/* Date Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Tarih Seç</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-4">
          {menus.length === 0 ? (
            <div className="card text-center py-12">
              <FaUtensils className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400">Seçilen tarih için menü bulunamadı</p>
            </div>
          ) : (
            menus.map((menu) => (
              <div key={menu.id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FaUtensils className="text-primary-400" />
                      <h3 className="text-lg font-bold">{menu.cafeteria?.name}</h3>
                      <span className="px-2 py-1 bg-primary-500/20 text-primary-400 text-xs rounded-full">
                        {getMealTypeLabel(menu.meal_type)}
                      </span>
                      {menu.is_published ? (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                          Yayında
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                          Taslak
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 mb-3">{menu.cafeteria?.location}</p>
                    {menu.items_json && Array.isArray(menu.items_json) && menu.items_json.length > 0 && (
                      <ul className="space-y-1 mb-3">
                        {menu.items_json.map((item, idx) => (
                          <li key={idx} className="text-sm text-slate-300">
                            • {item}
                          </li>
                        ))}
                      </ul>
                    )}
                    {menu.price > 0 && (
                      <p className="text-sm text-slate-400">
                        Fiyat: <span className="font-semibold text-green-400">{menu.price} TRY</span>
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenModal(menu)}
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(menu.id)}
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                {editingMenu ? 'Menü Düzenle' : 'Yeni Menü Oluştur'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-white"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Kafeterya *</label>
                  <select
                    value={formData.cafeteria_id}
                    onChange={(e) => setFormData({ ...formData, cafeteria_id: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-white"
                    required
                  >
                    <option value="">Seçiniz</option>
                    {Array.isArray(cafeterias) && cafeterias.length > 0 ? (
                      cafeterias.map((cafeteria) => (
                        <option key={cafeteria.id} value={cafeteria.id}>
                          {cafeteria.name}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        Kafeterya bulunamadı
                      </option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Tarih *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Ne Zaman *</label>
                  <select
                    value={formData.meal_type === 'lunch' ? 'lunch' : formData.meal_type === 'dinner' ? 'dinner' : 'lunch'}
                    onChange={(e) => setFormData({ ...formData, meal_type: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-white"
                    required
                  >
                    <option value="lunch">Öğle</option>
                    <option value="dinner">Akşam</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Fiyat (₺)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-white">Yemekler</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddItem();
                      }
                    }}
                    placeholder="Yemek adı ekleyin"
                    className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-white placeholder-slate-400"
                  />
                  <Button type="button" onClick={handleAddItem}>
                    Ekle
                  </Button>
                </div>
                <div className="space-y-1">
                  {formData.items_json.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between px-3 py-2 bg-slate-700 rounded-lg"
                    >
                      <span className="text-sm text-white">{item}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Kalori (kcal)</label>
                  <input
                    type="number"
                    value={formData.nutrition_json.calories}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nutrition_json: { ...formData.nutrition_json, calories: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Protein (g)</label>
                  <input
                    type="number"
                    value={formData.nutrition_json.protein}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nutrition_json: { ...formData.nutrition_json, protein: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="w-4 h-4 text-primary-500 bg-slate-700 border-slate-600 rounded focus:ring-primary-500"
                />
                <label htmlFor="is_published" className="text-sm text-white">
                  Hemen yayınla
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleCloseModal}
                  className="flex-1"
                >
                  İptal
                </Button>
                <Button type="submit" loading={saving} className="flex-1">
                  <FiSave className="w-4 h-4 mr-2" />
                  {editingMenu ? 'Güncelle' : 'Oluştur'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMenuPage;
