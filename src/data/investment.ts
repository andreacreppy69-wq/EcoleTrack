/**
 * Tableau financier pour projet d'investissement
 * Conditions:
 * - Remboursement: variable selon paliers définis (profit 200%–400%)
 * - Durée: 5 ans = 15 trimestres
 * - Paiement: fin de chaque trimestre
 */

export interface InvestmentRow {
  capitalInvesti: number;
  montantTotalRembourse: number;
  nombreTrimestres: number;
  paiementTrimestre: number;
  paiementAnnuelMoyen: number;
  gainNet: number;
  roi: number;
}

/**
 * Calcule les données d'investissement pour un capital donné
 */
export const calculateInvestment = (capital: number): InvestmentRow => {
  // Respecter un investissement minimum
  const MIN_INVEST = 200_000;
  const capitalValide = Math.max(capital, MIN_INVEST);

  // Déterminer le pourcentage de bénéfice (profit) selon les paliers
  // Paliers (profit %):
  // 200 000 - 499 000 => 100%
  // 500 000 - 999 000 => 150%
  // 1 000 000 - 2 900 000 => 200%
  // 3 000 000 - 4 990 000 => 250%
  // 5 000 000 - 10 000 000 => 300%
  // 10 000 000 - 30 000 000 => 400%
  const getProfitPercent = (c: number) => {
    if (c >= 10_000_000 && c <= 30_000_000) return 400;
    if (c >= 5_000_000 && c <= 9_999_999) return 300;
    if (c >= 3_000_000 && c <= 4_990_000) return 250;
    if (c >= 1_000_000 && c <= 2_900_000) return 200;
    if (c >= 500_000 && c <= 999_000) return 150;
    if (c >= 200_000 && c <= 499_000) return 100;
    // Par défaut, appliquer le palier minimal
    return 100;
  };

  const profitPercent = getProfitPercent(capitalValide);
  const montantTotalRembourse = Math.round(capitalValide * (1 + profitPercent / 100));
  const nombreTrimestres = 15; // 5 ans × 3 trimestres
  const paiementTrimestre = montantTotalRembourse / nombreTrimestres;
  const paiementAnnuelMoyen = paiementTrimestre * 3; // 3 trimestres par an
  const gainNet = montantTotalRembourse - capitalValide;
  const roi = profitPercent; // ROI en pourcentage (profit)

  return {
    capitalInvesti: capitalValide,
    montantTotalRembourse,
    nombreTrimestres,
    paiementTrimestre,
    paiementAnnuelMoyen,
    gainNet,
    roi,
  };
};

/**
 * Montants d'investissement à générer
 */
export const investmentAmounts = [
  250_000,
  500_000,
  750_000,
  1_000_000,
  2_500_000,
  5_000_000,
  15_000_000,
];

/**
 * Génère le tableau complet d'investissement
 */
export const investmentTable: InvestmentRow[] = investmentAmounts.map(
  calculateInvestment
);

/**
 * Formules de calcul (à titre informatif)
 */
export const formulas = {
  montantTotalRembourse: "Capital × 3",
  paiementTrimestre: "Montant Total Remboursé ÷ 15",
  paiementAnnuelMoyen: "Paiement Trimestriel × 3",
  gainNet: "Montant Total Remboursé - Capital Investi",
  roi: "(Gain Net ÷ Capital Investi) × 100",
};
