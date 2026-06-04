# 📊 Tableau Financier - Guide Complet et Index des Fichiers

## Sommaire Exécutif

Vous avez reçu un **système complet de tableau financier** pour un projet d'investissement scolaire avec:
- ✅ Remboursement variable selon palier (profit 200% à 400%)
- ✅ 15 trimestres de paiements réguliers (5 ans)
- ✅ 7 montants prédéfinis + calculatrice personnalisée
- ✅ Formules Excel complètes
- ✅ Composants React interactifs
- ✅ Données en JSON et CSV

---

## 📁 Fichiers Créés et Leur Utilisation

### 1. **Fichiers de Données**

#### `src/data/investment.ts` ⭐
**Utilité**: Données et fonctions de calcul TypeScript
- Exporte les montants d'investissement prédéfinis
- Fonction `calculateInvestment()` pour tout montant
- Types TypeScript `InvestmentRow`
- Formules documentées

**Usage**: 
```tsx
import { calculateInvestment, investmentTable } from './data/investment';
```

---

#### `src/data/investmentTable.json`
**Utilité**: Données au format JSON (structure complète)
- Tous les 7 montants avec calculs complets
- Conditions et formules incluses
- Prêt à être consommé par une API

**Usage**: Import dans des bases de données ou APIs

---

#### `src/data/investmentTable.csv`
**Utilité**: Format CSV pour Excel/Sheets
- Prêt à être copié-collé dans Excel
- Ouvre directement dans LibreOffice Calc
- Format standardisé pour partage facile

**Usage**: Ouvrir avec Excel, Google Sheets, ou tout outil tableur

---

#### `src/data/investmentTable.tsv`
**Utilité**: Format TSV (Tab-Separated Values)
- Alternative au CSV
- Meilleure compatibilité avec certains outils

---

### 2. **Composants React**

#### `src/components/InvestmentTable.tsx` ⭐⭐
**Utilité**: Composant React complet et interactif
- Tableau principal avec tous les montants
- Calculatrice personnalisée (n'importe quel montant)
- Section des formules expliquées
- Exemple détaillé
- Formatage automatique en FCFA

**Features**:
- 📊 Tableau responsive
- 🧮 Calculatrice live
- 📝 Conditions expliquées
- 💡 Exemple tutoriel

**Usage**:
```tsx
import { InvestmentTable } from './components/InvestmentTable';

export default function App() {
  return <InvestmentTable />;
}
```

---

#### `src/components/InvestmentTable.css`
**Utilité**: Styles professionnels pour le tableau
- Design moderne et responsive
- Couleurs cohérentes
- Animations fluides
- Adapté mobile, tablette, desktop

**Couleurs principales**:
- Bleu: #0066cc (principal)
- Vert: #2ecc71 (gains)
- Orange: #f39c12 (ROI)

---

#### `src/components/InvestmentVisualization.tsx` ⭐
**Utilité**: Visualisations et graphiques ASCII
- Graphiques de progression annuelle
- Point d'équilibre (T5)
- Distribution des gains par trimestre
- Comparaisons multi-investissements
- Résumé statistique

---

### 3. **Guides et Documentation**

#### `INVESTMENT_README.md` 📚
**Contenu**:
- Vue d'ensemble générale
- Conditions principales
- Formules détaillées avec explications
- Tableau des 7 investissements
- Chronogramme de paiement (5 ans)
- Calcul personnalisé
- Points clés à retenir

**Longueur**: ~300 lignes
**Usage**: Documentation de référence complète

---

#### `EXCEL_FORMULAS.md` 📊
**Contenu**:
- Instructions étape par étape pour Excel
- Formules pour chaque colonne
- Exemples avec références de cellules
- Template à copier-coller
- Données prédéfinies
- Formatage recommandé
- Ligne calculée dynamique

**Usage**: Pour créer votre propre feuille Excel

---

#### `PAYMENT_SCHEDULES.md` 📅
**Contenu**:
- Échéanciers détaillés pour tous les montants
- Tableau par trimestre pour chaque année
- Cumulés et pourcentages complétés
- Point de rentabilité (T5)
- Calendrier scolaire
- Graphiques ASCII

**Usage**: Comprendre les flux de paiement mois par mois

---

### 4. **Fichiers d'Intégration**

#### `src/INTEGRATION_GUIDE.tsx` 🔗
**Contenu**:
- 4 options d'intégration dans votre app React
- Route, onglet, modal, ou remplacement
- Exemples d'imports et configuration

**Options**:
1. Remplacer un composant existant
2. Ajouter comme route
3. Ajouter comme onglet
4. Modal ou dialog

---

## 🧮 Formules Rapides

### Les 5 Formules Essentielles

```
1. Montant Total Remboursé = Capital × 3

2. Paiement Trimestriel = Capital ÷ 5
   (ou Montant Total ÷ 15)

3. Paiement Annuel = Capital × 0.6
   (3 trimestres × paiement/trimestre)

4. Gain Net = Capital × 2
   (ou Montant Total - Capital)

5. ROI = 200%
   (toujours constant)
```

### Exemple pour 1 000 000 FCFA
```
Montant Total:         3 000 000 FCFA
Paiement/Trimestre:      200 000 FCFA
Paiement/Année:          600 000 FCFA
Gain Net:             2 000 000 FCFA
ROI:                        200%
```

---

## 📊 Données Prédéfinies

| Capital | Total Remboursé | Gain Net | ROI | Paiement/An |
|---|---|---|---|---|
| 100 000 | 300 000 | 200 000 | 200% | 60 000 |
| 250 000 | 750 000 | 500 000 | 200% | 150 000 |
| 500 000 | 1 500 000 | 1 000 000 | 200% | 300 000 |
| **1 000 000** | **3 000 000** | **2 000 000** | **200%** | **600 000** |
| 2 500 000 | 7 500 000 | 5 000 000 | 200% | 1 500 000 |
| 5 000 000 | 15 000 000 | 10 000 000 | 200% | 3 000 000 |
| 10 000 000 | 30 000 000 | 20 000 000 | 200% | 6 000 000 |

---

## 🚀 Démarrage Rapide

### Option 1: Utiliser le Composant React (Recommandé)

```tsx
// Dans App.tsx
import { InvestmentTable } from './components/InvestmentTable';

export default function App() {
  return (
    <div>
      <h1>Mon Application</h1>
      <InvestmentTable />
    </div>
  );
}
```

### Option 2: Exporter les Données en JSON/CSV

```tsx
// Récupérer les données
import { investmentTable } from './data/investment';

// Utiliser dans une API
const data = JSON.stringify(investmentTable);
```

### Option 3: Calculer un Montant Personnalisé

```tsx
import { calculateInvestment } from './data/investment';

// Pour 750 000 FCFA
const result = calculateInvestment(750_000);
console.log(result.paiementTrimestre); // 150 000
console.log(result.roi); // 200
```

### Option 4: Importer en Excel

1. Ouvrez Excel
2. Fichier → Ouvrir
3. Sélectionnez `investmentTable.csv`
4. Importation automatique des données

---

## 📱 Points d'Équilibre Clés

### Récupération du Capital Initial
- **Trimestre**: T5 (5e trimestre)
- **Année**: Année 2, Trimestre 2
- **Temps écoulé**: 1 an 8 mois
- **Pourcentage**: 33% de la durée totale

### Début du Pur Profit
- **Trimestre**: T6+
- **Montant par trimestre après**: 100% profit

### Échéance Finale
- **Trimestre**: T15
- **Année**: Année 5
- **Total reçu**: Variable selon palier (jusqu'à 500% du capital selon règle) 

---

## 🎨 Personnalisation

### Changer les Couleurs
Modifiez `src/components/InvestmentTable.css`:
```css
.investment-table thead {
  background: linear-gradient(135deg, #YOUR_COLOR, #YOUR_COLOR2);
}
```

### Ajouter Plus de Montants
Modifiez `src/data/investment.ts`:
```tsx
export const investmentAmounts = [
  100_000,
  250_000,
  500_000,
  1_000_000,
  2_500_000,
  5_000_000,
  10_000_000,
  15_000_000, // Ajouter ici
];
```

### Changer la Devise
Modifiez dans `InvestmentTable.tsx`:
```tsx
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR", // Changer ici
  }).format(value);
};
```

---

## ✅ Checklist d'Utilisation

- [ ] Lire le `INVESTMENT_README.md` pour comprendre les bases
- [ ] Consulter `PAYMENT_SCHEDULES.md` pour les détails des paiements
- [ ] Importer le composant `InvestmentTable` dans votre app
- [ ] Tester la calculatrice personnalisée
- [ ] Exporter les données CSV pour Excel (optionnel)
- [ ] Lire `EXCEL_FORMULAS.md` si besoin de créer propre feuille (optionnel)

---

## 🔧 Dépannage

### Le composant n'affiche pas les données
✓ Vérifiez que `investment.ts` est bien importé
✓ Vérifiez le chemin d'import (chemin relatif correct)
✓ Vérifiez que `InvestmentTable.css` est importé

### La calculatrice ne répond pas
✓ Vérifiez que JavaScript est activé
✓ Vérifiez la console (F12) pour les erreurs
✓ Testez avec un montant simple (ex: 100000)

### Les nombres ne s'affichent pas en FCFA
✓ Vérifiez la locale: `fr-FR`
✓ Vérifiez la devise: `XOF` (FCFA)
✓ Vérifiez les paramètres `minimumFractionDigits`

### Les formules Excel ne calculent pas
✓ Vérifiez que les cellules référencées existent
✓ Vérifiez les séparateurs (virgule vs point-virgule selon local)
✓ Régénérez les formules manuellement

---

## 📞 Support et Questions

### Questions sur les Calculs?
→ Voir `INVESTMENT_README.md` - Formules de Calcul

### Questions sur les Paiements Trimestriels?
→ Voir `PAYMENT_SCHEDULES.md` - Échéanciers

### Questions sur Excel?
→ Voir `EXCEL_FORMULAS.md` - Instructions Excel

### Questions sur l'Intégration React?
→ Voir `src/INTEGRATION_GUIDE.tsx` - 4 Options

---

## 📊 Statistiques du Système

- **Montants prédéfinis**: 7
- **Durée totale**: 5 ans (15 trimestres)
- **Remboursement total**: 300% du capital
- **Profit net**: 200%
- **ROI constant**: 200%
- **Point d'équilibre**: T5 (33% du temps)
- **Régularité**: Paiements identiques chaque trimestre
- **Scalabilité**: S'adapte à n'importe quel montant

---

## ✨ Caractéristiques Principales

✅ **Transparent**: Tous les calculs détaillés et vérifiables
✅ **Équitable**: Paiements réguliers et prévisibles
✅ **Flexible**: Montants prédéfinis + calculatrice personnalisée
✅ **Accessible**: Disponible en React, JSON, CSV, Excel
✅ **Professionnel**: Design moderne et responsive
✅ **Complet**: Documentation exhaustive incluse
✅ **Pratique**: Prêt à utiliser, prêt à déployer

---

**Créé**: 2 Juin 2026
**Version**: 1.0
**Langue**: Français (FCFA)
**Plateforme**: React + TypeScript

