import { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users2, Smartphone, School, Bell, CheckSquare, ClipboardList, ShieldAlert, Award } from 'lucide-react';

interface FlowStep {
  id: string;
  sender: 'parent' | 'app' | 'school';
  receiver: 'parent' | 'app' | 'school';
  title: string;
  description: string;
  icon: ReactNode;
}

export default function InteractiveSchema() {
  const [activeStepId, setActiveStepId] = useState<string>('step-0');
  const [selectedEntity, setSelectedEntity] = useState<'parents' | 'app' | 'school'>('app');

  const flows = {
    parents: [
      { id: 'p-1', title: 'Consultation Directe', text: 'Accès instantané aux absences, notes, relevés de notes, devoirs enregistrés par l’école et accès aux calendriers des devoirs ou des examens à venir.', icon: <CheckSquare className="w-5 h-5 text-brand-green" /> },
      { id: 'p-2', title: 'Justifications Rapides', text: 'Envoi instantané d’un justificatif d’absence (médical, familial) en un clic.', icon: <ClipboardList className="w-5 h-5 text-brand-green" /> },
      { id: 'p-3', title: 'Suivi Financier (Après le premier deploiement)', text: 'Paiement sécurisé des frais scolaires avec reçu numérique immédiat.', icon: <Award className="w-5 h-5 text-brand-green" /> },
    ],
    app: [
      { id: 'a-1', title: 'Passerelle Cloud SMS', text: 'Distribution automatique de SMS et notifications push cryptées en temps réel.', icon: <Bell className="w-5 h-5 text-blue-500" /> },
      { id: 'a-2', title: 'Sécurisation des bulletins', text: 'Enregistrement inviolable des rapports académiques pour éviter les fraudes.', icon: <Smartphone className="w-5 h-5 text-blue-500" /> },
    ],
    school: [
      { id: 's-1', title: 'Appel Numérique', text: 'L’enseignant coche les présences en classe, initiant l’alerte parents.', icon: <Users2 className="w-5 h-5 text-brand-blue" /> },
      { id: 's-2', title: 'Saisie simplifiée', text: 'Rentrée des notes d’examens et devoirs sur mobile, même avec connexion limitée.', icon: <School className="w-5 h-5 text-brand-blue" /> },
    ]
  };

  return (
    <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm">
      <div className="text-center mb-8">
        <span className="px-3 py-1 bg-brand-blue/10 text-brand-blue text-xs font-semibold uppercase tracking-wider rounded-full">
          Schéma Interactif du Flux d'Information
        </span>
        <h3 className="text-2xl font-bold text-brand-blue mt-2">
          Le triptyque de la transparence scolaire
        </h3>
        <p className="text-slate-600 max-w-lg mx-auto text-sm mt-1">
          Cliquez sur chaque étape pour voir comment les données circulent harmonieusement entre les acteurs.
        </p>
      </div>

      {/* Visual Connection Diagram */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative items-center mb-10">
        
        {/* Anchor Card 1: Parents */}
        <button
          onClick={() => setSelectedEntity('parents')}
          className={`flex flex-col items-center p-6 rounded-2xl border transition-all text-center relative z-10 ${
            selectedEntity === 'parents'
              ? 'bg-brand-green border-brand-green text-white shadow-md ring-2 ring-brand-green/20'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
          }`}
        >
          <div className={`p-4 rounded-full mb-3 ${
            selectedEntity === 'parents'
              ? 'bg-green-700/30 text-green-50'
              : 'bg-brand-green/10 text-brand-green'
          }`}>
            <Users2 className="w-8 h-8" />
          </div>
          <span className={`font-bold text-lg ${
            selectedEntity === 'parents'
              ? 'text-white'
              : 'text-slate-800'
          }`}>Parents d'élèves</span>
          <span className={`text-xs mt-1 ${
            selectedEntity === 'parents'
              ? 'text-green-50'
              : 'text-slate-500'
          }`}>Reçoivent & Agissent</span>
          
          {selectedEntity === 'parents' && (
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-600 rotate-45" />
          )}
        </button>

        {/* Dynamic Connection Arrow 1 */}
        <div className="hidden md:flex flex-col items-center justify-center absolute left-[28%] right-[68%] z-0">
          <div className="h-[2px] w-full bg-slate-300 relative">
            <motion.div 
              animate={{ x: selectedEntity === 'parents' ? [-10, 40] : [40, -10] }} 
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="absolute -top-[3px] w-2 h-2 rounded-full bg-brand-green" 
            />
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-1">Double-flux</span>
        </div>

        {/* Anchor Card 2: Application Centrale */}
        <button
          onClick={() => setSelectedEntity('app')}
          className={`flex flex-col items-center p-6 rounded-2xl border transition-all text-center relative z-10 ${
            selectedEntity === 'app'
              ? 'bg-brand-blue border-brand-blue text-white shadow-lg ring-4 ring-brand-blue/20'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm text-slate-800'
          }`}
        >
          <div className={`p-4 rounded-full mb-3 ${selectedEntity === 'app' ? 'bg-white/10 text-white' : 'bg-brand-blue/10 text-brand-blue'}`}>
            <Smartphone className="w-8 h-8 animate-pulse" />
          </div>
          <span className="font-bold text-lg">Application Cloud</span>
          <span className={`text-xs ${selectedEntity === 'app' ? 'text-blue-200' : 'text-slate-500'} mt-1`}>Passerelle Instantanée</span>

          {selectedEntity === 'app' && (
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-brand-blue rotate-45" />
          )}
        </button>

        {/* Dynamic Connection Arrow 2 */}
        <div className="hidden md:flex flex-col items-center justify-center absolute left-[62%] right-[28%] z-0">
          <div className="h-[2px] w-full bg-slate-300 relative">
            <motion.div 
              animate={{ x: selectedEntity === 'school' ? [-10, 40] : [40, -10] }} 
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="absolute -top-[3px] w-2 h-2 rounded-full bg-purple-600" 
            />
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-1">Double-flux</span>
        </div>

        {/* Anchor Card 3: École / Administration */}
        <button
          onClick={() => setSelectedEntity('school')}
          className={`flex flex-col items-center p-6 rounded-2xl border transition-all text-center relative z-10 ${
            selectedEntity === 'school'
              ? 'bg-purple-600 border-purple-600 text-white shadow-md ring-2 ring-purple-600/20'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
          }`}
        >
          <div className={`p-4 rounded-full mb-3 ${
            selectedEntity === 'school'
              ? 'bg-purple-700/30 text-purple-50'
              : 'bg-slate-100 text-brand-blue'
          }`}>
            <School className="w-8 h-8" />
          </div>
          <span className={`font-bold text-lg ${
            selectedEntity === 'school'
              ? 'text-white'
              : 'text-slate-800'
          }`}>École & Enseignants</span>
          <span className={`text-xs mt-1 ${
            selectedEntity === 'school'
              ? 'text-purple-50'
              : 'text-slate-500'
          }`}>Émettent la Donnée</span>

          {selectedEntity === 'school' && (
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-purple-600 rotate-45" />
          )}
        </button>

      </div>

      {/* Explanation Area */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs min-h-[220px]">
        <h4 className="text-base font-bold text-brand-blue mb-4 flex items-center gap-2">
          {selectedEntity === 'parents' && <span className="w-2.5 h-2.5 rounded-full bg-brand-green block" />}
          {selectedEntity === 'app' && <span className="w-2.5 h-2.5 rounded-full bg-blue-500 block" />}
          {selectedEntity === 'school' && <span className="w-2.5 h-2.5 rounded-full bg-purple-600 block mr-1" />}
          Services actifs : {selectedEntity === 'parents' ? 'Parents d’élèves' : selectedEntity === 'app' ? 'Application Centrale' : 'École & Professeurs'}
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AnimatePresence mode="wait">
            {flows[selectedEntity].map((step, idx) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ delay: idx * 0.1, duration: 0.2 }}
                className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between"
              >
                <div>
                  <div className="mb-2 p-2 bg-white rounded-lg w-fit shadow-xs">
                    {step.icon}
                  </div>
                  <h5 className="font-semibold text-slate-800 text-sm mb-1">{step.title}</h5>
                  <p className="text-xs text-slate-600 leading-relaxed">{step.text}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
