import { useMemo } from 'react';

/**
 * Sensor Bar Chart Component
 * Displays sensor data as a bar chart for hourly comparison
 */
const SensorBarChart = ({
    data = [],
    title = 'Saatlik Veriler',
    unit = '',
    height = 180,
    className = '',
    colorScheme = 'blue', // blue, green, gradient
}) => {
    const chartData = useMemo(() => {
        if (!data || data.length === 0) return { bars: [], stats: null };

        const values = data.map(d => ({
            period: d.period,
            value: parseFloat(d.avg_value) || 0,
            min: parseFloat(d.min_value) || 0,
            max: parseFloat(d.max_value) || 0,
            count: d.reading_count || 0,
        }));

        const maxValue = Math.max(...values.map(v => v.max || v.value));
        const minValue = Math.min(...values.map(v => v.min || v.value));

        const bars = values.map(v => ({
            ...v,
            heightPercent: maxValue > 0 ? (v.value / maxValue) * 100 : 0,
            label: v.period?.split(' ')[1]?.split(':')[0] || v.period,
        }));

        const avgValue = values.reduce((a, v) => a + v.value, 0) / values.length;

        return { bars, maxValue, minValue, avgValue };
    }, [data]);

    const getBarColor = (value, index) => {
        if (colorScheme === 'gradient') {
            const percentage = chartData.maxValue > 0 ? (value / chartData.maxValue) * 100 : 0;
            if (percentage >= 80) return 'from-red-400 to-red-600';
            if (percentage >= 60) return 'from-yellow-400 to-yellow-600';
            if (percentage >= 40) return 'from-green-400 to-green-600';
            return 'from-blue-400 to-blue-600';
        }
        if (colorScheme === 'green') {
            return 'from-green-400 to-green-600';
        }
        // Default blue with alternating shades
        return index % 2 === 0 ? 'from-blue-400 to-blue-600' : 'from-indigo-400 to-indigo-600';
    };

    if (!data || data.length === 0) {
        return (
            <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">{title}</h3>
                <div className="flex items-center justify-center h-40 text-gray-500 dark:text-gray-400">
                    Veri yok
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    Ort: <span className="font-medium text-gray-700 dark:text-gray-300">
                        {chartData.avgValue?.toFixed(1)} {unit}
                    </span>
                </div>
            </div>

            {/* Chart container */}
            <div className="relative" style={{ height }}>
                {/* Y-axis grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    {[100, 75, 50, 25, 0].map((percent) => (
                        <div key={percent} className="flex items-center">
                            <span className="text-xs text-gray-400 w-8 text-right pr-2">
                                {((chartData.maxValue * percent) / 100).toFixed(0)}
                            </span>
                            <div className="flex-1 border-t border-gray-100 dark:border-gray-700"></div>
                        </div>
                    ))}
                </div>

                {/* Bars container */}
                <div
                    className="absolute inset-0 flex items-end justify-between gap-1 pl-10"
                    style={{ paddingBottom: '24px' }}
                >
                    {chartData.bars.slice(-12).map((bar, index) => (
                        <div
                            key={index}
                            className="flex-1 flex flex-col items-center group relative"
                        >
                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none">
                                <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg">
                                    <div className="font-medium">{bar.period}</div>
                                    <div>Değer: {bar.value.toFixed(1)} {unit}</div>
                                    {bar.min !== bar.max && (
                                        <div className="text-gray-300">
                                            Min: {bar.min.toFixed(1)} / Max: {bar.max.toFixed(1)}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Bar */}
                            <div
                                className={`w-full max-w-[40px] bg-gradient-to-t ${getBarColor(bar.value, index)} 
                  rounded-t-md transition-all duration-500 ease-out cursor-pointer
                  hover:opacity-80 hover:shadow-lg relative overflow-hidden`}
                                style={{
                                    height: `${Math.max(bar.heightPercent, 2)}%`,
                                    minHeight: '4px',
                                }}
                            >
                                {/* Shine effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                  transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

                                {/* Value on bar (for larger bars) */}
                                {bar.heightPercent > 30 && (
                                    <span className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-white font-medium opacity-80">
                                        {bar.value.toFixed(0)}
                                    </span>
                                )}
                            </div>

                            {/* X-axis label */}
                            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate w-full text-center">
                                {bar.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Stats footer */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-gradient-to-t from-blue-400 to-blue-600"></div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">{chartData.bars.length} okuma</span>
                    </div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                    <span className="text-green-500">Min: {chartData.minValue?.toFixed(1)}</span>
                    <span className="mx-2">|</span>
                    <span className="text-red-500">Max: {chartData.maxValue?.toFixed(1)}</span>
                </div>
            </div>
        </div>
    );
};

export default SensorBarChart;
