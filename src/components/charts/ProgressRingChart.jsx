import { useMemo } from 'react';

/**
 * Progress Ring Chart Component
 * Displays a circular progress indicator with percentage
 */
const ProgressRingChart = ({
    value = 0,
    max = 100,
    size = 120,
    strokeWidth = 12,
    title = '',
    subtitle = '',
    className = '',
    colorThresholds = { success: 70, warning: 40 }, // percentages
    showValue = true,
    valueFormatter = (val) => `${val}%`,
}) => {
    const chartData = useMemo(() => {
        const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;

        let color = '#EF4444'; // red (danger)
        let colorClass = 'text-red-500';
        if (percentage >= colorThresholds.success) {
            color = '#10B981'; // green (success)
            colorClass = 'text-emerald-500';
        } else if (percentage >= colorThresholds.warning) {
            color = '#F59E0B'; // yellow (warning)
            colorClass = 'text-amber-500';
        }

        return { percentage, color, colorClass };
    }, [value, max, colorThresholds]);

    const center = size / 2;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (chartData.percentage / 100) * circumference;

    return (
        <div className={`flex flex-col items-center ${className}`}>
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="transform -rotate-90">
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

                    {/* Progress circle */}
                    <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="none"
                        stroke={chartData.color}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-1000 ease-out"
                        style={{
                            filter: `drop-shadow(0 2px 4px ${chartData.color}40)`,
                        }}
                    />
                </svg>

                {/* Center content */}
                {showValue && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-2xl font-bold ${chartData.colorClass}`}>
                            {valueFormatter(chartData.percentage.toFixed(0))}
                        </span>
                    </div>
                )}
            </div>

            {/* Labels */}
            {(title || subtitle) && (
                <div className="mt-3 text-center">
                    {title && (
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{title}</p>
                    )}
                    {subtitle && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProgressRingChart;
