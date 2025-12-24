import { useState } from 'react';
import { FiCreditCard, FiDollarSign } from 'react-icons/fi';
import Button from './Button';

import { useTranslation } from 'react-i18next';
/**
 * Payment Form Component
 */
const PaymentForm = ({ onSubmit, onCancel, minAmount = 50, loading = false }) => {
  const { t } = useTranslation();
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');

  const handleSubmit = (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount) || numAmount < minAmount) {
      return;
    }

    onSubmit({ amount: numAmount, paymentMethod });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
          <span className="w-1 h-4 bg-gradient-to-b from-primary-500 to-accent-500 rounded-full"></span>
          Tutar (₺)
        </label>
        <div className="relative group">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary-600 group-focus-within:text-primary-700 dark:text-primary-300 transition-colors">
            <FiDollarSign className="w-5 h-5" />
          </div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min={minAmount}
            step="0.01"
            placeholder={`Minimum ${minAmount} ₺`}
            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800/90 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 font-medium focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm hover:border-gray-300 dark:border-gray-600"
            required
          />
        </div>
        <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-blue-50/50 rounded-lg border border-blue-100">
          <span className="text-xs font-semibold text-blue-700">ℹ️</span>
          <p className="text-xs text-blue-700 font-medium">
            Minimum yükleme tutarı: <span className="font-bold">{minAmount} ₺</span>
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
          <span className="w-1 h-4 bg-gradient-to-b from-primary-500 to-accent-500 rounded-full"></span>
          Ödeme Yöntemi
        </label>
        <div className="space-y-3">
          <label className={`group flex items-center p-5 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
            paymentMethod === 'card' 
              ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-accent-50 shadow-lg shadow-primary-500/20 scale-[1.02]' 
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 hover:border-primary-300 hover:bg-primary-50/30 hover:shadow-md'
          }`}>
            <div className={`mr-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
              paymentMethod === 'card' 
                ? 'border-primary-600 bg-primary-600' 
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 group-hover:border-primary-400'
            }`}>
              {paymentMethod === 'card' && (
                <div className="w-2.5 h-2.5 rounded-full bg-white dark:bg-gray-800"></div>
              )}
            </div>
            <div className="flex items-center gap-3 flex-1">
              <div className={`p-2.5 rounded-lg ${
                paymentMethod === 'card' 
                  ? 'bg-primary-100 text-primary-700 dark:text-primary-300' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 group-hover:bg-primary-100 group-hover:text-primary-600'
              } transition-colors`}>
                <FiCreditCard className="w-5 h-5" />
              </div>
              <div>
                <span className={`font-bold text-base block ${
                  paymentMethod === 'card' ? 'text-primary-900 dark:text-primary-100' : 'text-gray-900 dark:text-gray-100'
                }`}>
                  Kredi/Banka Kartı
                </span>
                <span className={`text-xs mt-0.5 block ${
                  paymentMethod === 'card' ? 'text-primary-700 dark:text-primary-300' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500'
                }`}>
                  Güvenli ödeme
                </span>
              </div>
            </div>
            <input
              type="radio"
              name="paymentMethod"
              value="card"
              checked={paymentMethod === 'card'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="sr-only"
            />
          </label>
        </div>
      </div>

      <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 px-6 py-3.5 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-900 hover:border-gray-400 active:scale-95 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >{t('common.cancel')}</button>
        <button
          type="submit"
          disabled={!amount || parseFloat(amount) < minAmount || loading}
          className="flex-1 px-6 py-3.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-gray-800 dark:text-gray-100 font-bold rounded-xl shadow-lg shadow-primary-500/40 hover:shadow-xl hover:shadow-primary-500/50 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-gray-800 dark:text-gray-100" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              İşleniyor...
            </>
          ) : (
            'Ödemeye Devam Et'
          )}
        </button>
      </div>
    </form>
  );
};

export default PaymentForm;

