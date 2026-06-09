import { useEffect, useMemo, useState } from 'react';
import { getFedaPayTransactions, FedaPayTransactionRecord } from '../api';

const formatFCFA = (value: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    maximumFractionDigits: 0,
  }).format(value);
};

const statusLabels: Record<string, string> = {
  pending: 'En attente',
  completed: 'Complété',
  failed: 'Échoué',
  canceled: 'Annulé',
  declined: 'Refusé',
};

const FedaPayAdminDashboard = () => {
  const [transactions, setTransactions] = useState<FedaPayTransactionRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const loadTransactions = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getFedaPayTransactions();
      setTransactions(result);
    } catch (err: any) {
      setError(err?.message || 'Impossible de charger les transactions FedaPay.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const summary = useMemo(() => {
    const totalAmount = transactions.reduce((sum, item) => sum + (item.amount || 0), 0);
    const totalCount = transactions.length;
    const confirmedStatuses = new Set(['completed', 'success', 'paid', 'authorized', 'captured']);
    const investorCount = transactions.filter(
      (item) => confirmedStatuses.has(String(item.status || '').toLowerCase()) && (item.amount || 0) > 0
    ).length;
    const byStatus = transactions.reduce<Record<string, number>>((acc, item) => {
      const key = item.status || 'unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return { totalAmount, totalCount, investorCount, byStatus };
  }, [transactions]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-slate-700 bg-slate-950 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold">Investisseurs uniques</p>
          <p className="text-3xl font-bold mt-4 text-brand-green">{summary.investorCount}</p>
        </div>
        <div className="rounded-3xl border border-slate-700 bg-slate-950 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold">Transactions totales</p>
          <p className="text-3xl font-bold mt-4 text-brand-green">{summary.totalCount}</p>
        </div>
        <div className="rounded-3xl border border-slate-700 bg-slate-950 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold">Montant total</p>
          <p className="text-3xl font-bold mt-4 text-brand-green">{formatFCFA(summary.totalAmount)}</p>
        </div>
        <div className="rounded-3xl border border-slate-700 bg-slate-950 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold">Statuts</p>
          <div className="mt-4 grid gap-2 text-sm text-slate-200">
            {Object.entries(summary.byStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between rounded-2xl bg-slate-900 px-3 py-2">
                <span>{statusLabels[status] || status}</span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
            {!Object.keys(summary.byStatus).length && <span className="text-slate-500">Aucune transaction</span>}
          </div>
        </div>
        <div className="rounded-3xl border border-slate-700 bg-slate-950 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold">Dernière mise à jour</p>
          <p className="text-3xl font-bold mt-4 text-brand-green">{transactions[0]?.updatedAt ? new Date(transactions[0].updatedAt).toLocaleString('fr-FR') : 'Aucune'}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Suivi des paiements FedaPay</h2>
          <p className="text-sm text-slate-400">Consultez les transactions enregistrées et leur statut.</p>
        </div>
        <button
          type="button"
          onClick={loadTransactions}
          className="inline-flex items-center justify-center rounded-2xl bg-brand-green px-4 py-3 text-sm font-bold text-slate-950 hover:bg-brand-green/90 transition-all"
        >
          Rafraîchir
        </button>
      </div>

      {loading && (
        <div className="rounded-3xl border border-slate-700 bg-slate-950 p-6 text-slate-300">Chargement des transactions...</div>
      )}

      {error && (
        <div className="rounded-3xl border border-red-500 bg-red-500/10 p-6 text-red-200">
          <p>{error}</p>
          {error.toLowerCase().includes('session invalide') && (
            <p className="mt-3 text-sm text-red-100">Veuillez vous reconnecter en tant qu'administrateur pour accéder au suivi des paiements.</p>
          )}
        </div>
      )}

      {!loading && !error && (
        <div className="overflow-x-auto rounded-3xl border border-slate-700 bg-slate-950 p-4">
          <table className="min-w-full border-collapse text-sm text-slate-200">
            <thead>
              <tr className="text-left text-slate-400">
                <th className="border-b border-slate-700 px-4 py-3">ID</th>
                <th className="border-b border-slate-700 px-4 py-3">Référence</th>
                <th className="border-b border-slate-700 px-4 py-3">Email</th>
                <th className="border-b border-slate-700 px-4 py-3">Montant</th>
                <th className="border-b border-slate-700 px-4 py-3">Devise</th>
                <th className="border-b border-slate-700 px-4 py-3">Statut</th>
                <th className="border-b border-slate-700 px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-slate-500 text-center">
                    Aucune transaction enregistrée.
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr key={transaction.transactionId} className="hover:bg-slate-900/80 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-slate-300">{transaction.transactionId}</td>
                    <td className="px-4 py-3 text-slate-200">{transaction.reference}</td>
                    <td className="px-4 py-3 text-slate-300">{transaction.email}</td>
                    <td className="px-4 py-3 text-slate-200">{formatFCFA(transaction.amount)}</td>
                    <td className="px-4 py-3 text-slate-200">{transaction.currency}</td>
                    <td className="px-4 py-3 text-slate-200">{statusLabels[transaction.status] || transaction.status}</td>
                    <td className="px-4 py-3 text-slate-300">{new Date(transaction.createdAt).toLocaleString('fr-FR')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FedaPayAdminDashboard;
