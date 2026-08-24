import React, { useState } from 'react';
import { Calculator, Target, Zap, ShieldCheck, CheckCircle2, TrendingDown } from 'lucide-react';

const GRADE_TARGETS = {
  'A+': { grams: 0.095, label: 'Grade A+ (Elite Eco Champion)' },
  'A': { grams: 0.186, label: 'Grade A (High Efficiency)' },
  'B': { grams: 0.340, label: 'Grade B (Above Average)' },
  'C': { grams: 0.493, label: 'Grade C (Standard)' },
};

export default function CarbonBudgetCalculator() {
  const [targetGrade, setTargetGrade] = useState('A+');
  const [isGreenHost, setIsGreenHost] = useState(true);
  const [monthlyVisits, setMonthlyVisits] = useState(25000);

  const targetGrams = GRADE_TARGETS[targetGrade].grams;

  // Reverse SWD calculation:
  // CO2e = (FirstVisit * 0.75) + (ReturnVisit * 0.25)
  // E (kWh) = DataGB * 0.812
  // CO2e (g) = E * carbonIntensity (50 for green, 442 for standard)
  // Blended factor: 0.812 * intensity * (0.75 + 0.25*0.25) = 0.812 * intensity * 0.8125
  const intensity = isGreenHost ? 50 : 442;
  const factorPerGb = 0.812 * intensity * 0.8125; // grams CO2 per GB
  const maxGb = targetGrams / factorPerGb;
  const maxKb = Math.round(maxGb * 1024 * 1024);
  const maxMb = (maxKb / 1024).toFixed(2);

  // Suggested allocation percentages
  const jsBudget = Math.round(maxKb * 0.35);
  const imgBudget = Math.round(maxKb * 0.40);
  const cssBudget = Math.round(maxKb * 0.12);
  const fontBudget = Math.round(maxKb * 0.13);

  // Annual emissions at target vs standard 0.50g average
  const annualTargetKg = Number(((targetGrams * monthlyVisits * 12) / 1000).toFixed(1));
  const annualAvgKg = Number(((0.500 * monthlyVisits * 12) / 1000).toFixed(1));
  const annualSavedKg = Number(Math.max(0, annualAvgKg - annualTargetKg).toFixed(1));

  return (
    <div className="glass-panel p-6 rounded-3xl border border-emerald-900/40 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-950/60 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-400" />
            Website Carbon & Page Weight Budget Planner
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Set your target sustainability grade and get strict data weight limits for your development team
          </p>
        </div>
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Target Grade */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-emerald-950 space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-emerald-400" /> Target Sustainability Grade
          </label>
          <select
            value={targetGrade}
            onChange={(e) => setTargetGrade(e.target.value)}
            className="w-full bg-[#070d0a] border border-emerald-900/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
          >
            {Object.keys(GRADE_TARGETS).map((g) => (
              <option key={g} value={g}>
                {GRADE_TARGETS[g].label} (≤ {GRADE_TARGETS[g].grams}g)
              </option>
            ))}
          </select>
        </div>

        {/* Green Hosting Switch */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-emerald-950 space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Server Hosting Energy
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsGreenHost(true)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                isGreenHost ? 'bg-emerald-500 text-black shadow-md' : 'bg-[#070d0a] text-slate-400 border border-slate-800'
              }`}
            >
              🌿 100% Green
            </button>
            <button
              type="button"
              onClick={() => setIsGreenHost(false)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                !isGreenHost ? 'bg-amber-500 text-black shadow-md' : 'bg-[#070d0a] text-slate-400 border border-slate-800'
              }`}
            >
              ⚡ Standard Grid
            </button>
          </div>
        </div>

        {/* Monthly Traffic */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-emerald-950 space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>Projected Monthly Visits</span>
            <span className="font-mono text-emerald-400 font-bold">{monthlyVisits.toLocaleString()}</span>
          </label>
          <input
            type="range"
            min="1000"
            max="200000"
            step="5000"
            value={monthlyVisits}
            onChange={(e) => setMonthlyVisits(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400 mt-2"
          />
        </div>
      </div>

      {/* Target Result Box */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-green-950/20 to-teal-950/40 border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-400">
            Maximum Permitted Page Weight Budget
          </span>
          <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono">
            {maxKb.toLocaleString()} KB <span className="text-sm font-normal text-slate-400">({maxMb} MB)</span>
          </div>
          <p className="text-xs text-slate-300">
            To achieve <strong className="text-emerald-400">{GRADE_TARGETS[targetGrade].label}</strong>, the total downloaded assets must stay below this ceiling.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-900/50 text-xs space-y-1.5 flex-shrink-0 text-center md:text-right">
          <div className="text-slate-400 flex items-center justify-center md:justify-end gap-1">
            <TrendingDown className="w-3.5 h-3.5 text-emerald-400" /> Annual CO2 Savings vs Average:
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">
            {annualSavedKg.toLocaleString()} kg CO2e / year
          </div>
          <div className="text-[10px] text-slate-500">
            Equivalent to planting ~{Math.round(annualSavedKg / 21.7)} mature trees
          </div>
        </div>
      </div>

      {/* Breakdown Allocations Grid */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Recommended Asset Category Caps
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-[#070d0a] border border-emerald-950">
            <div className="text-[11px] text-slate-400">JavaScript Bundle</div>
            <div className="text-base font-bold text-yellow-400 font-mono mt-1">≤ {jsBudget} KB</div>
            <div className="text-[10px] text-slate-500 mt-0.5">35% Budget Cap</div>
          </div>

          <div className="p-4 rounded-2xl bg-[#070d0a] border border-emerald-950">
            <div className="text-[11px] text-slate-400">Images & Media</div>
            <div className="text-base font-bold text-emerald-400 font-mono mt-1">≤ {imgBudget} KB</div>
            <div className="text-[10px] text-slate-500 mt-0.5">40% Budget Cap</div>
          </div>

          <div className="p-4 rounded-2xl bg-[#070d0a] border border-emerald-950">
            <div className="text-[11px] text-slate-400">CSS Stylesheets</div>
            <div className="text-base font-bold text-cyan-400 font-mono mt-1">≤ {cssBudget} KB</div>
            <div className="text-[10px] text-slate-500 mt-0.5">12% Budget Cap</div>
          </div>

          <div className="p-4 rounded-2xl bg-[#070d0a] border border-emerald-950">
            <div className="text-[11px] text-slate-400">Web Fonts</div>
            <div className="text-base font-bold text-purple-400 font-mono mt-1">≤ {fontBudget} KB</div>
            <div className="text-[10px] text-slate-500 mt-0.5">13% Budget Cap</div>
          </div>
        </div>
      </div>
    </div>
  );
}
