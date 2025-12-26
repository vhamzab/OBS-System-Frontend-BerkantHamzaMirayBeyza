import { useMemo } from 'react';

/**
 * Stats Card Chart Component
 * Displays a statistic with a visual indicator
 */
const StatsCardChart = ({
    value = 0,
    label = '',
    icon: Icon = null,
    trend = null, // { value: number, direction: 'up' | 'down' }
    color = 'blue', // blue, green, red, yellow, purple, orange
    size = 'md', // sm, md, lg
    className = '',
    valueFormatter = (val) => val,
}) => {
    const colorClasses = {
        blue: {
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            icon: 'bg-blue-500',
            text: 'text-blue-600 dark:text-blue-400',
            border: 'border-blue-200 dark:border-blue-800',
        },
        green: {
            bg: 'bg-emerald-50 dark:bg-emerald-900/20',
            icon: 'bg-emerald-500',
            text: 'text-emerald-600 dark:text-emerald-400',
            border: 'border-emerald-200 dark:border-emerald-800',
        },
        red: {
            bg: 'bg-red-50 dark:bg-red-900/20',
            icon: 'bg-red-500',
            text: 'text-red-600 dark:text-red-400',
            border: 'border-red-200 dark:border-red-800',
        },
        yellow: {
            bg: 'bg-amber-50 dark:bg-amber-900/20',
            icon: 'bg-amber-500',
            text: 'text-amber-600 dark:text-amber-400',
            border: 'border-amber-200 dark:border-amber-800',
        },
        purple: {
            bg: 'bg-purple-50 dark:bg-purple-900/20',
            icon: 'bg-purple-500',
            text: 'text-purple-600 dark:text-purple-400',
            border: 'border-purple-200 dark:border-purple-800',
        },
        orange: {
            bg: 'bg-orange-50 dark:bg-orange-900/20',
            icon: 'bg-orange-500',
            text: 'text-orange-600 dark:text-orange-400',
            border: 'border-orange-200 dark:border-orange-800',
        },
    };

    const sizeClasses = {
        sm: {
            padding: 'p-4',
            iconSize: 'p-2',
            iconText: 'text-lg',
            valueText: 'text-2xl',
            labelText: 'text-xs',
        },
        md: {
            padding: 'p-5',
            iconSize: 'p-3',
            iconText: 'text-xl',
            valueText: 'text-3xl',
            labelText: 'text-sm',
        },
        lg: {
            padding: 'p-6',
            iconSize: 'p-4',
            iconText: 'text-2xl',
            valueText: 'text-4xl',
            labelText: 'text-base',
        },
    };

    const colors = colorClasses[color] || colorClasses.blue;
    const sizes = sizeClasses[size] || sizeClasses.md;

    return (
        <div className={`
      ${colors.bg} ${colors.border} border rounded-xl ${sizes.padding}
      transition-all duration-300 hover:shadow-lg hover:scale-[1.02]
      ${className}
    `}>
            <div className="flex items-start justify-between">
                <div>
                    <p className={`${sizes.labelText} text-gray-600 dark:text-gray-400 mb-1`}>
                        {label}
                    </p>
                    <p className={`${sizes.valueText} font-bold ${colors.text}`}>
                        {valueFormatter(value)}
                    </p>

                    {trend && (
                        <div className={`flex items-center gap-1 mt-2 text-xs ${trend.direction === 'up' ? 'text-emerald-500' : 'text-red-500'
                            }`}>
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {trend.direction === 'up' ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                                )}
                            </svg>
                            <span>{trend.value}%</span>
                        </div>
                    )}
                </div>

                {Icon && (
                    <div className={`${sizes.iconSize} ${colors.icon} rounded-xl`}>
                        <Icon className={`${sizes.iconText} text-white`} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatsCardChart;
