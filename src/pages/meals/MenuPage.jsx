import { useState, useEffect } from 'react';
import { FiCalendar, FiShare2, FiDollarSign } from 'react-icons/fi';
import { FaUtensils, FaTint, FaSeedling } from 'react-icons/fa';
import toast from 'react-hot-toast';
import mealService from '../../services/mealService';
import walletService from '../../services/walletService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import Calendar from '../../components/common/Calendar';
import { useNavigate } from 'react-router-dom';

const MenuPage = () => {
  const navigate = useNavigate();
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [reserving, setReserving] = useState(null);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [myReservations, setMyReservations] = useState([]);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferringReservation, setTransferringReservation] = useState(null);
  const [studentNumber, setStudentNumber] = useState('');
  const [transferring, setTransferring] = useState(false);
  const [walletBalance, setWalletBalance] = useState(null);

  useEffect(() => {
    fetchMenus();
    fetchMyReservations();
    fetchWalletBalance();
  }, [selectedDate]);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const response = await mealService.getMenus({ date: selectedDate });
      if (response.success) {
        setMenus(response.data);
      }
    } catch (error) {
      toast.error('Menüler yüklenirken hata oluştu');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyReservations = async () => {
    try {
      const response = await mealService.getMyReservations({ date: selectedDate });
      if (response.success) {
        setMyReservations(response.data);
      }
    } catch (error) {
      console.error('Rezervasyonlar yüklenirken hata oluştu:', error);
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const response = await walletService.getBalance();
      if (response.success) {
        setWalletBalance(response.data.balance);
      }
    } catch (error) {
      console.error('Bakiye yüklenirken hata:', error);
    }
  };

  const handleReserve = (menu) => {
    // Check wallet balance if meal is paid
    if (menu.price > 0 && walletBalance !== null && walletBalance < menu.price) {
      toast.error(`Yetersiz bakiye. Yemek ücreti: ${menu.price} TRY, Mevcut bakiye: ${walletBalance.toFixed(2)} TRY`);
      return;
    }
    setSelectedMenu(menu);
    setShowReservationModal(true);
  };

  const confirmReservation = async () => {
    if (!selectedMenu) return;

    try {
      setReserving(selectedMenu.id);
      const response = await mealService.createReservation({
        menu_id: selectedMenu.id,
        cafeteria_id: selectedMenu.cafeteria_id,
        meal_type: selectedMenu.meal_type,
        date: selectedDate,
      });

      if (response.success) {
        toast.success('Yemek rezervasyonu oluşturuldu');
        setShowReservationModal(false);
        setSelectedMenu(null);
        fetchMenus();
        fetchMyReservations();
        fetchWalletBalance(); // Refresh wallet balance after payment
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Rezervasyon oluşturulurken hata oluştu');
    } finally {
      setReserving(null);
    }
  };

  const handleTransferClick = (reservation) => {
    setTransferringReservation(reservation);
    setShowTransferModal(true);
    setStudentNumber('');
  };

  const confirmTransfer = async () => {
    if (!transferringReservation || !studentNumber.trim()) {
      toast.error('Öğrenci numarası gerekli');
      return;
    }

    try {
      setTransferring(true);
      const response = await mealService.transferReservation(
        transferringReservation.id,
        studentNumber.trim()
      );

      if (response.success) {
        toast.success(response.message || 'Rezervasyon devri başlatıldı');
        setShowTransferModal(false);
        setTransferringReservation(null);
        setStudentNumber('');
        fetchMyReservations();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Rezervasyon devri sırasında hata oluştu');
    } finally {
      setTransferring(false);
    }
  };

  const getReservationForMenu = (menu) => {
    return myReservations.find(
      (r) =>
        r.menu_id === menu.id &&
        r.date === selectedDate &&
        r.status === 'reserved' &&
        !r.transfer_status
    );
  };

  const getMealTypeLabel = (type) => {
    const labels = {
      breakfast: 'Kahvaltı',
      lunch: 'Öğle Yemeği',
      dinner: 'Akşam Yemeği',
    };
    return labels[type] || type;
  };

  const getMealTypeIcon = (type) => {
    return <FaUtensils className="w-5 h-5" />;
  };

  const groupedMenus = menus.reduce((acc, menu) => {
    if (!acc[menu.meal_type]) {
      acc[menu.meal_type] = [];
    }
    acc[menu.meal_type].push(menu);
    return acc;
  }, {});

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-2">Yemek Menüsü</h1>
        <p className="text-slate-400">Günlük menüleri görüntüleyin ve rezervasyon yapın</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-1">
          <Calendar
            selectedDate={selectedDate}
            onDateSelect={(date) => setSelectedDate(date.toISOString().split('T')[0])}
            minDate={new Date()}
          />
        </div>

        {/* Menus */}
        <div className="lg:col-span-2">
          {loading ? (
            <LoadingSpinner />
          ) : menus.length === 0 ? (
            <div className="card text-center py-12">
              <FaUtensils className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400">Seçilen tarih için menü bulunamadı</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedMenus).map(([mealType, typeMenus]) => (
                <div key={mealType} className="card">
                  <div className="flex items-center gap-3 mb-4">
                    {getMealTypeIcon(mealType)}
                    <h2 className="text-xl font-bold">{getMealTypeLabel(mealType)}</h2>
                  </div>

                  {typeMenus.map((menu) => {
                    const reservation = getReservationForMenu(menu);
                    return (
                      <div key={menu.id} className="border-t border-slate-700/50 pt-4 mt-4 first:border-t-0 first:pt-0 first:mt-0">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold mb-2">{menu.cafeteria?.name}</h3>
                            <p className="text-sm text-slate-400 mb-3">{menu.cafeteria?.location}</p>
                            
                            {menu.items_json && Array.isArray(menu.items_json) && (
                              <ul className="space-y-1 mb-3">
                                {menu.items_json.map((item, idx) => (
                                  <li key={idx} className="text-sm text-slate-300 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary-400"></span>
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            )}

                            {menu.nutrition_json && (
                              <div className="flex flex-wrap gap-4 mt-3">
                                {menu.nutrition_json.calories && (
                                  <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <FaTint />
                                    <span>{menu.nutrition_json.calories} kcal</span>
                                  </div>
                                )}
                                {menu.nutrition_json.protein && (
                                  <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <FaSeedling />
                                    <span>{menu.nutrition_json.protein}g protein</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="ml-4">
                            {menu.price > 0 ? (
                              <div className="text-right mb-2">
                                <span className="text-lg font-bold">{menu.price} TRY</span>
                              </div>
                            ) : (
                              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                                Ücretsiz
                              </span>
                            )}
                            {reservation ? (
                              <Button
                                onClick={() => handleTransferClick(reservation)}
                                size="sm"
                                variant="outline"
                                className="w-full"
                              >
                                <FiShare2 className="w-4 h-4 mr-2" />
                                Rezervasyonu Devret
                              </Button>
                            ) : (
                              <Button
                                onClick={() => handleReserve(menu)}
                                size="sm"
                                disabled={reserving === menu.id}
                                loading={reserving === menu.id}
                              >
                                Rezerve Et
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reservation Modal */}
      {showReservationModal && selectedMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Rezervasyon Onayı</h3>
            <div className="space-y-3 mb-6">
              <div>
                <span className="text-slate-400">Tarih:</span>
                <span className="ml-2 font-semibold">
                  {new Date(selectedDate).toLocaleDateString('tr-TR')}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Öğün:</span>
                <span className="ml-2 font-semibold">
                  {getMealTypeLabel(selectedMenu.meal_type)}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Kafeterya:</span>
                <span className="ml-2 font-semibold">{selectedMenu.cafeteria?.name}</span>
              </div>
              {selectedMenu.price > 0 && (
                <>
                  <div>
                    <span className="text-slate-400">Tutar:</span>
                    <span className="ml-2 font-semibold text-green-400">
                      {selectedMenu.price} TRY
                    </span>
                  </div>
                  {walletBalance !== null && (
                    <div className="p-3 bg-slate-700/50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FiDollarSign className="text-slate-400" />
                          <span className="text-sm text-slate-400">Cüzdan Bakiyeniz:</span>
                          <span className={`font-bold ${walletBalance >= selectedMenu.price ? 'text-green-400' : 'text-red-400'}`}>
                            {walletBalance.toFixed(2)} TRY
                          </span>
                        </div>
                        {walletBalance < selectedMenu.price && (
                          <button
                            onClick={() => {
                              setShowReservationModal(false);
                              navigate('/wallet');
                            }}
                            className="text-sm text-blue-400 hover:text-blue-300 underline"
                          >
                            Para Yükle
                          </button>
                        )}
                      </div>
                      {walletBalance < selectedMenu.price && (
                        <p className="text-xs text-red-400 mt-2">
                          Yetersiz bakiye. Lütfen cüzdanınıza para yükleyin.
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowReservationModal(false);
                  setSelectedMenu(null);
                }}
                className="flex-1"
              >
                İptal
              </Button>
              <Button
                onClick={confirmReservation}
                loading={reserving === selectedMenu.id}
                disabled={selectedMenu.price > 0 && walletBalance !== null && walletBalance < selectedMenu.price}
                className="flex-1"
              >
                Onayla
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && transferringReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Rezervasyonu Devret</h3>
            <div className="space-y-3 mb-6">
              <div>
                <span className="text-slate-400">Tarih:</span>
                <span className="ml-2 font-semibold">
                  {new Date(transferringReservation.date).toLocaleDateString('tr-TR')}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Öğün:</span>
                <span className="ml-2 font-semibold">
                  {getMealTypeLabel(transferringReservation.meal_type)}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Kafeterya:</span>
                <span className="ml-2 font-semibold">{transferringReservation.cafeteria?.name}</span>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Öğrenci Numarası</label>
                <input
                  type="text"
                  value={studentNumber}
                  onChange={(e) => setStudentNumber(e.target.value)}
                  placeholder="Öğrenci numarasını girin"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowTransferModal(false);
                  setTransferringReservation(null);
                  setStudentNumber('');
                }}
                className="flex-1"
              >
                İptal
              </Button>
              <Button
                onClick={confirmTransfer}
                loading={transferring}
                disabled={!studentNumber.trim()}
                className="flex-1"
              >
                Devret
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuPage;

