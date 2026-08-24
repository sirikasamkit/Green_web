import React from 'react';
import { BookOpen, Leaf, Zap, Scale, ExternalLink } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Methodology() {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-12 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-xs font-semibold text-emerald-300">
          <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
          <span>{t('methodology.badge')}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          {t('methodology.title')}
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          {t('methodology.intro')}
        </p>
      </div>

      {/* 4 Pillars of Internet Energy */}
      <div className="glass-panel p-8 rounded-3xl border border-emerald-900/40 space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Scale className="w-5 h-5 text-emerald-400" />
          {t('methodology.pillarsTitle')}
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          {t('methodology.pillarsIntro')}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-emerald-950 space-y-1.5">
            <div className="text-xs font-bold text-emerald-400">{t('methodology.p1_title')}</div>
            <p className="text-xs text-slate-400">
              {t('methodology.p1_desc')}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-emerald-950 space-y-1.5">
            <div className="text-xs font-bold text-teal-400">{t('methodology.p2_title')}</div>
            <p className="text-xs text-slate-400">
              {t('methodology.p2_desc')}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-emerald-950 space-y-1.5">
            <div className="text-xs font-bold text-green-400">{t('methodology.p3_title')}</div>
            <p className="text-xs text-slate-400">
              {t('methodology.p3_desc')}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-emerald-950 space-y-1.5">
            <div className="text-xs font-bold text-lime-400">{t('methodology.p4_title')}</div>
            <p className="text-xs text-slate-400">
              {t('methodology.p4_desc')}
            </p>
          </div>
        </div>
      </div>

      {/* Calculation Formula */}
      <div className="glass-panel p-8 rounded-3xl border border-emerald-900/40 space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-emerald-400" />
          {t('methodology.formulaTitle')}
        </h2>

        <div className="p-4 rounded-2xl bg-[#050806] border border-emerald-900/50 font-mono text-xs text-emerald-300 space-y-2">
          <div>// 1. Energy in Kilowatt-Hours (kWh) per Gigabyte:</div>
          <div className="text-white">E = Data_Transferred_GB * 0.812 kWh/GB</div>
          <div className="pt-2">// 2. Carbon Emissions (Grams of CO2e):</div>
          <div className="text-white">CO2e = E * Carbon_Intensity_Grid (442 gCO2/kWh for standard, 50 gCO2/kWh for green)</div>
          <div className="pt-2">// 3. Blended Visit Calculation:</div>
          <div className="text-white">CO2_Visit = (First_Visit_CO2 * 0.75) + (Return_Visit_CO2 * 0.25)</div>
        </div>
      </div>

      {/* Grade Scale Table */}
      <div className="glass-panel p-8 rounded-3xl border border-emerald-900/40 space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Leaf className="w-5 h-5 text-emerald-400" />
          {t('methodology.gradeScaleTitle')}
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#070d0a] text-slate-400 uppercase font-semibold text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Grade</th>
                <th className="py-2.5 px-3">CO2e Range</th>
                <th className="py-2.5 px-3">Rating Status</th>
                <th className="py-2.5 px-3">Environmental Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-950/40 font-mono">
              <tr>
                <td className="py-2.5 px-3 font-bold text-emerald-400">A+</td>
                <td className="py-2.5 px-3 text-slate-300">≤ 0.095 g</td>
                <td className="py-2.5 px-3 text-emerald-300 font-sans">Exceptional</td>
                <td className="py-2.5 px-3 text-slate-400 font-sans">Ultra-lean static site, solar-powered.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-green-400">A</td>
                <td className="py-2.5 px-3 text-slate-300">0.096 – 0.186 g</td>
                <td className="py-2.5 px-3 text-green-300 font-sans">Great</td>
                <td className="py-2.5 px-3 text-slate-400 font-sans">Highly optimized, minimal third-party scripts.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-lime-400">B</td>
                <td className="py-2.5 px-3 text-slate-300">0.187 – 0.340 g</td>
                <td className="py-2.5 px-3 text-lime-300 font-sans">Good</td>
                <td className="py-2.5 px-3 text-slate-400 font-sans">Cleaner than 70% of global websites.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-amber-400">C</td>
                <td className="py-2.5 px-3 text-slate-300">0.341 – 0.493 g</td>
                <td className="py-2.5 px-3 text-amber-300 font-sans">Average</td>
                <td className="py-2.5 px-3 text-slate-400 font-sans">Typical corporate or marketing website.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-orange-400">D</td>
                <td className="py-2.5 px-3 text-slate-300">0.494 – 0.656 g</td>
                <td className="py-2.5 px-3 text-orange-300 font-sans">Poor</td>
                <td className="py-2.5 px-3 text-slate-400 font-sans">Heavy media, uncompressed assets.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-rose-400">E / F</td>
                <td className="py-2.5 px-3 text-slate-300">&gt; 0.656 g</td>
                <td className="py-2.5 px-3 text-rose-300 font-sans">Critical</td>
                <td className="py-2.5 px-3 text-slate-400 font-sans">Severe bloat, video auto-play, heavy tracking.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Official References */}
      <div className="glass-panel p-6 rounded-3xl border border-emerald-900/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white">{t('methodology.officialGuidelines')}</h4>
          <p className="text-xs text-slate-400">Read the open-source Sustainable Web Design specifications.</p>
        </div>
        <a
          href="https://sustainablewebdesign.org/guidelines/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-black font-bold text-xs"
        >
          <span>{t('methodology.officialGuidelines')}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
