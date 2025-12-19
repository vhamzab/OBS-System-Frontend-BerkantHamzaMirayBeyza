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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Tutar (TRY)
        </label>
        <div className="relative">
          <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min={minAmount}
            step="0.01"
            placeholder={`Minimum ${minAmount} TRY`}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Minimum yükleme tutarı: {minAmount} TRY
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Ödeme Yöntemi
        </label>
        <div className="space-y-2">
          <label className="flex items-center p-3 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
            <input
              type="radio"
              name="paymentMethod"
              value="card"
              checked={paymentMethod === 'card'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mr-3"
            />
            <FiCreditCard className="mr-2" />
            <span>Kredi/Banka Kartı</span>
          </label>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={loading}
          className="flex-1"
        >
          İptal
        </Button>
        <Button
          type="submit"
          loading={loading}
          disabled={!amount || parseFloat(amount) < minAmount}
          className="flex-1"
        >
          Ödemeye Devam Et
        </Button>
      </div>
    </form>
  );
};

export default PaymentForm;

