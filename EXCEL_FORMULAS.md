# Formules Excel pour Tableau Financier d'Investissement

## Instructions d'Utilisation

1. Créez une nouvelle feuille Excel
2. Copiez les en-têtes dans la première ligne
3. Utilisez les formules ci-dessous dans les colonnes correspondantes
4. Remplacez `$A2` par votre référence de cellule pour le capital investi

---

## Structure du Tableau Excel

### En-têtes (Ligne 1)
```
A1: Capital Investi (FCFA)
B1: Montant Total Remboursé (FCFA)
C1: Nombre de Trimestres
D1: Paiement par Trimestre (FCFA)
E1: Paiement Annuel Moyen (FCFA)
F1: Gain Net (FCFA)
G1: ROI (%)
```

---

## Formules Excel par Colonne

### Colonne A: Capital Investi (FCFA)
```
Entrez directement le montant ou référencez une autre cellule
Exemple pour ligne 2: 1000000
```

### Colonne B: Montant Total Remboursé (FCFA)
```
Formule (avec paliers, renvoie le montant total à rembourser):
=IF(A2<200000, "MINIMUM 200000",
	IF(A2>=10000000, A2*5,
		IF(A2>=6000000, A2*4.5,
			IF(A2>=3000000, A2*4,
				IF(A2>=1500000, A2*3.5,
					IF(A2>=200000, A2*3))))))
```

Explication: Le multiplicateur dépend du palier de montant investi:
- 200 000–1 499 000 => multiplier ×3 (profit 200%)
- 1 500 000–2 999 000 => ×3.5 (profit 250%)
- 3 000 000–5 999 000 => ×4 (profit 300%)
- 6 000 000–9 999 000 => ×4.5 (profit 350%)
- 10 000 000–20 000 000 => ×5 (profit 400%)
Résultat pour 1M FCFA avec ces paliers: 3 000 000 FCFA

### Colonne C: Nombre de Trimestres
```
Formule: =15

Explication: Fixe - 5 ans × 3 trimestres par an
```

### Colonne D: Paiement par Trimestre (FCFA)
```
Formule: =B2/C2
ou plus simplement: =B2/15
ou encore: =A2*3/15
ou simplifiée: =A2/5

Explication: Montant total remboursé ÷ 15 trimestres
Résultat pour 1M FCFA: 200 000 FCFA
```

### Colonne E: Paiement Annuel Moyen (FCFA)
```
Formule: =D2*3

Explication: Paiement trimestre × 3 trimestres par an
Résultat pour 1M FCFA: 600 000 FCFA
```

### Colonne F: Gain Net (FCFA)
```
Formule: =B2-A2
ou: =A2*2

Explication: Montant remboursé - Capital initial
ou: Capital × 2 (car 300% - 100% = 200%)
Résultat pour 1M FCFA: 2 000 000 FCFA
```

### Colonne G: ROI (%)
```
Formule: =(F2/A2)*100

Explication: (Gain Net ÷ Capital Investi) × 100
Résultat pour tous: 200%

Note: Cette formule retournera toujours 200% 
avec ces conditions
```

---

## Exemple Complet pour une Ligne (1 000 000 FCFA)

| Colonne | Valeur/Formule | Résultat |
|---|---|---|
| A2 | 1000000 | 1 000 000 FCFA |
| B2 | =A2*3 | 3 000 000 FCFA |
| C2 | =15 | 15 |
| D2 | =B2/15 | 200 000 FCFA |
| E2 | =D2*3 | 600 000 FCFA |
| F2 | =B2-A2 | 2 000 000 FCFA |
| G2 | =(F2/A2)*100 | 200% |

---

## Template Complet à Copier

### Ligne d'En-têtes
```
Capital Investi (FCFA) | Montant Total Remboursé (FCFA) | Nombre de Trimestres | Paiement par Trimestre (FCFA) | Paiement Annuel Moyen (FCFA) | Gain Net (FCFA) | ROI (%)
```

### Formules pour la Ligne 2 (à adapter à chaque ligne)
```
A2: [Entrez le montant directement]
B2: (voir formule conditionnelle ci-dessus)
C2: 15
D2: =B2/15
E2: =D2*3
F2: =B2-A2
G2: =(F2/A2)*100
```

---

## Données Prédéfinies à Entrer en Excel

```
Capital Investi | Total Remboursé | Trimestres | Paiement/Trim | Paiement/An | Gain Net | ROI
200000         | 600000          | 15         | 40000         | 120000      | 400000   | 200%
250000         | 750000          | 15         | 50000         | 150000      | 500000   | 200%
500000         | 1500000         | 15         | 100000        | 300000      | 1000000  | 200%
1000000        | 3000000         | 15         | 200000        | 600000      | 2000000  | 200%
2500000        | 8750000         | 15         | 583333        | 1750000     | 6250000  | 250%
5000000        | 20000000        | 15         | 1333333       | 4000000     | 15000000 | 300%
10000000       | 50000000        | 15         | 3333333       | 10000000    | 40000000 | 400%
```

---

## Astuce: Ligne Calculée Dynamique

Pour créer une ligne de calcul automatique pour **n'importe quel montant**:

1. Ajoutez une ligne supplémentaire après vos données
2. Étiquetez-la "Calcul Personnalisé"
3. Dans la colonne A, entrez une valeur de test
4. Dans les colonnes B-G, utilisez les formules ci-dessus

**Exemple (Ligne 10 pour calcul libre):**
```
A10: [Entrez n'importe quel montant]
B10: =A10*3
C10: 15
D10: =A10/5
E10: =A10/5*3
F10: =A10*2
G10: 200
```

---

## Vérification des Calculs

Pour vérifier vos formules, testez avec **1 000 000 FCFA**:
- ✓ Total Remboursé: 3 000 000 FCFA
- ✓ Paiement/Trimestre: 200 000 FCFA
- ✓ Paiement/Année: 600 000 FCFA
- ✓ Gain Net: 2 000 000 FCFA
- ✓ ROI: 200%

---

## Formatage Recommandé en Excel

### Formats de Cellule

**Colonnes A, B, D, E, F** (Montants en FCFA):
- Format: Nombre
- Décimales: 0
- Séparateur des milliers: Activé
- Symbole: FCFA ou vide

**Colonne C** (Trimestres):
- Format: Nombre
- Décimales: 0

**Colonne G** (ROI):
- Format: Pourcentage
- Décimales: 2
- Ou format: Nombre personnalisé avec "%" suffix

### Styles Recommandés

- **En-têtes**: Police grasse, fond bleu, texte blanc
- **Lignes données**: Alternance blanc/gris clair
- **Gains**: Vert ou surligné
- **ROI**: Orange ou surligné

---

## Fichiers Complémentaires

- `investmentTable.csv` - Version CSV (Excel importable)
- `investmentTable.json` - Version JSON (données structurées)
- `investment.ts` - Fonctions de calcul TypeScript

