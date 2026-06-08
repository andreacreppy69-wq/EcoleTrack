import { useState, ChangeEvent, FormEvent } from 'react';
import { CreditCard, Phone, AlertCircle, CheckCircle, Loader } from 'lucide-react';

interface FedaPayFormProps {
  onPaymentInitiated?: (result: any) => void;
  onError?: (error: string) => void;
  isLoading?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

export default function FedaPayForm({
  onPaymentInitiated,
  onError,
  isLoading = false,
  successMessage = '',
  errorMessage = '',
}: FedaPayFormProps) {
  const [amount, setAmount] = useState<string>('5000');
  const [phoneNumber, setPhoneNumber] = useState<string>('+228 91551295');
  const [customerName, setCustomerName] = useState<string>('Client Test');
  const [customerEmail, setCustomerEmail] = useState<string>('client@example.com');
  const [currency, setCurrency] = useState<string>('XOF');
  const [description, setDescription] = useState<string>('Paiement test FedaPay');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!amount || !phoneNumber) {
      onError?.('Montant et numéro de téléphone sont requis');
      return;
    }

    try {
      // This should be called by parent component
      onPaymentInitiated?.({
        amount: Number(amount),
        phoneNumber,
        currency,
        description,
        customerName,
        customerEmail,
      });
    } catch (error: any) {
      onError?.(error?.message || 'Erreur lors du paiement');
    }
  };

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900 p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-blue-500/20">
            <CreditCard className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">FedaPay</h3>
            <p className="text-sm text-slate-400">Passerelle de paiement mobile</p>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="mb-4 rounded-lg bg-green-500/10 border border-green-500/30 p-4 flex gap-3">
          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-green-200">{successMessage}</p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-200">{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Montant (XOF)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white outline-none focus:border-blue-500"
            required
            min="100"
            step="100"
          />
          <p className="text-xs text-slate-500 mt-1">Montant minimum: 100 XOF</p>
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            <Phone className="inline w-4 h-4 mr-2" />
            Numéro de téléphone
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setPhoneNumber(e.target.value)}
            placeholder="+228 XXXXXXXX"
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white outline-none focus:border-blue-500"
            required
          />
          <p className="text-xs text-slate-500 mt-1">Format: +228 XXXXXXXX (Togo)</p>
        </div>

        {/* Currency */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Devise
          </label>
          <select
            value={currency}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setCurrency(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white outline-none focus:border-blue-500"
          >
            <option value="XOF">XOF (Franc CFA Ouest)</option>
            <option value="GHS">GHS (Cedi ghanéen)</option>
            <option value="USD">USD (Dollar US)</option>
          </select>
        </div>

        {/* Customer Name */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Nom du client
          </label>
          <input
            type="text"
            value={customerName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomerName(e.target.value)}
            placeholder="Nom complet"
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white outline-none focus:border-blue-500"
          />
        </div>

        {/* Customer Email */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Email du client
          </label>
          <input
            type="email"
            value={customerEmail}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomerEmail(e.target.value)}
            placeholder="email@example.com"
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white outline-none focus:border-blue-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
            placeholder="Description du paiement"
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white outline-none focus:border-blue-500"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-blue-600 px-4 py-3 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Traitement...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4" />
              Payer avec FedaPay
            </>
          )}
        </button>
      </form>

      {/* Info */}
      <div className="mt-6 p-4 rounded-lg bg-slate-800 border border-slate-700">
        <p className="text-xs text-slate-400">
          <strong>Compte de test:</strong> +228 91551295<br />
          <strong>Réseau supportés:</strong> Moov Money, MTN Money, Orange Money, Vodafone Cash<br />
          <strong>Montant test:</strong> Tout montant (en mode démo)
        </p>
      </div>
    </div>
  );
}
