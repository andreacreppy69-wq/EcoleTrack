# Tableau Financier - Projet d'Investissement

## Vue d'ensemble

Ce tableau financier détaillé présente les conditions de remboursement pour un projet d'investissement scolaire sur 5 ans (15 trimestres).

---

## Conditions Principales

### Paramètres Clés
- **Remboursement Total**: Variable selon le palier de montant investi (voir paliers ci-dessous)
- **Profit Brut**: Variable selon le palier (200% - 400%)
-- **Montant minimum**: 200 000 FCFA
- **Durée Totale**: 5 années scolaires
- **Nombre de Trimestres**: 15 (3 trimestres par année)
- **Fréquence de Paiement**: Fin de chaque trimestre
- **Mode de Répartition**: Équitable sur tous les trimestres

### Exemple Calculé pour 1 000 000 FCFA
```
Capital investi              : 1 000 000 FCFA
Total remboursé (selon palier): 3 000 000 FCFA
Nombre de trimestres         : 15
Paiement par trimestre       : 200 000 FCFA
Paiement annuel (3 trim.)    : 600 000 FCFA
Gain net de l'investisseur   : 2 000 000 FCFA
ROI (%)                      : 200% (palier appliqué)
```

---

## Formules de Calcul

### 1. Montant Total à Rembourser
```
Montant Total = Capital Investi × 3
Exemple: 1 000 000 × 3 = 3 000 000 FCFA
```

### 2. Paiement par Trimestre
```
Paiement Trimestriel = Montant Total ÷ 15
Exemple: 3 000 000 ÷ 15 = 200 000 FCFA
```

### 3. Paiement Annuel Moyen
```
Paiement Annuel = Paiement Trimestriel × 3
Exemple: 200 000 × 3 = 600 000 FCFA
```

### 4. Gain Net de l'Investisseur
```
Gain Net = Montant Total Remboursé - Capital Investi
Exemple: 3 000 000 - 1 000 000 = 2 000 000 FCFA
```

### 5. Retour sur Investissement (ROI)
```
ROI (%) = (Gain Net ÷ Capital Investi) × 100
Exemple: (2 000 000 ÷ 1 000 000) × 100 = 200%
```

---

## Tableau des Investissements

| Capital Investi | Total Remboursé | Trimestres | Paiement/Trimestre | Paiement/Année | Gain Net | ROI |
|---|---|---|---|---|---|---|
| 100 000 FCFA | 300 000 FCFA | 15 | 20 000 FCFA | 60 000 FCFA | 200 000 FCFA | 200% |
| 250 000 FCFA | 750 000 FCFA | 15 | 50 000 FCFA | 150 000 FCFA | 500 000 FCFA | 200% |
| 500 000 FCFA | 1 500 000 FCFA | 15 | 100 000 FCFA | 300 000 FCFA | 1 000 000 FCFA | 200% |
| **1 000 000 FCFA** | **3 000 000 FCFA** | **15** | **200 000 FCFA** | **600 000 FCFA** | **2 000 000 FCFA** | **200%** |
| 2 500 000 FCFA | 7 500 000 FCFA | 15 | 500 000 FCFA | 1 500 000 FCFA | 5 000 000 FCFA | 200% |
| 5 000 000 FCFA | 15 000 000 FCFA | 15 | 1 000 000 FCFA | 3 000 000 FCFA | 10 000 000 FCFA | 200% |
| 10 000 000 FCFA | 30 000 000 FCFA | 15 | 2 000 000 FCFA | 6 000 000 FCFA | 20 000 000 FCFA | 200% |

---

## Chronogramme de Paiement (Exemple: 1 000 000 FCFA)

### Année 1
| Trimestre | Paiement | Paiement Cumulé |
|---|---|---|
| T1 | 200 000 FCFA | 200 000 FCFA |
| T2 | 200 000 FCFA | 400 000 FCFA |
| T3 | 200 000 FCFA | 600 000 FCFA |

### Année 2-5
Chaque année: 600 000 FCFA (200 000 × 3 trimestres)

### Total sur 5 ans
- Année 1: 600 000 FCFA
- Année 2: 600 000 FCFA
- Année 3: 600 000 FCFA
- Année 4: 600 000 FCFA
- Année 5: 600 000 FCFA
- **TOTAL: 3 000 000 FCFA**

---

## Calcul Personnalisé

Pour calculer les paramètres pour **n'importe quel montant**:

```
Si Capital Investi = C

Montant Total à Rembourser = C × 3
Paiement par Trimestre = (C × 3) ÷ 15 = C ÷ 5
Paiement Annuel = (C ÷ 5) × 3 = (3C) ÷ 5
Gain Net = (C × 3) - C = C × 2
ROI = (C × 2) ÷ C × 100 = 200%
```

### Exemples Additionnels

#### Pour 150 000 FCFA
- Total Remboursé: 450 000 FCFA
- Paiement/Trimestre: 30 000 FCFA
- Paiement/Année: 90 000 FCFA
- Gain Net: 300 000 FCFA
- ROI: 200%

#### Pour 750 000 FCFA
- Total Remboursé: 2 250 000 FCFA
- Paiement/Trimestre: 150 000 FCFA
- Paiement/Année: 450 000 FCFA
- Gain Net: 1 500 000 FCFA
- ROI: 200%

---

## Points Clés à Retenir

1. **ROI Variable**: Le ROI dépend du palier appliqué au montant investi (200%–400%)
2. **Paiements Équitables**: Chaque trimestre reçoit exactement le même montant
3. **Croissance Linéaire**: Le paiement cumulé augmente linéairement (300 000 FCFA/an pour 1M FCFA)
4. **Scalabilité**: Les formules s'appliquent à n'importe quel montant d'investissement

---

## Fichiers Disponibles

- `investment.ts` - Données TypeScript avec fonctions de calcul
- `InvestmentTable.tsx` - Composant React interactif
- `investmentTable.json` - Données au format JSON
- `investmentTable.csv` - Données au format CSV (Excel compatible)
- `INVESTMENT_README.md` - Ce document

---

## Utilisation du Composant React

```tsx
import { InvestmentTable } from './components/InvestmentTable';

export default function App() {
  return <InvestmentTable />;
}
```

Le composant inclut:
- ✅ Tableau avec tous les montants prédéfinis
- ✅ Calculatrice personnalisée pour n'importe quel montant
- ✅ Affichage des formules utilisées
- ✅ Exemple calculé détaillé
- ✅ Design responsive et professionnel
- ✅ Formatage des montants en FCFA

---

## Notes Importantes

- Tous les montants sont en **FCFA** (Franc CFA)
- Les calculs supposent une répartition **exacte** et **égale** sur 15 trimestres
- Le ROI de **200%** représente le profit net (bénéfice supplémentaire au-delà du capital initial)
- La durée garantit un remboursement étalé sur **5 années scolaires complètes**

