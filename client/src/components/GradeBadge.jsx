import React from 'react';
import { Leaf, Award, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const GRADE_CONFIG = {
  'A+': {
    bg: 'from-emerald-500/20 to-teal-500/20',
    border: 'border-emerald-400',
    text: 'text-emerald-400',
    glow: 'shadow-emerald-500/50',
    icon: Award,
  },
  'A': {
    bg: 'from-green-500/20 to-emerald-500/20',
    border: 'border-green-400',
    text: 'text-green-400',
    glow: 'shadow-green-500/40',
    icon: ShieldCheck,
  },
  'B': {
    bg: 'from-lime-500/20 to-green-500/20',
    border: 'border-lime-400',
    text: 'text-lime-400',
    glow: 'shadow-lime-500/30',
    icon: Leaf,
  },
  'C': {
    bg: 'from-amber-500/20 to-yellow-500/20',
    border: 'border-amber-400',
    text: 'text-amber-400',
    glow: 'shadow-amber-500/30',
    icon: AlertTriangle,
  },
  'D': {
    bg: 'from-orange-500/20 to-amber-500/20',
    border: 'border-orange-400',
    text: 'text-orange-400',
    glow: 'shadow-orange-500/30',
    icon: AlertTriangle,
  },
  'E': {
    bg: 'from-red-500/20 to-orange-500/20',
    border: 'border-red-400',
    text: 'text-red-400',
    glow: 'shadow-red-500/30',
    icon: AlertTriangle,
  },
  'F': {
    bg: 'from-rose-600/20 to-red-600/20',
    border: 'border-rose-500',
    text: 'text-rose-400',
    glow: 'shadow-rose-500/40',
    icon: AlertTriangle,
  },
};

export default function GradeBadge({ grade = 'B', carbonGrams = 0, cleanerThan = 50, size = 'large' }) {
  const { t } = useLanguage();
  const config = GRADE_CONFIG[grade] || GRADE_CONFIG['B'];
  const Icon = config.icon;

  const description = t(`gradeBadge.grades.${grade}`, 'Sustainable Web Performance');

  if (size === 'small') {
    return (
      <span
        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${config.border} ${config.text} bg-slate-900/80 shadow-sm ${config.glow}`}
      >
        <span>{grade}</span>
        <span className="text-[10px] text-slate-400 font-normal">({carbonGrams}g)</span>
      </span>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 glass-panel rounded-3xl relative overflow-hidden text-center group">
      {/* Background radial gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-b ${config.bg} opacity-40 group-hover:opacity-60 transition-opacity duration-300 pointer-events-none`}
      />

      {/* Grade Circular Ring */}
      <div className="relative mb-4">
        {/* Outer Glow Ring */}
        <div
          className={`w-36 h-36 sm:w-44 sm:h-44 rounded-full border-4 ${config.border} bg-[#0a0f0d]/90 flex flex-col items-center justify-center shadow-2xl ${config.glow} transition-transform duration-300 group-hover:scale-105`}
        >
          <span className="text-xs uppercase tracking-widest font-semibold text-slate-400 mb-1">
            {t('gradeBadge.ecoGrade', 'Eco Grade')}
          </span>
          <span className={`text-6xl sm:text-7xl font-black ${config.text} tracking-tighter drop-shadow-md`}>
            {grade}
          </span>
          <span className="text-xs font-mono text-slate-300 mt-1 font-medium">
            {carbonGrams}g <span className="text-[10px] text-slate-400">{t('gradeBadge.co2PerVisit', 'CO2 / visit')}</span>
          </span>
        </div>
      </div>

      {/* Cleaner than comparison pill */}
      <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/30 text-xs text-white mb-2 shadow-sm">
        <Leaf className="w-3.5 h-3.5 text-emerald-400" />
        <span>
          {t('gradeBadge.cleanerThan', 'Cleaner than')} <strong className="text-emerald-300 font-extrabold">{cleanerThan}%</strong> {t('gradeBadge.ofWebPages', 'of web pages')}
        </span>
      </div>

      {/* Summary label */}
      <p className="text-xs text-slate-300 max-w-xs font-medium leading-relaxed">
        {description}
      </p>
    </div>
  );
}
