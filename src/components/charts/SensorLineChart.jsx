import { useMemo } from 'react';
import { FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi';

/**
 * Sensor Line Chart Component
 * Displays sensor data over time with a beautiful line chart visualization
 */
const SensorLineChart = ({
    data = [],
    title = 'Sensör Verileri',
    unit = '',
    height = 200,
    className = '',
    showLegend = true,
}) => {
    // Process data for chart
    const chartData = useMemo(() => {
        if (!data || data.length === 0) return { points: [], stats: null };

        const values = data.map(d => ({
            period: d.period,
            avg: parseFloat(d.avg_value) || 0,
            min: parseFloat(d.min_value) || 0,
            max: parseFloat(d.max_value) || 0,
            count: d.reading_count || 0,
        }));

        const allValues = values.flatMap(v => [v.avg, v.min, v.max]);
        const minValue = Math.min(...allValues);
        const maxValue = Math.max(...allValues);
        const range = maxValue - minValue || 1;
        const padding = range * 0.1;

        const chartMin = minValue - padding;
        const chartMax = maxValue + padding;
        const chartRange = chartMax - chartMin;

        const normalizedPoints = values.map((v, i) => ({
            ...v,
            x: (i / (values.length - 1 || 1)) * 100,
            yAvg: ((v.avg - chartMin) / chartRange) * 100,
            yMin: ((v.min - chartMin) / chartRange) * 100,
            yMax: ((v.max - chartMin) / chartRange) * 100,
        }));

        // Calculate trend
        const recentAvg = values.slice(-3).reduce((a, v) => a + v.avg, 0) / Math.min(3, values.length);
        const olderAvg = values.slice(0, -3).reduce((a, v) => a + v.avg, 0) / Math.max(1, values.length - 3);
        let trend = 'stable';
        if (recentAvg > olderAvg * 1.05) trend = 'up';
        else if (recentAvg < olderAvg * 0.95) trend = 'down';

        const avgAll = values.reduce((a, v) => a + v.avg, 0) / values.length;
        const minAll = Math.min(...values.map(v => v.min));
        const maxAll = Math.max(...values.map(v => v.max));

        return {
            points: normalizedPoints,
            stats: { avg: avgAll, min: minAll, max: maxAll, trend },
            chartMin,
            chartMax,
        };
    }, [data]);

    // Generate SVG path for the line
    const linePath = useMemo(() => {
        if (chartData.points.length === 0) return '';

        const points = chartData.points;
        let path = `M ${points[0].x} ${100 - points[0].yAvg}`;

        for (let i = 1; i < points.length; i++) {
            const prevPoint = points[i - 1];
            const currPoint = points[i];

            // Smooth curve using quadratic bezier
            const cpX = (prevPoint.x + currPoint.x) / 2;
            path += ` Q ${cpX} ${100 - prevPoint.yAvg} ${currPoint.x} ${100 - currPoint.yAvg}`;
        }

        return path;
    }, [chartData.points]);

    // Generate area path for gradient fill
    const areaPath = useMemo(() => {
        if (chartData.points.length === 0) return '';

        const points = chartData.points;
        let path = `M ${points[0].x} 100 L ${points[0].x} ${100 - points[0].yAvg}`;

        for (let i = 1; i < points.length; i++) {
            const prevPoint = points[i - 1];
            const currPoint = points[i];
            const cpX = (prevPoint.x + currPoint.x) / 2;
            path += ` Q ${cpX} ${100 - prevPoint.yAvg} ${currPoint.x} ${100 - currPoint.yAvg}`;
        }

        path += ` L ${points[points.length - 1].x} 100 Z`;
        return path;
    }, [chartData.points]);

    // Min/Max range area path
    const rangePath = useMemo(() => {
        if (chartData.points.length === 0) return '';

        const points = chartData.points;
        let pathTop = `M ${points[0].x} ${100 - points[0].yMax}`;
        let pathBottom = '';

        for (let i = 1; i < points.length; i++) {
            pathTop += ` L ${points[i].x} ${100 - points[i].yMax}`;
        }

        for (let i = points.length - 1; i >= 0; i--) {
            pathBottom += ` L ${points[i].x} ${100 - points[i].yMin}`;
        }

        return pathTop + pathBottom + ' Z';
    }, [chartData.points]);

    const TrendIcon = chartData.stats?.trend === 'up' ? FiTrendingUp :
        chartData.stats?.trend === 'down' ? FiTrendingDown : FiMinus;
    const trendColor = chartData.stats?.trend === 'up' ? 'text-green-500' :
        chartData.stats?.trend === 'down' ? 'text-red-500' : 'text-gray-500';

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
                <div className={`flex items-center gap-1 ${trendColor}`}>
                    <TrendIcon className="w-4 h-4" />
                    <span className="text-sm">
                        {chartData.stats?.trend === 'up' ? 'Yükseliyor' :
                            chartData.stats?.trend === 'down' ? 'Düşüyor' : 'Stabil'}
                    </span>
                </div>
            </div>

            {/* Stats summary */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        {chartData.stats?.avg?.toFixed(1)} {unit}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Ortalama</p>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-xl font-bold text-green-600 dark:text-green-400">
                        {chartData.stats?.min?.toFixed(1)} {unit}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Minimum</p>
                </div>
                <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <p className="text-xl font-bold text-red-600 dark:text-red-400">
                        {chartData.stats?.max?.toFixed(1)} {unit}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Maksimum</p>
                </div>
            </div>

            {/* Chart */}
            <div className="relative" style={{ height }}>
                <svg
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    className="w-full h-full overflow-visible"
                >
                    <defs>
                        {/* Gradient for area fill */}
                        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                        </linearGradient>
                        {/* Gradient for range fill */}
                        <linearGradient id="rangeGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10B981" stopOpacity="0.15" />
                            <stop offset="100%" stopColor="#EF4444" stopOpacity="0.15" />
                        </linearGradient>
                    </defs>

                    {/* Grid lines */}
                    {[0, 25, 50, 75, 100].map(y => (
                        <line
                            key={y}
                            x1="0"
                            y1={y}
                            x2="100"
                            y2={y}
                            stroke="currentColor"
                            strokeOpacity="0.1"
                            strokeWidth="0.5"
                            className="text-gray-400"
                        />
                    ))}

                    {/* Min/Max range area */}
                    <path
                        d={rangePath}
                        fill="url(#rangeGradient)"
                        className="transition-all duration-500"
                    />

                    {/* Area fill */}
                    <path
                        d={areaPath}
                        fill="url(#areaGradient)"
                        className="transition-all duration-500"
                    />

                    {/* Main line */}
                    <path
                        d={linePath}
                        fill="none"
                        stroke="#3B82F6"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="transition-all duration-500"
                        style={{
                            filter: 'drop-shadow(0 2px 4px rgba(59, 130, 246, 0.3))'
                        }}
                    />

                    {/* Data points */}
                    {chartData.points.map((point, i) => (
                        <g key={i}>
                            <circle
                                cx={point.x}
                                cy={100 - point.yAvg}
                                r="1.5"
                                fill="#3B82F6"
                                className="transition-all duration-300 hover:r-[3]"
                            />
                            {/* Hover area with tooltip simulation */}
                            <circle
                                cx={point.x}
                                cy={100 - point.yAvg}
                                r="4"
                                fill="transparent"
                                className="cursor-pointer"
                            >
                                <title>{`${point.period}\nOrt: ${point.avg.toFixed(1)} ${unit}\nMin: ${point.min.toFixed(1)} ${unit}\nMax: ${point.max.toFixed(1)} ${unit}`}</title>
                            </circle>
                        </g>
                    ))}
                </svg>

                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 dark:text-gray-400 -ml-8">
                    <span>{chartData.chartMax?.toFixed(0)}</span>
                    <span>{((chartData.chartMax + chartData.chartMin) / 2)?.toFixed(0)}</span>
                    <span>{chartData.chartMin?.toFixed(0)}</span>
                </div>
            </div>

            {/* X-axis labels */}
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2 px-2">
                {chartData.points.length > 0 && (
                    <>
                        <span>{chartData.points[0].period?.split(' ')[1] || chartData.points[0].period}</span>
                        {chartData.points.length > 4 && (
                            <span>{chartData.points[Math.floor(chartData.points.length / 2)].period?.split(' ')[1] || ''}</span>
                        )}
                        <span>{chartData.points[chartData.points.length - 1].period?.split(' ')[1] || chartData.points[chartData.points.length - 1].period}</span>
                    </>
                )}
            </div>

            {/* Legend */}
            {showLegend && (
                <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">Ortalama</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-b from-green-500 to-red-500 opacity-30"></div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">Min-Max Aralığı</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SensorLineChart;
