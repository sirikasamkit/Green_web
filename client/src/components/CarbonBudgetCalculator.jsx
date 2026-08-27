import React, { useState } from 'react';
import { Calculator, Target, Zap, ShieldCheck, CheckCircle2, TrendingDown } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const GRADE_TARGETS = {
  'A+': { grams: 0.095, label: 'Grade A+ (Elite Eco Champion)' },
  'A': { grams: 0.186, label: 'Grade A (High Efficiency)' },
  'B': { grams: 0.340, label: 'Grade B (Above Average)' },
  'C': { grams: 0.493, label: 'Grade C (Standard)' },
};

export default function CarbonBudgetCalculator() {
  const { t } = useLanguage();
  const [targetGrade, setTargetGrade] = useState('A+');
  const [isGreenHost, setIsGreenHost] = useState(true);
  const [monthlyVisits, setMonthlyVisits] = useState(25000);

  const targetGrams = GRADE_TARGETS[targetGrade].grams;

  const intensity = isGreenHost ? 50 : 442;
  const factorPerGb = 0.812 * intensity * 0.8125;
  const maxGb = targetGrams / factorPerGb;
  const maxKb = Math.round(maxGb * 1024 * 1024);
  const maxMb = (maxKb / 1024).toFixed(2);

  const jsBudget = Math.round(maxKb * 0.35);
  const imgBudget = Math.round(maxKb * 0.40);
  const cssBudget = Math.round(maxKb * 0.12);
  const fontBudget = Math.round(maxKb * 0.13);

  const annualTargetKg = Number(((targetGrams * monthlyVisits * 12) / 1000).toFixed(1));
  const annualAvgKg = Number(((0.500 * monthlyVisits * 12) / 1000).toFixed(1));
  const annualSavedKg = Number(Math.max(0, annualAvgKg - annualTargetKg).toFixed(1));

  return (
    <div className="glass-panel p-6 rounded-3xl border border-emerald-900/40 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-950/60 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-400" />
            {t('optimizer.budgetTitle', 'Website Carbon & Page Weight Budget Planner')}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {t('optimizer.budgetSubtitle', 'Set your target sustainability grade and get strict data weight limits for your development team')}
          </p>
        </div>
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Target Grade */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-emerald-950 space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-emerald-400" /> {t('optimizer.targetGrade', 'Target Sustainability Grade')}
          </label>
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            {Object.keys(GRADE_TARGETS).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setTargetGrade(g)}
                className={`py-2 rounded-xl text-xs font-black transition-all ${
                  targetGrade === g
                    ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Hosting Type */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-emerald-950 space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> {t('optimizer.hostingSource', 'Hosting Energy Source')}
          </label>
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => setIsGreenHost(true)}
              className={`py-2 px-2 rounded-xl text-xs font-bold transition-all text-center ${
                isGreenHost
                  ? 'bg-emerald-500 text-black'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              🌿 100% Green
            </button>
            <button
              type="button"
              onClick={() => setIsGreenHost(false)}
              className={`py-2 px-2 rounded-xl text-xs font-bold transition-all text-center ${
                !isGreenHost
                  ? 'bg-amber-500 text-black'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              ⚡ Standard Grid
            </button>
          </div>
        </div>

        {/* Monthly Traffic */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-emerald-950 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-semibold">{t('optimizer.monthlyVisits', 'Monthly Visits')}</span>
            <span className="font-mono text-emerald-400 font-bold">{monthlyVisits.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min="1000"
            max="250000"
            step="5000"
            value={monthlyVisits}
            onChange={(e) => setMonthlyVisits(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400 mt-2"
          />
        </div>
      </div>

      {/* Target Result Stats Banner */}
      <div className="p-5 rounded-2xl bg-[#070d0a] border border-emerald-500/40 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
            {t('optimizer.maxPayload', 'Maximum Allowed Total Page Weight')}
          </span>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono mt-1">
            {maxKb > 1024 ? `${maxMb} MB` : `${maxKb} KB`}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {t('optimizer.co2Cap', 'Carbon emission cap:')} <strong className="text-white">{targetGrams}g CO2e / visit</strong>
          </p>
        </div>

        <div className="border-t sm:border-t-0 sm:border-l border-emerald-950/80 sm:pl-4">
          <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
            {t('optimizer.annualSavings', 'Annual Carbon Saved vs Average Web')}
          </span>
          <div className="text-3xl font-extrabold text-teal-300 font-mono mt-1 flex items-center gap-2">
            <TrendingDown className="w-6 h-6 text-teal-400" />
            <span>{annualSavedKg.toLocaleString()} kg CO2</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {t('optimizer.targetEmissions', 'Target annual output:')} {annualTargetKg} kg
          </p>
        </div>
      </div>

      {/* Recommended Asset Weight Budget Allocations */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
          {t('optimizer.breakdownAllocation', 'Recommended Budget Allocation by Asset Type')}
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-yellow-500/30">
            <div className="text-xs text-yellow-400 font-semibold">JavaScript (35%)</div>
            <div className="text-lg font-bold text-white font-mono mt-1">≤ {jsBudget} KB</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-green-500/30">
            <div className="text-xs text-green-400 font-semibold">Images & Media (40%)</div>
            <div className="text-lg font-bold text-white font-mono mt-1">≤ {imgBudget} KB</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-cyan-500/30">
            <div className="text-xs text-cyan-400 font-semibold">CSS Styles (12%)</div>
            <div className="text-lg font-bold text-white font-mono mt-1">≤ {cssBudget} KB</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-purple-500/30">
            <div className="text-xs text-purple-400 font-semibold">Web Fonts (13%)</div>
            <div className="text-lg font-bold text-white font-mono mt-1">≤ {fontBudget} KB</div>
          </div>
        </div>
      </div>
    </div>
  );
}
