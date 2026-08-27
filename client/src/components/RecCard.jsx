import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle2, Code, Copy, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const IMPACT_STYLES = {
  HIGH: {
    badge: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  },
  MEDIUM: {
    badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  },
  LOW: {
    badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  },
};

export default function RecCard({ recommendation }) {
  const { language, t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const impact = IMPACT_STYLES[recommendation.impact] || IMPACT_STYLES.LOW;

  const handleCopyCode = (e) => {
    e.stopPropagation();
    if (recommendation.codeSnippet) {
      navigator.clipboard.writeText(recommendation.codeSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Select appropriate fields according to current language
  const displayTitle = language === 'th' ? recommendation.title : (recommendation.title_en || recommendation.title);
  const displayDesc = language === 'th' ? recommendation.description : (recommendation.description_en || recommendation.description);
  const displaySuggestion = language === 'th' ? recommendation.suggestion : (recommendation.suggestion_en || recommendation.suggestion);
  const displayCategory = language === 'th' ? (recommendation.category_th || recommendation.category) : (recommendation.category || recommendation.category_th);

  const impactLabel = recommendation.impact === 'HIGH' ? t('report.filterHigh') : recommendation.impact === 'MEDIUM' ? t('report.filterMedium') : t('report.filterLow');

  return (
    <div className="glass-panel rounded-2xl border border-emerald-900/40 overflow-hidden transition-all duration-200 hover:border-emerald-500/40">
      {/* Header / Summary row */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-5 flex items-start sm:items-center justify-between gap-4 cursor-pointer select-none hover:bg-slate-800/20"
      >
        <div className="flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            {/* Impact Badge */}
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${impact.badge}`}>
              {impactLabel}
            </span>
            {/* Category */}
            <span className="text-[11px] font-semibold text-slate-400">
              {displayCategory}
            </span>
            {/* Savings percentage */}
            {recommendation.co2_savings_pct && (
              <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-800/40">
                ⚡ ~{recommendation.co2_savings_pct}% {t('report.co2Reduction')}
              </span>
            )}
          </div>

          <h4 className="text-sm sm:text-base font-bold text-white leading-snug">
            {displayTitle}
          </h4>

          <p className="text-xs text-slate-400 line-clamp-2">
            {displayDesc}
          </p>
        </div>

        {/* Expand / Collapse Icon */}
        <div className="p-2 rounded-lg bg-slate-900 border border-emerald-900/40 text-slate-400 hover:text-white flex-shrink-0">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-5 pt-0 border-t border-emerald-900/30 bg-[#070c09]/60 space-y-4 animate-fade-in">
          {/* Actionable Suggestion */}
          <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/30 text-xs text-emerald-200">
            <strong className="text-emerald-400 block mb-1 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {t('report.actionableFix')}
            </strong>
            {displaySuggestion}
          </div>

          {/* Code Snippet if available */}
          {recommendation.codeSnippet && (
            <div className="rounded-xl overflow-hidden border border-slate-800 bg-[#050806]">
              <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900/80 border-b border-slate-800 text-xs text-slate-400">
                <span className="flex items-center gap-1.5 font-mono text-[11px]">
                  <Code className="w-3.5 h-3.5 text-emerald-400" /> {t('report.exampleCode')}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-emerald-400 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" /> {t('report.copied')}
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> {t('report.copyCode')}
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3.5 text-[11px] font-mono text-emerald-300 overflow-x-auto">
                <code>{recommendation.codeSnippet}</code>
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
