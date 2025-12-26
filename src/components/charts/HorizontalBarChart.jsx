import { useMemo } from 'react';

/**
 * Horizontal Bar Chart Component
 * Displays data as horizontal bars with labels
 */
const HorizontalBarChart = ({
    data = [],
    title = '',
    valueKey = 'value',
    labelKey = 'label',
    maxValue = null,
    height = 'auto',
    className = '',
    colorScheme = 'blue', // blue, green, gradient, rainbow
    showValues = true,
    valueFormatter = (val) => val,
}) => {
    const chartData = useMemo(() => {
        if (!data || data.length === 0) return { bars: [], max: 0 };

        const values = data.map(d => parseFloat(d[valueKey]) || 0);
        const max = maxValue || Math.max(...values, 1);

        const colors = {
            blue: ['from-blue-400 to-blue-600', 'from-blue-500 to-blue-700'],
            green: ['from-emerald-400 to-emerald-600', 'from-emerald-500 to-emerald-700'],
            gradient: ['from-blue-400 to-purple-600', 'from-purple-400 to-pink-600'],
            rainbow: [
                'from-blue-400 to-blue-600',
                'from-green-400 to-green-600',
                'from-yellow-400 to-yellow-600',
                'from-orange-400 to-orange-600',
                'from-red-400 to-red-600',
                'from-purple-400 to-purple-600',
            ],
        };

        const bars = data.map((item, index) => {
            const value = parseFloat(item[valueKey]) || 0;
            const percentage = (value / max) * 100;

            let colorClass;
            if (colorScheme === 'rainbow') {
                colorClass = colors.rainbow[index % colors.rainbow.length];
            } else {
                colorClass = colors[colorScheme]?.[index % 2] || colors.blue[0];
            }

            return {
                label: item[labelKey] || `Item ${index + 1}`,
                value,
                percentage,
                colorClass,
                extra: item,
            };
        });

        return { bars, max };
    }, [data, valueKey, labelKey, maxValue, colorScheme]);

    if (!data || data.length === 0) {
        return (
            <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
                {title && <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">{title}</h3>}
                <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400">
                    Veri yok
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
            {title && <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6">{title}</h3>}

            <div className="space-y-4" style={{ height: height !== 'auto' ? height : undefined }}>
                {chartData.bars.map((bar, index) => (
                    <div key={index} className="group">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[60%]">
                                {bar.label}
                            </span>
                            {showValues && (
                                <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
                                    {valueFormatter(bar.value)}
                                </span>
                            )}
                        </div>
                        <div className="relative h-8 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                            <div
                                className={`absolute inset-y-0 left-0 bg-gradient-to-r ${bar.colorClass} 
                  rounded-lg transition-all duration-700 ease-out group-hover:opacity-90`}
                                style={{ width: `${Math.max(bar.percentage, 2)}%` }}
                            >
                                {/* Shine effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                  transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            </div>

                            {/* Percentage indicator inside bar */}
                            {bar.percentage > 15 && (
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-white/80">
                                    {bar.percentage.toFixed(0)}%
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HorizontalBarChart;
