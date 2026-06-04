import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CONTRIBUTION_TIERS, INITIAL_RECENT_BACKERS } from '../data';
import { ContributionTier, PaymentMethod, Backer } from '../types';
import { 
  Heart, CreditCard, Smartphone, ShieldCheck, CheckCircle2, 
  HelpCircle, User, MessageCircle, Download, Share2, Sparkles, AlertCircle
} from 'lucide-react';

interface ContributionWidgetProps {
  onContributionAdded: (amount: number, name: string) => void;
  totalRaised: number;
  totalGoal: number;
  backersList: Backer[];
}

export default function ContributionWidget({ 
  onContributionAdded, 
  totalRaised, 
  totalGoal, 
  backersList 
}: ContributionWidgetProps) {
  // Option Choice states
  const [selectedTier, setSelectedTier] = useState<ContributionTier | null>(CONTRIBUTION_TIERS[1]); // Default Tier 2
  const [customAmountStr, setCustomAmountStr] = useState<string>('');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  // Form Fields
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wave');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Checkout Status States
  const [checkoutStep, setCheckoutStep] = useState<'selection' | 'info' | 'processing' | 'success'>('selection');
  const [processingStatus, setProcessingStatus] = useState<string>('Vérification des serveurs de paiement...');

  // Helper calculation
  const getSelectedAmount = () => {
    if (isCustomMode) {
      const parsed = parseInt(customAmountStr, 10);
      return isNaN(parsed) ? 0 : parsed;
    }
    return selectedTier ? selectedTier.amount : 0;
  };

  const getSelectedTitle = () => {
    if (isCustomMode) return 'Mécène libre';
    return selectedTier ? selectedTier.title : 'Contribution libre';
  };

  // Run Simulated checkout pipeline
  const handleProceedToInfo = () => {
    const amt = getSelectedAmount();
    if (amt <= 0) {
      setErrorMsg('Veuillez saisir ou choisir un montant supérieur à 0 Fcfa.');
      return;
    }
    if (amt > 10000000) {
      setErrorMsg('Le montant maximum de simulation est de 10 000 000 Fcfa.');
      return;
    }
    setErrorMsg('');
    setCheckoutStep('info');
  };

  const handleStartPayment = (e: FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg('Veuillez renseigner votre nom complet.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Veuillez renseigner une adresse email valide.');
      return;
    }
    if ((paymentMethod === 'wave' || paymentMethod === 'mtn' || paymentMethod === 'orange' || paymentMethod === 'moov') && !phone.trim()) {
      setErrorMsg('Veuillez renseigner votre numéro de mobile money.');
      return;
    }

    setErrorMsg('');
    setCheckoutStep('processing');

    // Simulate real gateway processing steps
    const steps = [
      'Vérification des serveurs de paiement locaux...',
      'Génération du lien de facturation sécurisé...',
      'Envoi de la demande de confirmation sur votre terminal...',
      'Validation de la transaction auprès de la banque centrale...',
      'Fonds sécurisés et enregistrés avec succès !'
    ];

    let currentSubStep = 0;
    const interval = setInterval(() => {
      if (currentSubStep < steps.length - 1) {
        setProcessingStatus(steps[currentSubStep]);
        currentSubStep++;
      } else {
        clearInterval(interval);
        // Complete the transaction in main app state!
        onContributionAdded(getSelectedAmount(), fullName);
        setCheckoutStep('success');
      }
    }, 1100);
  };

  const handleReset = () => {
    setCheckoutStep('selection');
    setCustomAmountStr('');
    setIsCustomMode(false);
    setSelectedTier(CONTRIBUTION_TIERS[1]);
    setFullName('');
    setEmail('');
    setPhone('');
    setErrorMsg('');
  };

  const formattedAmount = (val: number) => {
    return new Intl.NumberFormat('fr-FR').format(val) + ' FCFA';
  };

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
      
      {/* Decorative gradient glowing orb */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-brand-green/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Steps indicators */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-brand-green fill-brand-green" />
          <span className="font-bold text-slate-100 text-sm md:text-base">Simulateur d'Investissement</span>
        </div>
        <div className="flex gap-1">
          <div className={`w-2 h-2 rounded-full ${checkoutStep === 'selection' ? 'bg-brand-green' : 'bg-slate-700'}`} />
          <div className={`w-2 h-2 rounded-full ${checkoutStep === 'info' ? 'bg-brand-green' : 'bg-slate-700'}`} />
          <div className={`w-2 h-2 rounded-full ${checkoutStep === 'processing' ? 'bg-brand-green' : 'bg-slate-700'}`} />
          <div className={`w-2 h-2 rounded-full ${checkoutStep === 'success' ? 'bg-brand-green' : 'bg-slate-700'}`} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        
        {/* STEP 1: Selection */}
        {checkoutStep === 'selection' && (
          <motion.div
            key="selection-view"
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 15 }}
            className="space-y-5"
          >
            <div>
              <h3 className="text-xl font-bold text-slate-100">Choisissez votre formule</h3>
              <p className="text-slate-400 text-xs mt-1">
                Soutenez l’éducation connectée. À chaque palier correspondent des contreparties concrètes.
              </p>
            </div>

            {/* Error banner */}
            {errorMsg && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Contribution Package list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {CONTRIBUTION_TIERS.map((tier) => {
                const isSelected = !isCustomMode && selectedTier?.id === tier.id;
                return (
                  <button
                    key={tier.id}
                    onClick={() => {
                      setIsCustomMode(false);
                      setSelectedTier(tier);
                    }}
                    type="button"
                    className={`flex flex-col text-left p-4 rounded-xl border transition-all ${
                      isSelected 
                        ? 'bg-slate-800/80 border-brand-green ring-2 ring-brand-green/20' 
                        : 'bg-slate-800/30 border-slate-800 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[11px] font-semibold bg-brand-green/20 text-brand-green px-2 py-0.5 rounded-full">
                        Palier {tier.badge}
                      </span>
                      <span className="text-lg font-extrabold text-white">
                        {formattedAmount(tier.amount)}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-200 mt-2.5">{tier.title}</h4>
                    <p className="text-[11px] text-slate-400 leading-snug mt-1 flex-grow">
                      {tier.description}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Custom Amount option */}
            <div className={`p-4 rounded-xl border transition-all ${
              isCustomMode 
                ? 'bg-slate-800/80 border-brand-green ring-2 ring-brand-green/20' 
                : 'bg-slate-800/30 border-slate-800 hover:bg-slate-800/50'
            }`}>
              <button
                type="button"
                onClick={() => {
                  setIsCustomMode(true);
                  setSelectedTier(null);
                }}
                className="flex items-center gap-2 font-bold text-sm text-slate-200 w-full text-left"
              >
                <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${isCustomMode ? 'border-brand-green' : 'border-slate-600'}`}>
                  {isCustomMode && <div className="w-1.5 h-1.5 bg-brand-green rounded-full" />}
                </div>
                <span>Saisir un montant libre (FCFA)</span>
              </button>

              {isCustomMode && (
                <div className="mt-3 flex gap-2">
                  <div className="relative flex-grow">
                    <input
                      type="number"
                      placeholder="Ex: 25000"
                      value={customAmountStr}
                      onChange={(e) => setCustomAmountStr(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-hidden focus:border-brand-green"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-mono">FCFA</span>
                  </div>
                </div>
              )}
            </div>

            {/* Summary details inside step */}
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 text-xs space-y-2 text-slate-300">
              <span className="font-semibold text-slate-100 block">Vos contreparties sélectionnées :</span>
              <ul className="list-disc pl-4 space-y-1">
                {isCustomMode ? (
                  <li>Soutien flexible selon vos moyens</li>
                ) : (
                  selectedTier?.rewards.map((reward, i) => (
                    <li key={i}>{reward}</li>
                  ))
                )}
                <li>Certificat numérique de mécénat éducatif</li>
              </ul>
            </div>

            <button
              onClick={handleProceedToInfo}
              className="w-full py-3 bg-brand-green hover:bg-brand-green/90 text-slate-900 font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 text-sm"
            >
              <span>Continuer avec {formattedAmount(getSelectedAmount())}</span>
            </button>
          </motion.div>
        )}

        {/* STEP 2: Info & Payments Details */}
        {checkoutStep === 'info' && (
          <motion.div
            key="info-view"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            className="space-y-4"
          >
            <div>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-100">Coordonnées & Paiement</h3>
                <button 
                  onClick={() => setCheckoutStep('selection')} 
                  className="text-xs text-brand-green hover:underline"
                >
                  Modifier le montant
                </button>
              </div>
              <p className="text-slate-400 text-xs mt-0.5">
                Renseignez vos informations. La passerelle simule un prélèvement sécurisé.
              </p>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleStartPayment} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nom complet</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="AYISSOU Koffi Elom"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-hidden focus:border-brand-green"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Adresse Email</label>
                <input
                  type="email"
                  required
                  placeholder="elom.ayissou@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs focus:outline-hidden focus:border-brand-green"
                />
              </div>

              {/* Payment methods choice */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Méthodes de contribution</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('wave')}
                    className={`p-2.5 rounded-lg border text-center transition-all ${
                      paymentMethod === 'wave' 
                        ? 'bg-sky-500/10 border-sky-400 text-sky-400' 
                        : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 mx-auto mb-1" />
                    <span className="text-[10px] font-bold block">Wave</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('mtn')}
                    className={`p-2.5 rounded-lg border text-center transition-all ${
                      paymentMethod === 'mtn' 
                        ? 'bg-yellow-500/10 border-yellow-500 text-yellow-400' 
                        : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 mx-auto mb-1" />
                    <span className="text-[10px] font-bold block">MTN Money</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('orange')}
                    className={`p-2.5 rounded-lg border text-center transition-all ${
                      paymentMethod === 'orange' 
                        ? 'bg-orange-500/10 border-orange-500 text-orange-400' 
                        : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 mx-auto mb-1" />
                    <span className="text-[10px] font-bold block">Orange M.</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-2.5 rounded-lg border text-center transition-all ${
                      paymentMethod === 'card' 
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                        : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 mx-auto mb-1" />
                    <span className="text-[10px] font-bold block">CB / Visa / MC</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('transfer')}
                    className={`p-2.5 rounded-lg border text-center transition-all ${
                      paymentMethod === 'transfer' 
                        ? 'bg-indigo-500/10 border-indigo-400 text-indigo-300' 
                        : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 mx-auto mb-1" />
                    <span className="text-[10px] font-bold block">Virement</span>
                  </button>
                </div>
              </div>

              {/* Dynamic input field depending on payment method */}
              {(paymentMethod === 'wave' || paymentMethod === 'mtn' || paymentMethod === 'orange' || paymentMethod === 'moov') && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Numéro Mobile Money (Saisie libre)</label>
                  <input
                    type="tel"
                    required
                    placeholder="91 55 12 95"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-brand-green font-mono"
                  />
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="bg-slate-850 p-2.5 border border-slate-800 rounded-lg space-y-2">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wi">Simulation carte bancaire</span>
                  <div className="grid grid-cols-3 gap-2">
                    <input type="text" placeholder="Numéro de carte fictif" disabled className="col-span-2 bg-slate-900/60 border border-slate-800/80 rounded px-2 py-1 text-xs text-slate-400" value="•••• •••• •••• 2026" />
                    <input type="text" placeholder="MM/AA" disabled className="bg-slate-900/60 border border-slate-800/80 rounded px-2 py-1 text-xs text-slate-400" value="12/29" />
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCheckoutStep('selection')}
                  className="w-1/3 py-2.5 border border-slate-700 hover:bg-slate-800 text-white rounded-xl text-xs transition-all font-bold"
                >
                  Retour
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 bg-brand-green hover:bg-brand-green/90 text-slate-900 rounded-xl text-xs transition-all font-bold shadow-md flex items-center justify-center gap-1"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Confirmer le paiement simulé</span>
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* STEP 3: Processing loading step */}
        {checkoutStep === 'processing' && (
          <motion.div
            key="processing-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-12 flex flex-col items-center justify-center text-center space-y-4"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-slate-800 border-t-brand-green animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-brand-green animate-pulse" />
              </div>
            </div>
            
            <div className="space-y-1">
              <h4 className="font-bold text-slate-100 text-sm">Prélèvement en cours...</h4>
              <p className="text-brand-green text-xs font-medium max-w-xs mx-auto animate-pulse">
                {processingStatus}
              </p>
            </div>
          </motion.div>
        )}

        {/* STEP 4: Success, certificate, impact statistics! */}
        {checkoutStep === 'success' && (
          <motion.div
            key="success-view"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="space-y-5 text-center py-4"
          >
            <div className="w-16 h-16 bg-brand-green/10 text-brand-green rounded-full flex items-center justify-center mx-auto mb-2 border border-brand-green/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-white flex items-center justify-center gap-1">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                Contribution Enregistrée !
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Merci <strong>{fullName}</strong> ! Votre contribution simulée de <strong>{formattedAmount(getSelectedAmount())}</strong> a été injectée avec succès dans la jauge de la campagne.
              </p>
            </div>

            {/* Simulated certificate widget */}
            <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/50 text-left text-xs space-y-2 max-w-sm mx-auto">
              <div className="flex justify-between items-center pb-2 border-b border-slate-700/60">
                <span className="font-mono text-[9px] text-slate-400">RÉCÉPISSÉ : #{Math.floor(Math.random() * 90000) + 10000}</span>
                <span className="font-bold text-brand-green">{formattedAmount(getSelectedAmount())}</span>
              </div>
              <p className="text-slate-200">
                Donateur : <strong className="text-white">{fullName}</strong>
              </p>
              <p className="text-slate-400">
                Impact direct : Ce don finance la mise en service des modules d’alerte directe pour environ <strong className="text-white">{Math.max(1, Math.floor(getSelectedAmount() / 5000))} classes d’école d’Afrique subsaharienne</strong>.
              </p>
              <p className="text-[10px] italic text-slate-500">
                « Changer l'éducation, c'est semer pour demain. »
              </p>
            </div>

            <div className="flex gap-2 max-w-sm mx-auto">
              <button
                onClick={() => alert('Téléchargement du certificat d\'impact fictif...')}
                className="w-1/2 py-2 border border-slate-700 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Certificat</span>
              </button>
              <button
                onClick={handleReset}
                className="w-1/2 py-2 bg-brand-green hover:bg-brand-green/90 text-slate-900 rounded-xl text-xs font-bold transition-all"
              >
                Refaire un test
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Trust footers */}
      <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-green" />
          Preuve d’impact & Transparence
        </span>
        <span className="flex items-center gap-1">
          Simulateur Sandbox local v1.0
        </span>
      </div>

    </div>
  );
}
