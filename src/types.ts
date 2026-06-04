export interface CodeSchemaNode {
  id: string;
  label: string;
  description: string;
  icon: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  value: number; // in FCFA
  percentage: number;
  color: string;
  description: string;
}

export interface ContributionTier {
  id: string;
  title: string;
  amount: number; // in FCFA
  badge: string;
  description: string;
  rewards: string[];
}

export type PaymentMethod = 'wave' | 'mtn' | 'orange' | 'moov' | 'card' | 'transfer';

export interface Backer {
  id: string;
  name: string;
  amount: number;
  time: string;
  badge?: string;
  isCustom?: boolean;
}

export interface Testimony {
  id: string;
  name: string;
  role: 'Parent' | 'Enseignant' | 'Directeur';
  quote: string;
  avatar: string;
  location: string;
}
