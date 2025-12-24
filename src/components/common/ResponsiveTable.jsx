import PropTypes from 'prop-types';

/**
 * ResponsiveTable - A wrapper component for tables that handles
 * horizontal scrolling on mobile and provides card-style view option
 */
const ResponsiveTable = ({
    children,
    className = '',
    mobileCardView = false,
    cardData = [],
    cardRenderer = null,
}) => {
    // Default table wrapper with horizontal scroll
    if (!mobileCardView) {
        return (
            <div className={`overflow-x-auto -mx-4 sm:mx-0 ${className}`}>
                <div className="inline-block min-w-full align-middle">
                    <div className="overflow-hidden border border-gray-200 dark:border-gray-700 sm:rounded-lg">
                        {children}
                    </div>
                </div>
            </div>
        );
    }

    // Card view for mobile + table for desktop
    return (
        <>
            {/* Desktop Table View */}
            <div className={`hidden md:block overflow-x-auto ${className}`}>
                <div className="inline-block min-w-full align-middle">
                    <div className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg">
                        {children}
                    </div>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
                {cardData.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        Veri bulunamadı
                    </div>
                ) : (
                    cardData.map((item, index) => (
                        <div
                            key={item.id || index}
                            className="card p-4 space-y-2"
                        >
                            {cardRenderer ? cardRenderer(item) : (
                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                    {JSON.stringify(item)}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </>
    );
};

/**
 * ResponsiveTableHead - Table header with better mobile visibility
 */
const ResponsiveTableHead = ({ children, className = '' }) => (
    <thead className={`bg-gray-50 dark:bg-gray-800 ${className}`}>
        {children}
    </thead>
);

/**
 * ResponsiveTableRow - Table row with responsive styling
 */
const ResponsiveTableRow = ({ children, className = '', onClick }) => (
    <tr
        className={`
      border-b border-gray-200 dark:border-gray-700 
      hover:bg-gray-50 dark:hover:bg-gray-800/50 
      transition-colors
      ${onClick ? 'cursor-pointer' : ''}
      ${className}
    `}
        onClick={onClick}
    >
        {children}
    </tr>
);

/**
 * ResponsiveTableCell - Table cell with mobile-friendly padding
 */
const ResponsiveTableCell = ({
    children,
    className = '',
    isHeader = false,
    hideOnMobile = false,
    priority = 'normal', // 'high' | 'normal' | 'low'
}) => {
    const Tag = isHeader ? 'th' : 'td';

    const priorityClasses = {
        high: '', // Always visible
        normal: hideOnMobile ? 'hidden sm:table-cell' : '',
        low: 'hidden lg:table-cell',
    };

    return (
        <Tag
            className={`
        px-3 py-3 sm:px-4 sm:py-4
        text-sm
        ${isHeader ? 'font-semibold text-gray-700 dark:text-gray-300 text-left' : 'text-gray-600 dark:text-gray-400'}
        ${priorityClasses[priority]}
        ${className}
      `}
        >
            {children}
        </Tag>
    );
};

ResponsiveTable.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    mobileCardView: PropTypes.bool,
    cardData: PropTypes.array,
    cardRenderer: PropTypes.func,
};

ResponsiveTableHead.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
};

ResponsiveTableRow.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    onClick: PropTypes.func,
};

ResponsiveTableCell.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    isHeader: PropTypes.bool,
    hideOnMobile: PropTypes.bool,
    priority: PropTypes.oneOf(['high', 'normal', 'low']),
};

export {
    ResponsiveTable,
    ResponsiveTableHead,
    ResponsiveTableRow,
    ResponsiveTableCell
};

export default ResponsiveTable;
