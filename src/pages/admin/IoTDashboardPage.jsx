import { useState, useEffect, useMemo } from 'react';
import { FiThermometer, FiUsers, FiZap, FiWind, FiSun, FiDroplet, FiRefreshCw, FiAlertCircle, FiActivity, FiBarChart2, FiPieChart } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getAllSensors, getLatestReadings, getSensorData, simulateSensorData } from '../../services/sensorService';
import { SensorLineChart, SensorGaugeChart, SensorBarChart } from '../../components/charts';
import { useTranslation } from 'react-i18next';

const IoTDashboardPage = () => {
    const { t } = useTranslation();
    const [sensors, setSensors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSensor, setSelectedSensor] = useState(null);
    const [sensorData, setSensorData] = useState([]);
    const [simulating, setSimulating] = useState(false);
    const [viewMode, setViewMode] = useState('chart'); // 'chart' or 'table'

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

    // Get sensor thresholds based on type
    const getSensorThresholds = (type) => {
        switch (type) {
            case 'temperature': return { min: 0, max: 40, warning: 70, danger: 85 };
            case 'humidity': return { min: 0, max: 100, warning: 60, danger: 80 };
            case 'energy': return { min: 0, max: 1000, warning: 70, danger: 90 };
            case 'air_quality': return { min: 0, max: 500, warning: 50, danger: 75 };
            case 'light': return { min: 0, max: 1000, warning: 80, danger: 95 };
            case 'occupancy': return { min: 0, max: 500, warning: 70, danger: 90 };
            default: return { min: 0, max: 100, warning: 70, danger: 90 };
        }
    };

    // Calculate summary statistics
    const sensorStats = useMemo(() => {
        if (sensors.length === 0) return null;

        const alertSensors = sensors.filter(s => s.alertStatus !== 'normal');
        const sensorsByType = sensors.reduce((acc, s) => {
            acc[s.type] = (acc[s.type] || 0) + 1;
            return acc;
        }, {});

        return {
            total: sensors.length,
            active: sensors.filter(s => s.last_reading !== null).length,
            alerts: alertSensors.length,
            byType: sensorsByType,
        };
    }, [sensors]);

    // Mini sparkline component for sensor cards
    const MiniSparkline = ({ data = [], alertStatus }) => {
        if (!data || data.length < 2) return null;

        const values = data.slice(-8).map(d => parseFloat(d.avg_value) || 0);
        const max = Math.max(...values);
        const min = Math.min(...values);
        const range = max - min || 1;

        const points = values.map((v, i) => {
            const x = (i / (values.length - 1)) * 100;
            const y = 100 - ((v - min) / range) * 100;
            return `${x},${y}`;
        }).join(' ');

        const color = alertStatus === 'high' ? '#EF4444' :
            alertStatus === 'low' ? '#3B82F6' : '#10B981';

        return (
            <svg viewBox="0 0 100 100" className="w-16 h-8 overflow-visible">
                <polyline
                    points={points}
                    fill="none"
                    stroke={color}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        );
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
                    {/* Summary Stats */}
                    {sensorStats && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <div className="card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-blue-200 dark:border-blue-800">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-blue-500/20 rounded-xl">
                                        <FiActivity className="text-xl text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{sensorStats.total}</p>
                                        <p className="text-sm text-blue-600 dark:text-blue-400">Toplam Sensör</p>
                                    </div>
                                </div>
                            </div>
                            <div className="card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 border-green-200 dark:border-green-800">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-green-500/20 rounded-xl">
                                        <FiZap className="text-xl text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-green-700 dark:text-green-300">{sensorStats.active}</p>
                                        <p className="text-sm text-green-600 dark:text-green-400">Aktif Sensör</p>
                                    </div>
                                </div>
                            </div>
                            <div className="card bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 border-red-200 dark:border-red-800">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-red-500/20 rounded-xl">
                                        <FiAlertCircle className="text-xl text-red-600 dark:text-red-400" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-red-700 dark:text-red-300">{sensorStats.alerts}</p>
                                        <p className="text-sm text-red-600 dark:text-red-400">Aktif Uyarı</p>
                                    </div>
                                </div>
                            </div>
                            <div className="card bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 border-purple-200 dark:border-purple-800">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-purple-500/20 rounded-xl">
                                        <FiPieChart className="text-xl text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{Object.keys(sensorStats.byType).length}</p>
                                        <p className="text-sm text-purple-600 dark:text-purple-400">Sensör Tipi</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

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
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-600 dark:text-gray-300">{sensor.name}</p>
                                            <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-1">
                                                {formatValue(sensor.last_reading, sensor.unit)}
                                            </p>
                                            <p className="text-xs text-gray-700 dark:text-gray-200 mt-2">{sensor.location}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <div className={`p-3 rounded-xl ${sensor.alertStatus === 'high' ? 'bg-red-500' :
                                                sensor.alertStatus === 'low' ? 'bg-blue-500' :
                                                    'bg-gray-200 dark:bg-gray-700'
                                                }`}>
                                                <Icon className="text-xl text-gray-800 dark:text-gray-100" />
                                            </div>
                                            {/* Mini sparkline placeholder - will show when sensor data loaded */}
                                            {selectedSensor?.id === sensor.id && sensorData.length > 0 && (
                                                <MiniSparkline data={sensorData} alertStatus={sensor.alertStatus} />
                                            )}
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

                    {/* Selected Sensor Details with Charts */}
                    {selectedSensor && (
                        <div className="space-y-6">
                            {/* Header with view toggle */}
                            <div className="flex items-center justify-between">
                                <h2 className="font-display text-xl font-bold text-gray-800 dark:text-gray-100">
                                    {selectedSensor.name} - Son 24 Saat
                                </h2>
                                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                                    <button
                                        onClick={() => setViewMode('chart')}
                                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'chart'
                                                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800'
                                            }`}
                                    >
                                        <FiBarChart2 className="inline mr-1" />
                                        Grafik
                                    </button>
                                    <button
                                        onClick={() => setViewMode('table')}
                                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'table'
                                                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800'
                                            }`}
                                    >
                                        Tablo
                                    </button>
                                </div>
                            </div>

                            {sensorData.length > 0 ? (
                                viewMode === 'chart' ? (
                                    <>
                                        {/* Gauge and Stats Row */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {/* Gauge Chart */}
                                            <SensorGaugeChart
                                                value={selectedSensor.last_reading || 0}
                                                min={getSensorThresholds(selectedSensor.type).min}
                                                max={getSensorThresholds(selectedSensor.type).max}
                                                unit={selectedSensor.unit || ''}
                                                title="Anlık Değer"
                                                thresholds={{
                                                    warning: getSensorThresholds(selectedSensor.type).warning,
                                                    danger: getSensorThresholds(selectedSensor.type).danger,
                                                }}
                                            />

                                            {/* Line Chart - Spans 2 columns */}
                                            <div className="md:col-span-2">
                                                <SensorLineChart
                                                    data={sensorData}
                                                    title="Zaman Serisi Grafiği"
                                                    unit={selectedSensor.unit || ''}
                                                    height={180}
                                                />
                                            </div>
                                        </div>

                                        {/* Bar Chart */}
                                        <SensorBarChart
                                            data={sensorData}
                                            title="Saatlik Ortalama Değerler"
                                            unit={selectedSensor.unit || ''}
                                            height={200}
                                            colorScheme="gradient"
                                        />
                                    </>
                                ) : (
                                    /* Table View */
                                    <div className="card">
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
                                                            <td className="py-2 px-4 text-right text-gray-500 dark:text-gray-400">
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
                                    </div>
                                )
                            ) : (
                                <div className="card">
                                    <p className="text-gray-600 dark:text-gray-300 text-center py-8">{t('common.noData')}</p>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default IoTDashboardPage;
