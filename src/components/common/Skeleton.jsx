import PropTypes from 'prop-types';

/**
 * Base Skeleton component with pulse animation
 */
const SkeletonBase = ({ className = '', style = {} }) => (
    <div
        className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
        style={style}
    />
);

/**
 * Text skeleton - for single lines of text
 */
export const SkeletonText = ({
    width = '100%',
    height = '1rem',
    className = ''
}) => (
    <SkeletonBase
        className={className}
        style={{ width, height }}
    />
);

SkeletonText.propTypes = {
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    className: PropTypes.string,
};

/**
 * Avatar skeleton - circular placeholder for profile images
 */
export const SkeletonAvatar = ({
    size = 40,
    className = ''
}) => (
    <SkeletonBase
        className={`rounded-full ${className}`}
        style={{ width: size, height: size }}
    />
);

SkeletonAvatar.propTypes = {
    size: PropTypes.number,
    className: PropTypes.string,
};

/**
 * Card skeleton - placeholder for card components
 */
export const SkeletonCard = ({
    height = 200,
    className = ''
}) => (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 ${className}`}>
        <SkeletonBase className="w-full mb-4" style={{ height: '120px' }} />
        <SkeletonBase className="w-3/4 mb-2" style={{ height: '1rem' }} />
        <SkeletonBase className="w-1/2" style={{ height: '0.875rem' }} />
    </div>
);

SkeletonCard.propTypes = {
    height: PropTypes.number,
    className: PropTypes.string,
};

/**
 * Table skeleton - placeholder for table rows
 */
export const SkeletonTable = ({
    rows = 5,
    columns = 4,
    className = ''
}) => (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden ${className}`}>
        {/* Header */}
        <div className="flex gap-4 p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
            {Array.from({ length: columns }).map((_, i) => (
                <SkeletonBase
                    key={`header-${i}`}
                    className="flex-1"
                    style={{ height: '1rem' }}
                />
            ))}
        </div>
        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
            <div
                key={`row-${rowIndex}`}
                className="flex gap-4 p-4 border-b border-gray-100 dark:border-gray-700/50"
            >
                {Array.from({ length: columns }).map((_, colIndex) => (
                    <SkeletonBase
                        key={`cell-${rowIndex}-${colIndex}`}
                        className="flex-1"
                        style={{ height: '0.875rem' }}
                    />
                ))}
            </div>
        ))}
    </div>
);

SkeletonTable.propTypes = {
    rows: PropTypes.number,
    columns: PropTypes.number,
    className: PropTypes.string,
};

/**
 * List skeleton - placeholder for list items
 */
export const SkeletonList = ({
    items = 5,
    showAvatar = true,
    className = ''
}) => (
    <div className={`space-y-4 ${className}`}>
        {Array.from({ length: items }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl">
                {showAvatar && <SkeletonAvatar size={48} />}
                <div className="flex-1 space-y-2">
                    <SkeletonBase style={{ width: '60%', height: '1rem' }} />
                    <SkeletonBase style={{ width: '40%', height: '0.75rem' }} />
                </div>
            </div>
        ))}
    </div>
);

SkeletonList.propTypes = {
    items: PropTypes.number,
    showAvatar: PropTypes.bool,
    className: PropTypes.string,
};

/**
 * Dashboard skeleton - for dashboard page loading
 */
export const SkeletonDashboard = ({ className = '' }) => (
    <div className={`space-y-6 ${className}`}>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4">
                    <SkeletonBase className="w-10 h-10 rounded-lg mb-3" />
                    <SkeletonBase className="w-1/2 h-3 mb-2" />
                    <SkeletonBase className="w-3/4 h-6" />
                </div>
            ))}
        </div>

        {/* Chart Area */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
            <SkeletonBase className="w-1/4 h-5 mb-4" />
            <SkeletonBase className="w-full h-64" />
        </div>

        {/* Table */}
        <SkeletonTable rows={5} columns={5} />
    </div>
);

SkeletonDashboard.propTypes = {
    className: PropTypes.string,
};

/**
 * Page skeleton - generic page loading placeholder
 */
export const SkeletonPage = ({ className = '' }) => (
    <div className={`space-y-6 ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between">
            <div className="space-y-2">
                <SkeletonBase className="w-48 h-8" />
                <SkeletonBase className="w-72 h-4" />
            </div>
            <SkeletonBase className="w-32 h-10 rounded-lg" />
        </div>

        {/* Content */}
        <SkeletonCard height={400} />
    </div>
);

SkeletonPage.propTypes = {
    className: PropTypes.string,
};

// Default export for convenience
const Skeleton = {
    Text: SkeletonText,
    Avatar: SkeletonAvatar,
    Card: SkeletonCard,
    Table: SkeletonTable,
    List: SkeletonList,
    Dashboard: SkeletonDashboard,
    Page: SkeletonPage,
};

export default Skeleton;
