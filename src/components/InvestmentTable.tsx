import React, { useState } from "react";
import {
  calculateInvestment,
  investmentTable,
  formulas,
  InvestmentRow,
} from "../data/investment";
import "./InvestmentTable.css";

export const InvestmentTable: React.FC = () => {
  const [customAmount, setCustomAmount] = useState(1_000_000);
  const [customResult, setCustomResult] = useState<InvestmentRow | null>(null);
  const [customError, setCustomError] = useState<string | null>(null);


  const handleCustomCalculation = () => {
    const MIN_INVEST = 200_000;
    if (customAmount < MIN_INVEST) {
      setCustomResult(null);
      setCustomError(`Montant minimum ${MIN_INVEST.toLocaleString('fr-FR')} FCFA`);
      return;
    }
    setCustomError(null);
    setCustomResult(calculateInvestment(customAmount));
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getRoiRowClass = (roi: number) => {
    switch (roi) {
      case 100:
        return 'roi-row roi-100';
      case 150:
        return 'roi-row roi-150';
      case 200:
        return 'roi-row roi-200';
      case 250:
        return 'roi-row roi-250';
      case 300:
        return 'roi-row roi-300';
      case 400:
        return 'roi-row roi-400';
      default:
        return 'roi-row';
    }
  };

  const renderTableRow = (row: InvestmentRow) => (
    <tr key={row.capitalInvesti} className={getRoiRowClass(row.roi)}>
      <td className="currency">{formatCurrency(row.capitalInvesti)}</td>
      <td className="currency">{formatCurrency(row.montantTotalRembourse)}</td>
      <td className="centered">{row.nombreTrimestres}</td>
      <td className="currency">{formatCurrency(row.paiementTrimestre)}</td>
      <td className="currency">{formatCurrency(row.paiementAnnuelMoyen)}</td>
      <td className="currency gain">{formatCurrency(row.gainNet)}</td>
      <td className="roi">{row.roi.toFixed(2)}%</td>
    </tr>
  );

  return (
    <div className="investment-table-container">
      <h1>Tableau Financier - Projet d'Investissement</h1>

      {/* Conditions et Formules */}
      <section className="conditions">
        <h2>Conditions</h2>
        <ul>
          <li>
            <strong>Remboursement:</strong> Variable selon le montant investi (consultez la calculatrice). Montant minimum: 200 000 FCFA
          </li>
          <li>
            <strong>Durée:</strong> 5 ans = 15 trimestres
          </li>
          <li>
            <strong>Fréquence:</strong> Paiement en fin de chaque trimestre
            scolaire
          </li>
          <li>
            <strong>Répartition:</strong> Équitable sur les 15 trimestres
          </li>
        </ul>
      </section>

      {/* Tableau Principal */}
      <section id="investment-table" className="table-section">
        <h2>Tableau des Investissements Prédéfinis</h2>
        <div style={{ 
          fontSize: 14, 
          color: '#fff', 
          marginBottom: 16, 
          padding: 16, 
          background: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)',
          borderRadius: 8, 
          boxShadow: '0 4px 12px rgba(46, 204, 113, 0.25)',
          fontWeight: 500
        }}>
          <strong>Paliers d'investissement :</strong> 200k–499k = 100% | 500k–999k = 150% | 1M–2.9M = 200% | 3M–4.99M = 250% | 5M–10M = 300% | 10M–30M = 400%
        </div>
        <div className="table-wrapper">
          <table className="investment-table">
            <thead>
              <tr>
                <th>Capital Investi</th>
                <th>Montant Total à Rembourser</th>
                <th>Trimestres</th>
                <th>Paiement/Trimestre</th>
                <th>Paiement/An (Moyen)</th>
                <th>Gain Net</th>
                <th>ROI (%)</th>
              </tr>
            </thead>
            <tbody>{investmentTable.map(renderTableRow)}</tbody>
          </table>
        </div>
      </section>

      {/* Calculatrice Personnalisée */}
      <section className="custom-calculation">
        <h2>Calculatrice Personnalisée</h2>
        <p>Entrez un montant personnalisé pour calculer les paramètres</p>

        <div className="input-group">
          <label htmlFor="customAmount">Montant à investir (FCFA):</label>
          <input
            id="customAmount"
            type="number"
            value={customAmount}
            onChange={(e) => setCustomAmount(Number(e.target.value))}
            min="200000"
            step="10000"
          />
          <button onClick={handleCustomCalculation}>Calculer</button>
        </div>

        {customError && (
          <div style={{ color: '#b91c1c', marginTop: 8, fontWeight: 600 }}>{customError}</div>
        )}

        {customResult && (
          <div className="custom-result">
            <table className="result-table">
              <tbody>
                <tr>
                  <td>
                    <strong>Capital Investi</strong>
                  </td>
                  <td>{formatCurrency(customResult.capitalInvesti)}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Montant Total Remboursé</strong>
                  </td>
                  <td>{formatCurrency(customResult.montantTotalRembourse)}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Nombre de Trimestres</strong>
                  </td>
                  <td>{customResult.nombreTrimestres}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Paiement par Trimestre</strong>
                  </td>
                  <td>{formatCurrency(customResult.paiementTrimestre)}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Paiement Annuel Moyen</strong>
                  </td>
                  <td>{formatCurrency(customResult.paiementAnnuelMoyen)}</td>
                </tr>
                <tr className="highlight">
                  <td>
                    <strong>Gain Net</strong>
                  </td>
                  <td>{formatCurrency(customResult.gainNet)}</td>
                </tr>
                <tr className="highlight">
                  <td>
                    <strong>Palier appliqué</strong>
                  </td>
                  <td>{customResult.roi.toFixed(0)}%</td>
                </tr>
                <tr className="highlight">
                  <td>
                    <strong>ROI (%)</strong>
                  </td>
                  <td>{customResult.roi.toFixed(2)}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Formules */}
      <section className="formulas" style={{ display: "none" }}>
        <h2>Formules de Calcul</h2>
        <ul>
          <li>
            <strong>Montant Total Remboursé:</strong> {formulas.montantTotalRembourse}
          </li>
          <li>
            <strong>Paiement par Trimestre:</strong> {formulas.paiementTrimestre}
          </li>
          <li>
            <strong>Paiement Annuel Moyen:</strong> {formulas.paiementAnnuelMoyen}
          </li>
          <li>
            <strong>Gain Net:</strong> {formulas.gainNet}
          </li>
          <li>
            <strong>ROI:</strong> {formulas.roi}
          </li>
        </ul>
      </section>

      {/* Exemple supprimé */}
    </div>
  );
};
