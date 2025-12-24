import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { FiAlertTriangle, FiX, FiTrash2, FiCheck } from 'react-icons/fi';

/**
 * ConfirmDialog - A reusable confirmation modal component
 * Features: Focus trap, ESC to close, accessible, customizable
 */
const ConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Onay',
    message = 'Bu işlemi gerçekleştirmek istediğinizden emin misiniz?',
    confirmText = 'Onayla',
    cancelText = 'İptal',
    variant = 'danger', // 'danger' | 'warning' | 'info'
    loading = false,
}) => {
    const dialogRef = useRef(null);
    const confirmButtonRef = useRef(null);
    const previousActiveElement = useRef(null);

    // Save previously focused element and focus the dialog when opened
    useEffect(() => {
        if (isOpen) {
            previousActiveElement.current = document.activeElement;
            // Focus the cancel button first for safety
            setTimeout(() => {
                confirmButtonRef.current?.focus();
            }, 0);
        } else if (previousActiveElement.current) {
            previousActiveElement.current.focus();
        }
    }, [isOpen]);

    // Handle ESC key to close
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpen) return;

            if (e.key === 'Escape') {
                onClose();
            }

            // Focus trap
            if (e.key === 'Tab' && dialogRef.current) {
                const focusableElements = dialogRef.current.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement?.focus();
                } else if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement?.focus();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const handleConfirm = useCallback(() => {
        if (!loading) {
            onConfirm();
        }
    }, [loading, onConfirm]);

    const handleBackdropClick = useCallback((e) => {
        if (e.target === e.currentTarget && !loading) {
            onClose();
        }
    }, [loading, onClose]);

    if (!isOpen) return null;

    const variantStyles = {
        danger: {
            icon: FiTrash2,
            iconBg: 'bg-red-100 dark:bg-red-900/30',
            iconColor: 'text-red-500 dark:text-red-400',
            confirmBtn: 'bg-red-500 hover:bg-red-600 text-white',
        },
        warning: {
            icon: FiAlertTriangle,
            iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
            iconColor: 'text-yellow-500 dark:text-yellow-400',
            confirmBtn: 'bg-yellow-500 hover:bg-yellow-600 text-white',
        },
        info: {
            icon: FiCheck,
            iconBg: 'bg-blue-100 dark:bg-blue-900/30',
            iconColor: 'text-blue-500 dark:text-blue-400',
            confirmBtn: 'bg-blue-500 hover:bg-blue-600 text-white',
        },
    };

    const style = variantStyles[variant] || variantStyles.danger;
    const Icon = style.icon;

    const modalContent = (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={handleBackdropClick}
            role="presentation"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                aria-hidden="true"
            />

            {/* Dialog */}
            <div
                ref={dialogRef}
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="confirm-dialog-title"
                aria-describedby="confirm-dialog-description"
                className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6 transform transition-all"
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    disabled={loading}
                    className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    aria-label="Kapat"
                >
                    <FiX className="w-5 h-5" />
                </button>

                {/* Icon */}
                <div className={`w-12 h-12 rounded-full ${style.iconBg} flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 ${style.iconColor}`} />
                </div>

                {/* Title */}
                <h2
                    id="confirm-dialog-title"
                    className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2"
                >
                    {title}
                </h2>

                {/* Message */}
                <p
                    id="confirm-dialog-description"
                    className="text-gray-600 dark:text-gray-300 mb-6"
                >
                    {message}
                </p>

                {/* Actions */}
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 rounded-lg font-medium bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 transition-colors disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        ref={confirmButtonRef}
                        onClick={handleConfirm}
                        disabled={loading}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2 ${style.confirmBtn}`}
                    >
                        {loading && (
                            <svg className="animate-spin h-4 w-4\" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        )}
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

ConfirmDialog.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    title: PropTypes.string,
    message: PropTypes.string,
    confirmText: PropTypes.string,
    cancelText: PropTypes.string,
    variant: PropTypes.oneOf(['danger', 'warning', 'info']),
    loading: PropTypes.bool,
};

export default ConfirmDialog;
