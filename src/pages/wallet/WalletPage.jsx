import { useState, useEffect } from 'react';
import { FiDollarSign, FiPlus, FiArrowUp, FiArrowDown, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';
import walletService from '../../services/walletService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import PaymentForm from '../../components/common/PaymentForm';

const WalletPage = () => {
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [topupLoading, setTopupLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    fetchBalance();
    fetchTransactions();
  }, []);

  const fetchBalance = async () => {
    try {
      const response = await walletService.getBalance();
      if (response.success) {
        setBalance(response.data);
      }
    } catch (error) {
      toast.error('Bakiye yüklenirken hata oluştu');
      console.error(error);
      setBalance({ balance: 0, currency: 'TRY', is_active: true });
    } finally {
      if (loading) {
        setLoading(false);
      }
    }
  };

  const fetchTransactions = async (page = 1) => {
    try {
      setTransactionsLoading(true);
      const response = await walletService.getTransactions({
        page,
        limit: pagination.limit,
      });
      if (response.success) {
        // Güvenli veri işleme - tüm transaction'ları normalize et
        const data = response.data || [];
        const normalizedTransactions = Array.isArray(data) 
          ? data.map((tx) => {
              if (!tx || typeof tx !== 'object') return null;
              return {
                id: tx.id || '',
                type: tx.type || 'debit',
                description: tx.description || 'İşlem',
                created_at: tx.created_at || new Date().toISOString(),
                amount: tx.amount != null ? (typeof tx.amount === 'number' ? tx.amount : parseFloat(tx.amount) || 0) : 0,
                balance_after: tx.balance_after != null ? (typeof tx.balance_after === 'number' ? tx.balance_after : parseFloat(tx.balance_after) || 0) : 0,
                reference_type: tx.reference_type || null,
                reference_id: tx.reference_id || null,
              };
            }).filter(tx => tx !== null)
          : [];
        setTransactions(normalizedTransactions);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      } else {
        setTransactions([]);
      }
    } catch (error) {
      toast.error('İşlem geçmişi yüklenirken hata oluştu');
      console.error('Transaction fetch error:', error);
      setTransactions([]);
    } finally {
      setTransactionsLoading(false);
      setLoading(false);
    }
  };

  const handleTopup = async ({ amount, paymentMethod }) => {
    try {
      setTopupLoading(true);
      const response = await walletService.createTopup(amount);
      if (response.success) {
        // Test modu: Direkt ödeme başarılı
        toast.success('Para yatırma işlemi başarıyla gerçekleşti');
        setShowTopupModal(false);
        setTopupLoading(false);
        // Bakiye ve işlem geçmişini arka planda yenile
        fetchBalance().catch(console.error);
        fetchTransactions().catch(console.error);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Para yükleme başarısız');
      setTopupLoading(false);
    }
  };

  const getTransactionIcon = (type) => {
    if (type === 'credit' || type === 'pending_debit') {
      return <FiArrowUp className="w-5 h-5 text-green-400" />;
    }
    return <FiArrowDown className="w-5 h-5 text-red-400" />;
  };

  const getTransactionLabel = (type) => {
    const labels = {
      credit: 'Yükleme',
      debit: 'Harcama',
      pending_debit: 'Bekleyen',
    };
    return labels[type] || type;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return '-';
    }
  };

  const formatAmount = (value) => {
    try {
      if (value == null || value === undefined || value === '') {
        return '0.00';
      }
      // String veya number kontrolü
      if (typeof value !== 'string' && typeof value !== 'number') {
        return '0.00';
      }
      const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);
      if (isNaN(numValue) || !isFinite(numValue)) {
        return '0.00';
      }
      // toFixed güvenli kullanımı
      if (typeof numValue.toFixed === 'function') {
        return numValue.toFixed(2);
      }
      return '0.00';
    } catch (error) {
      console.error('formatAmount error:', error, value);
      return '0.00';
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">Cüzdan</h1>
          <p className="text-slate-400">Bakiyenizi görüntüleyin ve para yükleyin</p>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="space-y-6">
          {/* Balance Card */}
          <div className="card bg-gradient-to-br from-blue-600 to-purple-600">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-slate-300 text-sm mb-1">Toplam Bakiye</h2>
                <p className="text-4xl font-bold text-white">
                  {formatAmount(balance?.balance)} ₺
                </p>
              </div>
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                <FiDollarSign className="w-10 h-10 text-white" />
              </div>
            </div>
            <Button
              onClick={() => setShowTopupModal(true)}
              variant="secondary"
              className="w-full"
            >
              <FiPlus className="mr-2" />
              Para Yükle
            </Button>
          </div>

          {/* Transactions */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">İşlem Geçmişi</h2>

            {transactionsLoading ? (
              <LoadingSpinner />
            ) : !transactions || !Array.isArray(transactions) || transactions.length === 0 ? (
              <div className="text-center py-12">
                <FiClock className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-400">Henüz işlem geçmişiniz yok</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions
                  .filter((transaction) => transaction && transaction.id)
                  .map((transaction) => {
                    try {
                      const amount = formatAmount(transaction?.amount || 0);
                      const balanceAfter = formatAmount(transaction?.balance_after || 0);
                      const transactionType = transaction?.type || 'debit';
                      
                      return (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className="p-2 bg-slate-600 rounded-lg">
                              {getTransactionIcon(transactionType)}
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold">{transaction.description || 'İşlem'}</div>
                              <div className="text-sm text-slate-400">
                                {formatDate(transaction.created_at)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div
                              className={`font-bold ${
                                transactionType === 'credit'
                                  ? 'text-green-400'
                                  : transactionType === 'pending_debit'
                                  ? 'text-yellow-400'
                                  : 'text-red-400'
                              }`}
                            >
                              {transactionType === 'credit' ? '+' : '-'}
                              {amount} ₺
                            </div>
                            <div className="text-xs text-slate-400">
                              Bakiye: {balanceAfter} ₺
                            </div>
                          </div>
                        </div>
                      );
                    } catch (error) {
                      console.error('Transaction render error:', error, transaction);
                      return null;
                    }
                  })}
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-700/50">
                <button
                  onClick={() => fetchTransactions(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Önceki
                </button>
                <span className="text-sm text-slate-400">
                  Sayfa {pagination.page} / {pagination.pages}
                </span>
                <button
                  onClick={() => fetchTransactions(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sonraki
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Top-up Modal */}
      {showTopupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-gradient-to-br from-white via-blue-50/30 to-accent-50/20 rounded-3xl p-8 max-w-md w-full shadow-2xl border-2 border-primary-100/50 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg">
                <FiDollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Para Yükle</h3>
                <p className="text-sm text-gray-600">Cüzdanınıza bakiye ekleyin</p>
              </div>
            </div>
            <PaymentForm
              onSubmit={handleTopup}
              onCancel={() => setShowTopupModal(false)}
              minAmount={50}
              loading={topupLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletPage;

