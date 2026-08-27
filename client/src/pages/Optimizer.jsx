import React, { useState } from 'react';
import {
  Sparkles,
  Sliders,
  Image as ImageIcon,
  Terminal,
  Calculator,
  ShieldCheck,
  CheckCircle,
  ExternalLink,
  Zap,
  ArrowRight,
  Globe,
  Leaf
} from 'lucide-react';
import ImageOptimizer from '../components/ImageOptimizer';
import ConfigGenerator from '../components/ConfigGenerator';
import CarbonBudgetCalculator from '../components/CarbonBudgetCalculator';
import { useLanguage } from '../context/LanguageContext';

const GREEN_HOSTS = [
  {
    name: 'Google Cloud Platform (GCP)',
    badge: '100% Renewable Matching',
    type: 'Cloud / Infrastructure',
    description: 'Matches 100% of global electricity with renewable energy purchases. Clean regions available.',
    link: 'https://cloud.google.com/sustainability',
  },
  {
    name: 'Hetzner Online',
    badge: 'Hydro & Green Power',
    type: 'Dedicated / VPS',
    description: 'Data centers in Germany & Finland powered by 100% carbon-free hydropower.',
    link: 'https://www.hetzner.com/responsible-source',
  },
  {
    name: 'Cloudflare CDN',
    badge: '100% Renewable Powered',
    type: 'Edge Network / CDN',
    description: 'Global anycast edge network running on 100% renewable energy with automated edge compression.',
    link: 'https://www.cloudflare.com/impact/',
  },
  {
    name: 'Kinsta Managed WordPress',
    badge: 'GCP Green Regions',
    type: 'Managed Hosting',
    description: 'Built exclusively on Google Cloud Platform with automated C2 machines and Cloudflare enterprise.',
    link: 'https://kinsta.com/environmental-initiative/',
  },
];

const ECO_CHECKLIST = [
  { id: 1, text: 'Convert all JPEG and PNG banners to AVIF or WebP format (-50% payload)', impact: 'HIGH' },
  { id: 2, text: 'Set Cache-Control: public, max-age=31536000, immutable for all static assets', impact: 'HIGH' },
  { id: 3, text: 'Enable Brotli text compression on Nginx / Apache / Cloudflare (-15% data)', impact: 'HIGH' },
  { id: 4, text: 'Implement Dynamic Code Splitting (React.lazy / import()) to avoid monolithic bundles', impact: 'MEDIUM' },
  { id: 5, text: 'Support dark mode styles (@media (prefers-color-scheme: dark)) for OLED display energy savings', impact: 'MEDIUM' },
  { id: 6, text: 'Subset Web Fonts (WOFF2) to only English and native glyphs (-60% font size)', impact: 'LOW' },
  { id: 7, text: 'Host on a certified green data center listed on The Green Web Foundation', impact: 'HIGH' },
];

export default function Optimizer() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('budget'); // 'budget' | 'compressor' | 'configs' | 'hosting'
  const [checkedItems, setCheckedItems] = useState([1, 2]);

  const toggleCheck = (id) => {
    if (checkedItems.includes(id)) {
      setCheckedItems(checkedItems.filter((i) => i !== id));
    } else {
      setCheckedItems([...checkedItems, id]);
    }
  };

  const progressPercent = Math.round((checkedItems.length / ECO_CHECKLIST.length) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="glass-panel p-8 rounded-3xl border border-emerald-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-xs font-semibold text-emerald-300">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('optimizer.badge', 'Web Carbon Reduction & Optimization Studio')}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {t('optimizer.title', 'Practical Tools to Cut Web Carbon Emissions')}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            {t('optimizer.subtitle', 'Take direct action to decarbonize your digital products. Compress media to next-gen formats, generate production-ready server caching configs, set strict page weight budgets, and discover verified green web hosting providers.')}
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-900/80 rounded-2xl border border-emerald-950/60 text-xs">
        <button
          onClick={() => setActiveTab('budget')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold transition-all ${
            activeTab === 'budget'
              ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>{t('optimizer.tabBudget', 'Carbon Budget Planner')}</span>
        </button>

        <button
          onClick={() => setActiveTab('compressor')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold transition-all ${
            activeTab === 'compressor'
              ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>{t('optimizer.tabImage', 'Image WebP Compressor')}</span>
        </button>

        <button
          onClick={() => setActiveTab('configs')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold transition-all ${
            activeTab === 'configs'
              ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>{t('optimizer.tabConfig', 'Eco Config Generator')}</span>
        </button>

        <button
          onClick={() => setActiveTab('hosting')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold transition-all ${
            activeTab === 'hosting'
              ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{t('optimizer.tabHosting', 'Green Hosting Directory')}</span>
        </button>
      </div>

      {/* Main Tab View */}
      <div>
        {activeTab === 'budget' && <CarbonBudgetCalculator />}
        {activeTab === 'compressor' && <ImageOptimizer />}
        {activeTab === 'configs' && <ConfigGenerator />}
        {activeTab === 'hosting' && (
          <div className="glass-panel p-6 rounded-3xl border border-emerald-900/40 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-950/60 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  {t('optimizer.hostingTitle', 'Certified 100% Green Renewable Hosting Providers')}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {t('optimizer.hostingSubtitle', 'Migrating your infrastructure to zero-carbon energy immediately slashes your website emissions by 9% to 15%')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {GREEN_HOSTS.map((host, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-900/60 border border-emerald-950 hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {host.type}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-300">
                        {host.badge}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                      {host.name}
                    </h4>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {host.description}
                    </p>
                  </div>

                  <a
                    href={host.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors pt-2"
                  >
                    <span>{t('optimizer.viewCommitment', 'View Sustainability Commitment')}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actionable Low-Carbon Checklist */}
      <div className="glass-panel p-6 rounded-3xl border border-emerald-900/40 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              {t('optimizer.checklistTitle', 'Website Decarbonization Action Checklist')}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {t('optimizer.checklistSubtitle', 'Check off items as your engineering team applies them to achieve Grade A+ rating')}
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-slate-900/80 px-4 py-2 rounded-2xl border border-emerald-900/50">
            <span className="text-xs text-slate-400">{t('optimizer.completedTasks', 'Score:')}</span>
            <span className="text-sm font-mono font-bold text-emerald-400">{progressPercent}% Completed</span>
          </div>
        </div>

        <div className="space-y-2.5">
          {ECO_CHECKLIST.map((item) => {
            const isChecked = checkedItems.includes(item.id);
            return (
              <div
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className={`p-3.5 rounded-2xl border cursor-pointer select-none transition-all flex items-center justify-between gap-3 ${
                  isChecked
                    ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                    : 'bg-slate-900/40 border-slate-800/80 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                      isChecked
                        ? 'bg-emerald-500 border-emerald-400 text-black'
                        : 'border-slate-700 bg-slate-900'
                    }`}
                  >
                    {isChecked && <CheckCircle className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <span className={`text-xs font-medium ${isChecked ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                    {item.text}
                  </span>
                </div>

                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border flex-shrink-0 ${
                    item.impact === 'HIGH'
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      : item.impact === 'MEDIUM'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  }`}
                >
                  {item.impact}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
