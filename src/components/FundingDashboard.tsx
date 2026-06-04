import React from 'react';
import { Backer } from '../types';
import './FundingDashboard.css';
import { Users, Wallet, Target, Percent, Clock } from 'lucide-react';

type Props = {
  totalGoal: number;
  raisedAmount: number;
  backers: Backer[];
};

const formatFCFA = (val: number) => new Intl.NumberFormat('fr-FR').format(val) + ' FCFA';

const FundingDashboard: React.FC<Props> = ({ totalGoal, raisedAmount, backers }) => {
  const investorCount = backers.length;
  const remaining = Math.max(0, totalGoal - raisedAmount);
  const percent = totalGoal > 0 ? Math.round((raisedAmount / totalGoal) * 10000) / 100 : 0;

  const sortedBackers = [...backers].sort((a, b) => b.amount - a.amount);

  return (
    <div className="funding-dashboard">
      <div className="stats-cards">
        <div className="card">
          <div className="card-top"><Users className="icon" /></div>
          <div className="label">NOMBRE D'INVESTISSEURS</div>
          <div className="value big">{investorCount}</div>
          <div className="sub">personnes</div>
        </div>
        <div className="card">
          <div className="card-top"><Wallet className="icon" /></div>
          <div className="label">MONTANT COLLECTÉ</div>
          <div className="value">{formatFCFA(raisedAmount)}</div>
          <div className="sub">total</div>
        </div>
        <div className="card">
          <div className="card-top"><Target className="icon" /></div>
          <div className="label">OBJECTIF</div>
          <div className="value">{formatFCFA(totalGoal)}</div>
          <div className="sub">cible</div>
        </div>
        <div className="card">
          <div className="card-top"><Percent className="icon" /></div>
          <div className="label">POURCENTAGE ATTEINT</div>
          <div className="value">{percent}%</div>
          <div className="sub">de l'objectif</div>
        </div>
        <div className="card">
          <div className="card-top"><Clock className="icon" /></div>
          <div className="label">MONTANT RESTANT</div>
          <div className="value remaining">{formatFCFA(remaining)}</div>
          <div className="sub">à collecter</div>
        </div>
      </div>

      <div className="progress-section">
        <div className="progress-labels">
          <div>Collecté: <strong>{formatFCFA(raisedAmount)}</strong></div>
          <div>Objectif: <strong>{formatFCFA(totalGoal)}</strong></div>
          <div className="percent">{percent}%</div>
        </div>
        <div className="progress-bar" aria-hidden>
          <div className="progress-fill" style={{ width: `${Math.min(100, (raisedAmount / totalGoal) * 100)}%` }} />
        </div>
      </div>

      <div className="details-table">
          <h3>Détails par investisseur</h3>
          <div className="details-scroll">
            <table>
              <thead>
                <tr>
                  <th>Investisseur</th>
                  <th>Montant</th>
                </tr>
              </thead>
              <tbody>
                {sortedBackers.slice(0, 3).map((b) => (
                  <tr key={b.id}>
                    <td className="name">{b.id}</td>
                    <td className="mono">{formatFCFA(b.amount)}</td>
                  </tr>
                ))}
                {sortedBackers.length > 3 && (() => {
                  const otherBackers = sortedBackers.slice(3);
                  const otherTotal = otherBackers.reduce((sum, b) => sum + b.amount, 0);
                  return (
                    <tr key="other-summary" className="other-summary-row">
                      <td className="name">Autres investisseurs</td>
                      <td className="mono">{formatFCFA(otherTotal)}</td>
                    </tr>
                  );
                })()}
                <tr className="total-row">
                  <td>TOTAL</td>
                  <td className="mono">{formatFCFA(raisedAmount)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      <div className="summary">
        <div>
          <div className="label">Montant collecté</div>
          <div className="value">{formatFCFA(raisedAmount)}</div>
        </div>
        <div>
          <div className="label">% Atteint</div>
          <div className="value">{percent}%</div>
        </div>
        <div>
          <div className="label">Restant</div>
          <div className="value">{formatFCFA(remaining)}</div>
        </div>
      </div>

    </div>
  );
};

export default FundingDashboard;
