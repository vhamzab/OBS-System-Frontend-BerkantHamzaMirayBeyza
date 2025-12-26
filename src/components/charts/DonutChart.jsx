import { useMemo } from 'react';

/**
 * Donut Chart Component
 * Displays data as a donut/pie chart with customizable options
 */
const DonutChart = ({
    data = [],
    title = '',
    valueKey = 'value',
    labelKey = 'label',
    size = 200,
    strokeWidth = 40,
    className = '',
    showLegend = true,
    showTotal = true,
    totalLabel = 'Toplam',
    colors = null,
}) => {
    const defaultColors = [
        '#3B82F6', // blue
        '#10B981', // green
        '#F59E0B', // amber
        '#EF4444', // red
        '#8B5CF6', // purple
        '#EC4899', // pink
        '#06B6D4', // cyan
        '#84CC16', // lime
    ];

    const chartData = useMemo(() => {
        if (!data || data.length === 0) return { segments: [], total: 0 };

        const total = data.reduce((sum, item) => sum + (parseFloat(item[valueKey]) || 0), 0);
        const colorPalette = colors || defaultColors;

        let currentAngle = -90; // Start from top
        const segments = data.map((item, index) => {
            const value = parseFloat(item[valueKey]) || 0;
            const percentage = total > 0 ? (value / total) * 100 : 0;
            const angle = (percentage / 100) * 360;

            const segment = {
                label: item[labelKey] || `Item ${index + 1}`,
                value,
                percentage,
                startAngle: currentAngle,
                endAngle: currentAngle + angle,
                color: colorPalette[index % colorPalette.length],
                extra: item,
            };

            currentAngle += angle;
            return segment;
        });

        return { segments, total };
    }, [data, valueKey, labelKey, colors]);

    // Convert angle to SVG arc path
    const describeArc = (cx, cy, radius, startAngle, endAngle) => {
        const start = polarToCartesian(cx, cy, radius, endAngle);
        const end = polarToCartesian(cx, cy, radius, startAngle);
        const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

        return [
            'M', start.x, start.y,
            'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
        ].join(' ');
    };

    const polarToCartesian = (cx, cy, radius, angleInDegrees) => {
        const angleInRadians = (angleInDegrees * Math.PI) / 180;
        return {
            x: cx + radius * Math.cos(angleInRadians),
            y: cy + radius * Math.sin(angleInRadians),
        };
    };

    if (!data || data.length === 0) {
        return (
            <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
                {title && <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">{title}</h3>}
                <div className="flex items-center justify-center h-48 text-gray-500 dark:text-gray-400">
                    Veri yok
                </div>
            </div>
        );
    }

    const center = size / 2;
    const radius = (size - strokeWidth) / 2;

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
            {title && <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">{title}</h3>}

            <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Chart */}
                <div className="relative" style={{ width: size, height: size }}>
                    <svg width={size} height={size} className="transform -rotate-0">
                        {/* Background circle */}
                        <circle
                            cx={center}
                            cy={center}
                            r={radius}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={strokeWidth}
                            className="text-gray-100 dark:text-gray-700"
                        />

                        {/* Data segments */}
                        {chartData.segments.map((segment, index) => (
                            <path
                                key={index}
                                d={describeArc(center, center, radius, segment.startAngle, segment.endAngle - 0.5)}
                                fill="none"
                                stroke={segment.color}
                                strokeWidth={strokeWidth}
                                strokeLinecap="round"
                                className="transition-all duration-500 hover:opacity-80"
                                style={{
                                    filter: `drop-shadow(0 2px 4px ${segment.color}40)`,
                                }}
                            >
                                <title>{`${segment.label}: ${segment.value} (${segment.percentage.toFixed(1)}%)`}</title>
                            </path>
                        ))}
                    </svg>

                    {/* Center content */}
                    {showTotal && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                                {chartData.total}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                {totalLabel}
                            </span>
                        </div>
                    )}
                </div>

                {/* Legend */}
                {showLegend && (
                    <div className="flex-1 space-y-2">
                        {chartData.segments.map((segment, index) => (
                            <div key={index} className="flex items-center gap-3 group cursor-pointer">
                                <div
                                    className="w-4 h-4 rounded-full flex-shrink-0 transition-transform group-hover:scale-110"
                                    style={{ backgroundColor: segment.color }}
                                ></div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                                            {segment.label}
                                        </span>
                                        <span className="text-sm font-medium text-gray-800 dark:text-gray-100 ml-2">
                                            {segment.value}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {segment.percentage.toFixed(1)}%
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DonutChart;
