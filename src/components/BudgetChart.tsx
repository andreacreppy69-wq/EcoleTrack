import { useState } from 'react';
import { motion } from 'motion/react';
import { BUDGET_CATEGORIES, FUNDING_PROGRESS } from '../data';
import { Info, Landmark } from 'lucide-react';

export default function BudgetChart() {
  const [activeId, setActiveId] = useState<string>('dev');
  
  const budgetTotal = BUDGET_CATEGORIES.reduce((sum, category) => sum + category.value, 0);
  const overallGoal = FUNDING_PROGRESS.totalGoal;
  const launchShare = Math.round((budgetTotal / overallGoal) * 100);
  
  // Format numbers nicely with spaces
  const formatFCFA = (val: number) => {
    return new Intl.NumberFormat('fr-FR').format(val) + ' FCFA';
  };

  const activeCategory = BUDGET_CATEGORIES.find(c => c.id === activeId) || BUDGET_CATEGORIES[0];

  // Simple computations for drawing the SVG donut slices
  // Radius: 100, circumference: 2 * PI * R = 628.318
  const radius = 80;
  const strokeWidth = 24;
  const cx = 120;
  const cy = 120;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
      <div className="flex flex-col md:flex-row gap-8 items-center">
        
        {/* Left Side: SVG Donut Visual */}
        <div className="relative w-fit flex-shrink-0">
          <svg width="240" height="240" className="transform -rotate-90">
            {/* Background track circle */}
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              fill="transparent"
              stroke="#f1f5f9"
              strokeWidth={strokeWidth}
            />
            {
              BUDGET_CATEGORIES.map((cat) => {
                const percentageFraction = cat.percentage / 100;
                const strokeDasharray = `${circumference * percentageFraction} ${circumference}`;
                const strokeDashoffset = -currentOffset;
                
                // Accumulate offset for next slices
                currentOffset += circumference * percentageFraction;
                const isSelected = activeId === cat.id;

                return (
                  <motion.circle
                    key={cat.id}
                    cx={cx}
                    cy={cy}
                    r={radius}
                    fill="transparent"
                    stroke={cat.color}
                    strokeWidth={isSelected ? strokeWidth + 6 : strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="cursor-pointer transition-all duration-300"
                    onMouseEnter={() => setActiveId(cat.id)}
                    onClick={() => setActiveId(cat.id)}
                    whileHover={{ scale: 1.02 }}
                  />
                );
              })
            }
          </svg>

          {/* Central Ticker Panel */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Allocation</span>
            <span className="text-3xl font-extrabold text-brand-blue count-up">
              {activeCategory.percentage}%
            </span>
            <span className="text-xs font-semibold text-brand-green bg-brand-green/10 px-2.5 py-0.5 rounded-full mt-1">
              {activeCategory.id === 'dev' ? 'Développement' : activeCategory.id === 'marketing' ? 'Marketing' : activeCategory.id === 'infra' ? 'Infra Cloud' : 'Support'}
            </span>
          </div>
        </div>

        {/* Right Side: Description List & Breakdown */}
        <div className="flex-grow space-y-4 w-full">
          <div>
            <h4 className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Description de l'allocation</h4>
            <h3 className="text-xl font-bold text-brand-blue mt-0.5">{activeCategory.name}</h3>
            
            {/* Value Ticker Block */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-2xl font-black text-brand-green">{formatFCFA(activeCategory.value)}</span>
              <span className="text-xs text-slate-400">sur {formatFCFA(budgetTotal)}</span>
            </div>
          </div>

          <p className="text-slate-600 text-sm leading-relaxed min-h-[64px]">
            {activeCategory.description}
          </p>

          {/* List of categories with hover indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {BUDGET_CATEGORIES.map((cat) => {
              const isSelected = activeId === cat.id;
              return (
                <button
                  key={cat.id}
                  onMouseEnter={() => setActiveId(cat.id)}
                  onClick={() => setActiveId(cat.id)}
                  className={`flex items-start text-left p-3 rounded-xl border transition-all text-xs ${
                    isSelected
                      ? 'bg-slate-50 border-slate-300 shadow-xs'
                      : 'bg-transparent border-transparent hover:bg-slate-50'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full mr-3 mt-0.5 flex-shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <div>
                    <p className={`font-semibold ${isSelected ? 'text-brand-blue' : 'text-slate-700'}`}>
                      {cat.name}
                    </p>
                    <p className="text-slate-500 font-mono text-[10px] mt-0.5">
                      {formatFCFA(cat.value)} ({cat.percentage}%)
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

        </div>

      </div>

      <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Landmark className="w-4 h-4 text-brand-blue" />
          <span>Coût estimatif de lancement : <strong className="text-slate-800">{formatFCFA(budgetTotal)}</strong> ({launchShare}% de l'objectif total estimé)</span>
        </div>
        <div className="flex items-center gap-1 text-slate-400">
          <Info className="w-3.5 h-3.5" />
          <span>Objectif total estimé : <strong>{formatFCFA(overallGoal)}</strong></span>
        </div>
      </div>
    </div>
  );
}
