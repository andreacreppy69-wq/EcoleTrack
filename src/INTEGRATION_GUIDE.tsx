// Exemple d'intégration du composant InvestmentTable dans l'application

import React from "react";
import { InvestmentTable } from "./components/InvestmentTable";

/**
 * Option 1: Remplacer un composant existant
 * 
 * Remplacez simplement un composant dans votre App.tsx par:
 */
export function AppWithInvestmentTable() {
  return (
    <div className="app">
      <InvestmentTable />
    </div>
  );
}

/**
 * Option 2: Ajouter comme route
 * 
 * Si vous utilisez React Router:
 */
export const investmentRoutes = [
  {
    path: "/investment",
    element: <InvestmentTable />,
    label: "Investissements",
  },
];

/**
 * Option 3: Ajouter comme onglet dans un layout existant
 * 
 * Dans votre composant de navigation:
 */
interface TabItem {
  id: string;
  label: string;
  component: React.ComponentType;
}

export const tabs: TabItem[] = [
  {
    id: "investment",
    label: "📊 Tableau d'Investissement",
    component: InvestmentTable,
  },
];

/**
 * Option 4: Modal ou Dialog
 * 
 * Si vous utilisez un système de modal:
 */
export function showInvestmentModal() {
  return {
    title: "Tableau Financier - Projet d'Investissement",
    component: InvestmentTable,
    size: "large", // Pour afficher le tableau complet
    fullHeight: true,
  };
}

/**
 * Imports à ajouter à votre fichier principal:
 */
/*
import { InvestmentTable } from './components/InvestmentTable';
import { calculateInvestment, investmentTable } from './data/investment';
*/

/**
 * CSS à ajouter dans votre index.css ou main.css:
 */
/*
@import './components/InvestmentTable.css';
*/
