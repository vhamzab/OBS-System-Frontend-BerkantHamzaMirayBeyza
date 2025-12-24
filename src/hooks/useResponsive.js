import { useState, useEffect } from 'react';

/**
 * Custom hook for responsive design utilities
 * Provides breakpoint detection and device type info
 */
const useResponsive = () => {
    const [windowSize, setWindowSize] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 1024,
        height: typeof window !== 'undefined' ? window.innerHeight : 768,
    });

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        window.addEventListener('resize', handleResize);

        // Initial call
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Tailwind CSS breakpoints
    const breakpoints = {
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280,
        '2xl': 1536,
    };

    // Device type detection
    const isMobile = windowSize.width < breakpoints.sm;
    const isTablet = windowSize.width >= breakpoints.sm && windowSize.width < breakpoints.lg;
    const isDesktop = windowSize.width >= breakpoints.lg;

    // Breakpoint checks
    const isAbove = (breakpoint) => windowSize.width >= breakpoints[breakpoint];
    const isBelow = (breakpoint) => windowSize.width < breakpoints[breakpoint];

    // Touch device detection
    const isTouchDevice = typeof window !== 'undefined' &&
        ('ontouchstart' in window || navigator.maxTouchPoints > 0);

    // Orientation
    const isLandscape = windowSize.width > windowSize.height;
    const isPortrait = windowSize.height > windowSize.width;

    return {
        windowSize,
        breakpoints,
        isMobile,
        isTablet,
        isDesktop,
        isTouchDevice,
        isLandscape,
        isPortrait,
        isAbove,
        isBelow,
    };
};

export default useResponsive;
