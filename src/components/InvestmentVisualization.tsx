/**
 * Composant de Visualisation des Paiements
 * Affiche les données de paiement sous forme de graphiques interactifs
 */

import React, { useMemo } from "react";
import { investmentTable, calculateInvestment } from "../data/investment";

export const InvestmentVisualization: React.FC = () => {
  // Données pour le graphique des gains cumulés
  const gainProgressionData = useMemo(() => {
    return investmentTable.map((row) => ({
      capital: row.capitalInvesti,
      yearlyPayment: row.paiementAnnuelMoyen,
      data: [
        { year: 1, cumulative: row.paiementAnnuelMoyen },
        { year: 2, cumulative: row.paiementAnnuelMoyen * 2 },
        { year: 3, cumulative: row.paiementAnnuelMoyen * 3 },
        { year: 4, cumulative: row.paiementAnnuelMoyen * 4 },
        { year: 5, cumulative: row.paiementAnnuelMoyen * 5 },
      ],
    }));
  }, []);

  // Point d'équilibre: toujours à T5 (trimestre 5)
  const breakEvenPoint = 5;

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>📊 Visualisation des Paiements et des Gains</h1>

      {/* Section 1: Comparaison des Montants */}
      <section style={{ marginBottom: "3rem" }}>
        <h2>Comparaison des Montants Investis</h2>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "2rem",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#0066cc", color: "white" }}>
              <th style={{ padding: "0.75rem", textAlign: "left" }}>Capital</th>
              <th style={{ padding: "0.75rem", textAlign: "right" }}>
                Total Remboursé
              </th>
              <th style={{ padding: "0.75rem", textAlign: "right" }}>
                Gain Net
              </th>
              <th style={{ padding: "0.75rem", textAlign: "right" }}>ROI</th>
              <th style={{ padding: "0.75rem", textAlign: "right" }}>
                Paiement/An
              </th>
            </tr>
          </thead>
          <tbody>
            {investmentTable.map((row, idx) => (
              <tr
                key={idx}
                style={{
                  backgroundColor: idx % 2 === 0 ? "#f9f9f9" : "white",
                  borderBottom: "1px solid #ddd",
                }}
              >
                <td style={{ padding: "0.75rem" }}>
                  {(row.capitalInvesti / 1_000_000).toFixed(0)}M FCFA
                </td>
                <td style={{ padding: "0.75rem", textAlign: "right" }}>
                  {(row.montantTotalRembourse / 1_000_000).toFixed(1)}M FCFA
                </td>
                <td style={{ padding: "0.75rem", textAlign: "right" }}>
                  {(row.gainNet / 1_000_000).toFixed(1)}M FCFA
                </td>
                <td style={{ padding: "0.75rem", textAlign: "right" }}>
                  {row.roi.toFixed(0)}%
                </td>
                <td style={{ padding: "0.75rem", textAlign: "right" }}>
                  {(row.paiementAnnuelMoyen / 1_000_000).toFixed(1)}M FCFA
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Section 2: Graphique ASCII - Progression Annuelle */}
      <section style={{ marginBottom: "3rem" }}>
        <h2>Progression des Remboursements (5 ans)</h2>
        <p>Graphique pour investissement de 1 000 000 FCFA</p>

        <div
          style={{
            backgroundColor: "#f5f5f5",
            padding: "1rem",
            borderRadius: "4px",
            fontFamily: "monospace",
            overflow: "auto",
          }}
        >
          <pre>{`
Année 1:   ████████████████████░░░░░░░░░░░░░░░░░░░░░░ = 600 000 FCFA (20%)
Année 2:   ████████████████████████████████░░░░░░░░░░ = 1 200 000 FCFA (40%)
Année 3:   ████████████████████████████████████████░░ = 1 800 000 FCFA (60%)
Année 4:   ████████████████████████████████████████░░ = 2 400 000 FCFA (80%)
Année 5:   ████████████████████████████████████████░░ = 3 000 000 FCFA (100%) ✓

Récupération du capital initial: Au Trimestre 5 (33% du temps)
          `}</pre>
        </div>
      </section>

      {/* Section 3: Comparaison Multi-Investissements */}
      <section style={{ marginBottom: "3rem" }}>
        <h2>Paiements Annuels Comparés</h2>
        <div
          style={{
            backgroundColor: "#f5f5f5",
            padding: "1rem",
            borderRadius: "4px",
            fontFamily: "monospace",
            overflow: "auto",
          }}
        >
          <pre>{`
CAPITAL        | AN 1      | AN 2      | AN 3      | AN 4      | AN 5      | TOTAL
───────────────────────────────────────────────────────────────────────────────────
100 K FCFA     | 60 K      | 60 K      | 60 K      | 60 K      | 60 K      | 300 K
250 K FCFA     | 150 K     | 150 K     | 150 K     | 150 K     | 150 K     | 750 K
500 K FCFA     | 300 K     | 300 K     | 300 K     | 300 K     | 300 K     | 1.5 M
1 M FCFA       | 600 K     | 600 K     | 600 K     | 600 K     | 600 K     | 3 M
2.5 M FCFA     | 1.5 M     | 1.5 M     | 1.5 M     | 1.5 M     | 1.5 M     | 7.5 M
5 M FCFA       | 3 M       | 3 M       | 3 M       | 3 M       | 3 M       | 15 M
10 M FCFA      | 6 M       | 6 M       | 6 M       | 6 M       | 6 M       | 30 M

Note: Les paiements annuels sont identiques pour chaque année (paiement uniforme)
          `}</pre>
        </div>
      </section>

      {/* Section 4: Visualisation du Point d'Équilibre */}
      <section style={{ marginBottom: "3rem" }}>
        <h2>Point d'Équilibre: Récupération du Capital Initial</h2>
        <div
          style={{
            backgroundColor: "#f5f5f5",
            padding: "1rem",
            borderRadius: "4px",
            fontFamily: "monospace",
            overflow: "auto",
          }}
        >
          <pre>{`
TRIMESTRES → T1    T2    T3    T4    T5    T6    T7    T8    T9    T10   T11   T12   T13   T14   T15
PAIEMENT  → 1/15  2/15  3/15  4/15  5/15  6/15  7/15  8/15  9/15  10/15 11/15 12/15 13/15 14/15 15/15
CAPITAL   → ░░░░░░░░░░█████ ████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
PROFIT    → ░░░░░░░░░░░░░░░ ████████████████████████████████████████████████████████████████████

        Capital Récupéré → T5 (Trimestre 5 = Année 2, Trimestre 2)
        Profit Net Débutant → Après T5
          `}</pre>
        </div>
      </section>

      {/* Section 5: Distribution des Gains */}
      <section style={{ marginBottom: "3rem" }}>
        <h2>Distribution des Gains par Trimestre (1 000 000 FCFA)</h2>
        <div
          style={{
            backgroundColor: "#f5f5f5",
            padding: "1rem",
            borderRadius: "4px",
            fontFamily: "monospace",
            overflow: "auto",
          }}
        >
          <pre>{`
TRIMESTRE | MONTANT | COMPOSITION           | CUMULÉ
──────────────────────────────────────────────────────
T1        | 200 K   | Capital    : 200 K   | 200 K
T2        | 200 K   | Capital    : 200 K   | 400 K
T3        | 200 K   | Capital    : 200 K   | 600 K
T4        | 200 K   | Capital    : 200 K   | 800 K
T5        | 200 K   | Capital    : 200 K   | 1 M    ✓ CAPITAL RÉCUPÉRÉ
T6        | 200 K   | Profit     : 200 K   | 1.2 M
T7        | 200 K   | Profit     : 200 K   | 1.4 M
T8        | 200 K   | Profit     : 200 K   | 1.6 M
T9        | 200 K   | Profit     : 200 K   | 1.8 M
T10       | 200 K   | Profit     : 200 K   | 2 M
T11       | 200 K   | Profit     : 200 K   | 2.2 M
T12       | 200 K   | Profit     : 200 K   | 2.4 M
T13       | 200 K   | Profit     : 200 K   | 2.6 M
T14       | 200 K   | Profit     : 200 K   | 2.8 M
T15       | 200 K   | Profit     : 200 K   | 3 M    ✓ 100% REMBOURSÉ
          `}</pre>
        </div>
      </section>

      {/* Section 6: Résumé Statistique */}
      <section style={{ marginBottom: "3rem" }}>
        <h2>Résumé Statistique</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
            marginBottom: "1rem",
          }}
        >
          <div
            style={{
              backgroundColor: "#e3f2fd",
              padding: "1rem",
              borderRadius: "4px",
              borderLeft: "4px solid #0066cc",
            }}
          >
            <strong>Point d'Équilibre</strong>
            <p>T5 (Trimestre 5)</p>
            <p style={{ fontSize: "0.9rem", color: "#666" }}>
              Soit 1 an 8 mois après le début
            </p>
          </div>
          <div
            style={{
              backgroundColor: "#f3e5f5",
              padding: "1rem",
              borderRadius: "4px",
              borderLeft: "4px solid #9c27b0",
            }}
          >
            <strong>Période de Profit</strong>
            <p>10 trimestres</p>
            <p style={{ fontSize: "0.9rem", color: "#666" }}>
              Soit 3 ans 4 mois de pur profit
            </p>
          </div>
          <div
            style={{
              backgroundColor: "#f1f8e9",
              padding: "1rem",
              borderRadius: "4px",
              borderLeft: "4px solid #4caf50",
            }}
          >
            <strong>ROI Moyen</strong>
            <p>200%</p>
            <p style={{ fontSize: "0.9rem", color: "#666" }}>
              Indépendant du montant investi
            </p>
          </div>
          <div
            style={{
              backgroundColor: "#fff3e0",
              padding: "1rem",
              borderRadius: "4px",
              borderLeft: "4px solid #ff9800",
            }}
          >
            <strong>Rendement Annuel</strong>
            <p>~40% par an</p>
            <p style={{ fontSize: "0.9rem", color: "#666" }}>
              Total du profit ÷ durée (200% ÷ 5 ans)
            </p>
          </div>
        </div>
      </section>

      {/* Section 7: Notes */}
      <section>
        <h2>Notes Importantes</h2>
        <ul style={{ lineHeight: "1.8" }}>
          <li>
            ✓ Les paiements sont <strong>parfaitement réguliers</strong>: même
            montant chaque trimestre
          </li>
          <li>
            ✓ Le point d'équilibre est <strong>toujours au T5</strong>, peu
            importe le montant
          </li>
          <li>
            ✓ Le profit est <strong>garanti dès le T6</strong>
          </li>
          <li>
            ✓ Le ROI est <strong>constant à 200%</strong> pour tous les montants
          </li>
          <li>
            ✓ Les paiements peuvent être <strong>prévisibles et planifiables</strong>
          </li>
          <li>
            ✓ La structure est <strong>équitable pour tous les investisseurs</strong>
          </li>
        </ul>
      </section>
    </div>
  );
};

export default InvestmentVisualization;
