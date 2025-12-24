import { useState, useEffect } from 'react';
import { FiThermometer, FiUsers, FiZap, FiWind, FiSun, FiDroplet, FiRefreshCw, FiAlertCircle, FiActivity } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getAllSensors, getLatestReadings, getSensorData, simulateSensorData } from '../../services/sensorService';

import { useTranslation } from 'react-i18next';
const IoTDashboardPage = () => {
  const { t } = useTranslation();
    const [sensors, setSensors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSensor, setSelectedSensor] = useState(null);
    const [sensorData, setSensorData] = useState([]);
    const [simulating, setSimulating] = useState(false);

    useEffect(() => {
        fetchSensors();
        // Poll for updates every 30 seconds
        const interval = setInterval(fetchSensors, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchSensors = async () => {
        try {
            const response = await getLatestReadings();
            if (response.success) {
                setSensors(response.data);
            }
        } catch (error) {
            console.error('Error fetching sensors:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSensorData = async (sensorId) => {
        try {
            const response = await getSensorData(sensorId, { aggregation: 'hour', limit: 24 });
            if (response.success) {
                setSensorData(response.data.readings);
            }
        } catch (error) {
            toast.error('Sensör verisi alınamadı');
        }
    };

    const handleSimulate = async () => {
        try {
            setSimulating(true);
            await simulateSensorData();
            await fetchSensors();
            toast.success('Sensör verileri simüle edildi');
        } catch (error) {
            toast.error('Simülasyon başarısız');
        } finally {
            setSimulating(false);
        }
    };

    const handleSensorClick = (sensor) => {
        setSelectedSensor(sensor);
        fetchSensorData(sensor.id);
    };

    const getSensorIcon = (type) => {
        switch (type) {
            case 'temperature': return FiThermometer;
            case 'humidity': return FiDroplet;
            case 'occupancy': return FiUsers;
            case 'energy': return FiZap;
            case 'air_quality': return FiWind;
            case 'light': return FiSun;
            default: return FiActivity;
        }
    };

    const getAlertColor = (alertStatus) => {
        switch (alertStatus) {
            case 'high': return 'border-red-500 bg-red-500/10';
            case 'low': return 'border-blue-500 bg-blue-500/10';
            default: return 'border-gray-200 dark:border-gray-700';
        }
    };

    const formatValue = (value, unit) => {
        if (value === null || value === undefined) return '-';
        return `${value.toFixed(1)} ${unit || ''}`;
    };

    if (loading) {
        return (
            <div className="p-6 lg:p-8 max-w-7xl mx-auto">
                <div className="animate-pulse">
                    <div className="h-8 bg-primary-50 rounded w-64 mb-8"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="card h-32 bg-primary-50"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="font-display text-3xl font-bold text-gray-800 dark:text-gray-100">IoT Sensör Dashboard</h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">Kampüs sensör verileri (gerçek zamanlı)</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={fetchSensors}
                        className="btn-secondary flex items-center gap-2"
                    >
                        <FiRefreshCw />
                        Yenile
                    </button>
                    <button
                        onClick={handleSimulate}
                        disabled={simulating}
                        className="btn-primary flex items-center gap-2"
                    >
                        {simulating ? 'Simüle ediliyor...' : 'Veri Simüle Et'}
                    </button>
                </div>
            </div>

            {sensors.length === 0 ? (
                <div className="card text-center py-12">
                    <FiActivity className="text-4xl text-gray-700 dark:text-gray-200 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-2">Sensör Bulunamadı</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">Sistemde aktif sensör bulunmuyor.</p>
                    <button onClick={handleSimulate} className="btn-primary">
                        Demo Sensör Oluştur
                    </button>
                </div>
            ) : (
                <>
                    {/* Sensor Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {sensors.map((sensor) => {
                            const Icon = getSensorIcon(sensor.type);
                            return (
                                <div
                                    key={sensor.id}
                                    onClick={() => handleSensorClick(sensor)}
                                    className={`card cursor-pointer hover:shadow-lg transition-all duration-200 border-2 ${getAlertColor(sensor.alertStatus)} ${selectedSensor?.id === sensor.id ? 'ring-2 ring-blue-500' : ''
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">{sensor.name}</p>
                                            <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-1">
                                                {formatValue(sensor.last_reading, sensor.unit)}
                                            </p>
                                            <p className="text-xs text-gray-700 dark:text-gray-200 mt-2">{sensor.location}</p>
                                        </div>
                                        <div className={`p-3 rounded-xl ${sensor.alertStatus === 'high' ? 'bg-red-500' :
                                                sensor.alertStatus === 'low' ? 'bg-blue-500' :
                                                    'bg-gray-200 dark:bg-gray-700'
                                            }`}>
                                            <Icon className="text-xl text-gray-800 dark:text-gray-100" />
                                        </div>
                                    </div>
                                    {sensor.alertStatus !== 'normal' && (
                                        <div className={`mt-3 flex items-center gap-2 text-sm ${sensor.alertStatus === 'high' ? 'text-red-400' : 'text-blue-400'
                                            }`}>
                                            <FiAlertCircle />
                                            {sensor.alertStatus === 'high' ? 'Yüksek değer uyarısı' : 'Düşük değer uyarısı'}
                                        </div>
                                    )}
                                    {sensor.last_reading_at && (
                                        <p className="text-xs text-gray-700 dark:text-gray-200 mt-2">
                                            Son güncelleme: {new Date(sensor.last_reading_at).toLocaleTimeString('tr-TR')}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Selected Sensor Details */}
                    {selectedSensor && (
                        <div className="card">
                            <h2 className="font-display text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                                {selectedSensor.name} - Son 24 Saat
                            </h2>
                            {sensorData.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200 dark:border-gray-700">
                                                <th className="text-left py-2 px-4 text-gray-600 dark:text-gray-300">Zaman</th>
                                                <th className="text-right py-2 px-4 text-gray-600 dark:text-gray-300">{t('grades.average')}</th>
                                                <th className="text-right py-2 px-4 text-gray-600 dark:text-gray-300">Min</th>
                                                <th className="text-right py-2 px-4 text-gray-600 dark:text-gray-300">Max</th>
                                                <th className="text-right py-2 px-4 text-gray-600 dark:text-gray-300">Okuma</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sensorData.slice(0, 12).map((reading, idx) => (
                                                <tr key={idx} className="border-b border-gray-200 dark:border-gray-700/50">
                                                    <td className="py-2 px-4 text-gray-800 dark:text-gray-100">{reading.period}</td>
                                                    <td className="py-2 px-4 text-right text-gray-500 dark:text-gray-400 dark:text-gray-500">
                                                        {parseFloat(reading.avg_value).toFixed(1)}
                                                    </td>
                                                    <td className="py-2 px-4 text-right text-blue-400">
                                                        {parseFloat(reading.min_value).toFixed(1)}
                                                    </td>
                                                    <td className="py-2 px-4 text-right text-red-400">
                                                        {parseFloat(reading.max_value).toFixed(1)}
                                                    </td>
                                                    <td className="py-2 px-4 text-right text-gray-600 dark:text-gray-300">
                                                        {reading.reading_count}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-gray-600 dark:text-gray-300 text-center py-8">{t('common.noData')}</p>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default IoTDashboardPage;
