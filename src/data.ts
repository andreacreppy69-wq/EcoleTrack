import { ContributionTier, BudgetCategory, Testimony, Backer } from './types';

export const CONTRIBUTION_TIERS: ContributionTier[] = [
  {
    id: 'tier-1',
    title: 'Soutien Sympatisant',
    amount: 5000,
    badge: 'Bronze',
    description: 'Participez à la naissance du projet de suivi scolaire en Afrique.',
    rewards: [
      'Mention de votre nom sur la page des contributeurs d’honneur',
      'Accès bêta privilégié à l’application lors du lancement'
    ]
  },
  {
    id: 'tier-2',
    title: 'Soutien Parent',
    amount: 15000,
    badge: 'Argent',
    description: 'Aidez une école pilote à s’équiper de l’application.',
    rewards: [
      'Mention de votre nom sur la page d\'honneur',
      'Accès bêta privilégié à l’application',
      'Abonnement gratuit d\'un an pour une famille de votre choix (3 élèves max)'
    ]
  },
  {
    id: 'tier-3',
    title: 'Soutien Académique',
    amount: 50000,
    badge: 'Or',
    description: 'Devenez un acteur majeur de la réussite éducative locale.',
    rewards: [
      'Toutes les contreparties précédentes',
      'Abonnement à vie pour votre famille ou une famille parrainée',
      'Invitation à la table ronde de lancement officiel avec l’équipe projet'
    ]
  },
  {
    id: 'tier-4',
    title: 'Mécène de l’Éducation',
    amount: 150000,
    badge: 'Platine',
    description: 'Financez l’équipement complet d’une école entière !',
    rewards: [
      'Toutes les contreparties précédentes en version Élite',
      'Plaque de remerciement physique au sein de la première école pilote',
      'Rapport trimestriel d’impact social et de progression académique des élèves'
    ]
  }
];

export const BUDGET_CATEGORIES: BudgetCategory[] = [
  {
    id: 'dev',
    name: 'Développement Technique & QA',
    value: 12000000,
    percentage: 40,
    color: '#0f2d52',
    description: 'Codage des apps mobiles (React Native) et web (React/Node), tests de charge et audit de sécurité des données élèves.'
  },
  {
    id: 'marketing',
    name: 'Marketing & Déploiement Écoles',
    value: 7500000,
    percentage: 25,
    color: '#19a463',
    description: 'Démarchage des établissements scolaires primaires et secondaires, organisation de sessions de formation pour le personnel.'
  },
  {
    id: 'infra',
    name: 'Infrastructures & Serveurs SEC',
    value: 6000000,
    percentage: 20,
    color: '#3b82f6',
    description: 'Serveurs cloud hautement disponibles, hébergement sécurisé conforme RGPD/protection de la jeunesse et passerelles d\'alertes SMS.'
  },
  {
    id: 'support',
    name: 'Support, Support Juridique & Admin',
    value: 4500000,
    percentage: 15,
    color: '#f59e0b',
    description: 'Support technique 24/7 pour les parents et équipes pédagogiques, frais légaux de constitution et d\'Assistance.'
  }
];

export const TESTIMONIES: Testimony[] = [
  {
    id: 't-1',
    name: 'Mme. SESSOU Amandine',
    role: 'Parent',
    quote: 'C\'est exactement le type d\'outil qu\'il nous faut au Togo. Parfois, j\'apprends très tard que mon fils n\'était pas en classe. Cette réactivité renforcera la confiance.',
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=120&h=120',
    location: 'Lomé'
  },
  {
    id: 't-2',
    name: 'M. AGBAVOR Blaise',
    role: 'Enseignant',
    quote: 'Saisir les présences et les notes pour les transmettre instantanément évitera les fraudes de bulletins. L\'impact sur le taux de réussite sera significatif !',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120&h=120',
    location: 'Kpalimé'
  },
  {
    id: 't-3',
    name: 'M. KOUDENOU Paul',
    role: 'Directeur',
    quote: 'La transparence administrative est notre plus grand défi. Des parents impliqués engendrent des élèves appliqués. Ce projet mérite tout notre soutien.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120&h=120',
    location: 'Aného'
  }
];

const _initialAmounts = [
  750000,
  200000,
  200000,
  225000,
  205090,
  250000,
  250000,
  200000,
  250000,
  400000,
  300000,
  225000
];

export const INITIAL_RECENT_BACKERS: Backer[] = _initialAmounts.map((amt, i) => {
  const index = String(i + 1).padStart(3, '0');
  const id = `INV-${index}`;
  const time = i === _initialAmounts.length - 1 ? 'Il y a 1 heure' : i < 3 ? 'Il y a 2 jours' : 'Il y a 1 jour';
  return { id, name: id, amount: amt, time };
});

// Financement Campaign Goals & Progress
export const FUNDING_PROGRESS = {
  totalGoal: 30000000, // 30,000,000 FCFA - Objectif total estimé
  amountRaised: 3455090, // 3,455,090 FCFA - Montant collecté
  progressPercentage: 11.52 // (3,455,090 / 30,000,000) * 100
};

// Launch budget remains the estimated start-up cost, proportionally aligned with the total campaign goal.
export const LAUNCH_COST = 21000000; // 21,000,000 FCFA

// Old budget reference (for historical tracking)
export const OLD_TOTAL_BUDGET = LAUNCH_COST;
