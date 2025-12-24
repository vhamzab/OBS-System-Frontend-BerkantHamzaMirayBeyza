import { useState, useEffect } from 'react';
import { FiBell, FiMail, FiSmartphone, FiMessageSquare, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getPreferences, updatePreferences } from '../../services/notificationService';

import { useTranslation } from 'react-i18next';
const NotificationSettingsPage = () => {
  const { t } = useTranslation();
    const [preferences, setPreferences] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchPreferences();
    }, []);

    const fetchPreferences = async () => {
        try {
            setLoading(true);
            const response = await getPreferences();
            if (response.success) {
                setPreferences(response.data);
            }
        } catch (error) {
            toast.error('Tercihler yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (channel, category) => {
        setPreferences(prev => ({
            ...prev,
            [channel]: {
                ...prev[channel],
                [category]: !prev[channel][category]
            }
        }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await updatePreferences(preferences);
            toast.success('Tercihler kaydedildi');
        } catch (error) {
            toast.error('Tercihler kaydedilemedi');
        } finally {
            setSaving(false);
        }
    };

    const categories = [
        { key: 'academic', label: 'Akademik', desc: 'Not, transkript güncellemeleri' },
        { key: 'attendance', label: 'Yoklama', desc: 'Devamsızlık uyarıları' },
        { key: 'meal', label: 'Yemek', desc: 'Yemek rezervasyonu hatırlatmaları' },
        { key: 'event', label: 'Etkinlik', desc: 'Etkinlik hatırlatmaları' },
        { key: 'payment', label: 'Ödeme', desc: 'Bakiye ve ödeme bildirimleri' },
        { key: 'system', label: 'Sistem', desc: 'Genel duyurular' }
    ];

    const Toggle = ({ checked, onChange }) => (
        <button
            onClick={onChange}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
                }`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-gray-800 transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'
                    }`}
            />
        </button>
    );

    if (loading) {
        return (
            <div className="p-6 lg:p-8 max-w-4xl mx-auto">
                <div className="animate-pulse">
                    <div className="h-8 bg-primary-50 rounded w-64 mb-8"></div>
                    <div className="card h-64 bg-primary-50"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="font-display text-3xl font-bold text-gray-800 dark:text-gray-100">Bildirim Ayarları</h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">Bildirim tercihlerinizi yönetin</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary flex items-center gap-2"
                >
                    <FiSave />
                    {saving ? 'Kaydediliyor...' : t('common.save')}
                </button>
            </div>

            <div className="card">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                                <th className="text-left py-4 px-4 text-gray-600 dark:text-gray-300 font-medium">{t('events.category')}</th>
                                <th className="text-center py-4 px-4 text-gray-600 dark:text-gray-300 font-medium">
                                    <div className="flex items-center justify-center gap-2">
                                        <FiMail />{t('auth.email')}</div>
                                </th>
                                <th className="text-center py-4 px-4 text-gray-600 dark:text-gray-300 font-medium">
                                    <div className="flex items-center justify-center gap-2">
                                        <FiSmartphone />
                                        Push
                                    </div>
                                </th>
                                <th className="text-center py-4 px-4 text-gray-600 dark:text-gray-300 font-medium">
                                    <div className="flex items-center justify-center gap-2">
                                        <FiMessageSquare />
                                        SMS
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map(({ key, label, desc }) => (
                                <tr key={key} className="border-b border-gray-200 dark:border-gray-700/50">
                                    <td className="py-4 px-4">
                                        <p className="font-medium text-gray-800 dark:text-gray-100">{label}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">{desc}</p>
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                        {preferences?.email?.[key] !== undefined && (
                                            <Toggle
                                                checked={preferences.email[key]}
                                                onChange={() => handleToggle('email', key)}
                                            />
                                        )}
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                        {preferences?.push?.[key] !== undefined && (
                                            <Toggle
                                                checked={preferences.push[key]}
                                                onChange={() => handleToggle('push', key)}
                                            />
                                        )}
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                        {preferences?.sms?.[key] !== undefined ? (
                                            <Toggle
                                                checked={preferences.sms[key]}
                                                onChange={() => handleToggle('sms', key)}
                                            />
                                        ) : (
                                            <span className="text-gray-700 dark:text-gray-200">-</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="card mt-6">
                <div className="flex items-start gap-3">
                    <FiBell className="text-blue-400 text-xl mt-1" />
                    <div>
                        <h3 className="font-medium text-gray-800 dark:text-gray-100">Bildirim İpuçları</h3>
                        <ul className="text-sm text-gray-600 dark:text-gray-300 mt-2 space-y-1">
                            <li>• SMS bildirimleri sadece kritik durumlar için kullanılır</li>
                            <li>• Push bildirimleri için tarayıcı izni gereklidir</li>
                            <li>• E-posta bildirimleri günlük özet olarak da gönderilebilir</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationSettingsPage;
