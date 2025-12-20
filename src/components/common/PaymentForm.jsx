import { useState } from 'react';
import { FiCreditCard, FiDollarSign } from 'react-icons/fi';
import Button from './Button';

/**
 * Payment Form Component
 */
const PaymentForm = ({ onSubmit, onCancel, minAmount = 50, loading = false }) => {
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
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          Tutar (TRY)
        </label>
        <div className="relative">
          <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min={minAmount}
            step="0.01"
            placeholder={`Minimum ${minAmount} TRY`}
            className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
            required
          />
        </div>
        <p className="mt-2 text-xs text-gray-600 font-medium">
          Minimum yükleme tutarı: {minAmount} TRY
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          Ödeme Yöntemi
        </label>
        <div className="space-y-2">
          <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
            paymentMethod === 'card' 
              ? 'border-primary-500 bg-primary-50' 
              : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
          }`}>
            <input
              type="radio"
              name="paymentMethod"
              value="card"
              checked={paymentMethod === 'card'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mr-3 w-4 h-4 text-primary-600 focus:ring-primary-500"
            />
            <FiCreditCard className={`mr-2 ${paymentMethod === 'card' ? 'text-primary-600' : 'text-gray-600'}`} />
            <span className={`font-medium ${paymentMethod === 'card' ? 'text-primary-800' : 'text-gray-800'}`}>
              Kredi/Banka Kartı
            </span>
          </label>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 font-semibold"
        >
          İptal
        </Button>
        <Button
          type="submit"
          loading={loading}
          disabled={!amount || parseFloat(amount) < minAmount}
          className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow-lg shadow-primary-500/30"
        >
          Ödemeye Devam Et
        </Button>
      </div>
    </form>
  );
};

export default PaymentForm;

