import { useMemo } from 'react';

/**
 * Sensor Gauge Chart Component
 * Displays sensor value as a circular gauge with threshold colors
 */
const SensorGaugeChart = ({
    value = 0,
    min = 0,
    max = 100,
    unit = '',
    title = 'Sensör',
    thresholds = { warning: 70, danger: 90 },
    size = 160,
    className = '',
}) => {
    const gaugeData = useMemo(() => {
        const range = max - min;
        const normalizedValue = Math.min(Math.max((value - min) / range, 0), 1);
        const angle = normalizedValue * 180; // 180 degree arc

        // Determine color based on thresholds
        let color = '#10B981'; // green
        let colorClass = 'text-green-500';
        let bgClass = 'bg-green-50 dark:bg-green-900/20';
        let status = 'Normal';

        const percentage = normalizedValue * 100;
        if (percentage >= thresholds.danger) {
            color = '#EF4444'; // red
            colorClass = 'text-red-500';
            bgClass = 'bg-red-50 dark:bg-red-900/20';
            status = 'Kritik';
        } else if (percentage >= thresholds.warning) {
            color = '#F59E0B'; // yellow
            colorClass = 'text-yellow-500';
            bgClass = 'bg-yellow-50 dark:bg-yellow-900/20';
            status = 'Uyarı';
        }

        return {
            normalizedValue,
            angle,
            color,
            colorClass,
            bgClass,
            status,
            percentage,
        };
    }, [value, min, max, thresholds]);

    // Calculate arc path
    const createArc = (startAngle, endAngle, radius) => {
        const startRad = (startAngle - 180) * (Math.PI / 180);
        const endRad = (endAngle - 180) * (Math.PI / 180);

        const startX = 50 + radius * Math.cos(startRad);
        const startY = 50 + radius * Math.sin(startRad);
        const endX = 50 + radius * Math.cos(endRad);
        const endY = 50 + radius * Math.sin(endRad);

        const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

        return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`;
    };

    const backgroundArc = createArc(0, 180, 40);
    const valueArc = createArc(0, gaugeData.angle, 40);

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 text-center mb-2">{title}</h4>

            <div className="relative flex items-center justify-center" style={{ height: size * 0.6 }}>
                <svg
                    viewBox="0 0 100 60"
                    className="w-full"
                    style={{ maxWidth: size }}
                >
                    <defs>
                        {/* Gradient for the gauge */}
                        <linearGradient id={`gaugeGradient-${title}`} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#10B981" />
                            <stop offset="50%" stopColor="#F59E0B" />
                            <stop offset="100%" stopColor="#EF4444" />
                        </linearGradient>

                        {/* Glow filter */}
                        <filter id={`glow-${title}`} x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Background arc */}
                    <path
                        d={backgroundArc}
                        fill="none"
                        stroke="currentColor"
                        strokeOpacity="0.1"
                        strokeWidth="8"
                        strokeLinecap="round"
                        className="text-gray-400"
                    />

                    {/* Tick marks */}
                    {[0, 45, 90, 135, 180].map((angle) => {
                        const rad = (angle - 180) * (Math.PI / 180);
                        const innerR = 32;
                        const outerR = 35;
                        const x1 = 50 + innerR * Math.cos(rad);
                        const y1 = 50 + innerR * Math.sin(rad);
                        const x2 = 50 + outerR * Math.cos(rad);
                        const y2 = 50 + outerR * Math.sin(rad);
                        return (
                            <line
                                key={angle}
                                x1={x1}
                                y1={y1}
                                x2={x2}
                                y2={y2}
                                stroke="currentColor"
                                strokeOpacity="0.3"
                                strokeWidth="1"
                                className="text-gray-500"
                            />
                        );
                    })}

                    {/* Value arc */}
                    <path
                        d={valueArc}
                        fill="none"
                        stroke={gaugeData.color}
                        strokeWidth="8"
                        strokeLinecap="round"
                        filter={`url(#glow-${title})`}
                        style={{
                            transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                    />

                    {/* Center needle */}
                    <g style={{
                        transform: `rotate(${gaugeData.angle - 90}deg)`,
                        transformOrigin: '50px 50px',
                        transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}>
                        <line
                            x1="50"
                            y1="50"
                            x2="50"
                            y2="18"
                            stroke={gaugeData.color}
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                        <circle
                            cx="50"
                            cy="50"
                            r="4"
                            fill={gaugeData.color}
                        />
                    </g>

                    {/* Min/Max labels */}
                    <text x="8" y="55" fontSize="6" fill="currentColor" className="text-gray-500">
                        {min}
                    </text>
                    <text x="85" y="55" fontSize="6" fill="currentColor" className="text-gray-500">
                        {max}
                    </text>
                </svg>

                {/* Value display */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-center">
                    <span className={`text-2xl font-bold ${gaugeData.colorClass}`}>
                        {value?.toFixed?.(1) || value}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">{unit}</span>
                </div>
            </div>

            {/* Status badge */}
            <div className={`text-center mt-2 py-1 px-3 rounded-full ${gaugeData.bgClass} inline-flex items-center justify-center w-full`}>
                <span className={`text-xs font-medium ${gaugeData.colorClass}`}>
                    {gaugeData.status}
                </span>
            </div>
        </div>
    );
};

export default SensorGaugeChart;
