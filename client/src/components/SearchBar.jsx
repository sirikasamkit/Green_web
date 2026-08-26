import React, { useState, useEffect } from 'react';
import { Search, Monitor, Smartphone, ArrowRight, Loader2, Globe, Zap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const PRESETS = [
  { name: 'Wikipedia', url: 'https://en.wikipedia.org', tag: 'Fast & Lean' },
  { name: 'Apple', url: 'https://www.apple.com', tag: 'Media Rich' },
  { name: 'Stripe', url: 'https://stripe.com', tag: 'Fintech' },
  { name: 'Greenpeace', url: 'https://www.greenpeace.org', tag: 'Eco Leader' },
  { name: 'GitHub', url: 'https://github.com', tag: 'Developer' },
];

export default function SearchBar({ onScan, isLoading, initialUrl = '' }) {
  const { t } = useLanguage();
  const [url, setUrl] = useState(initialUrl);
  const [device, setDevice] = useState('desktop');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const steps = t('search.steps', [
    '🚀 Launching headless browser...',
    '🌐 Inspecting network waterfall...',
    '🌿 Verifying green host status...',
    '⚡ Computing carbon footprint...',
    '📋 Generating audit report...',
  ]);

  useEffect(() => {
    if (initialUrl) setUrl(initialUrl);
  }, [initialUrl]);

  useEffect(() => {
    let interval;
    if (isLoading) {
      setCurrentStepIndex(0);
      interval = setInterval(() => {
        setCurrentStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isLoading, steps.length]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanUrl = url.trim();
    if (!cleanUrl || isLoading) return;

    // Check if user forgot domain extension (e.g. typed www.something without .com)
    const domainRegex = /^(https?:\/\/)?([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(\/.*)?$/i;
    if (!domainRegex.test(cleanUrl) && !cleanUrl.includes('localhost')) {
      alert(`URL "${cleanUrl}" ขาดนามสกุลโดเมนที่ถูกต้อง กรุณาระบุ เช่น ${cleanUrl}.com หรือ .org`);
      return;
    }

    onScan(cleanUrl, device);
  };

  const handleSelectPreset = (presetUrl) => {
    setUrl(presetUrl);
    onScan(presetUrl, device);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Search Container */}
      <form
        onSubmit={handleSubmit}
        className="glass-panel p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-emerald-500/30 shadow-2xl shadow-emerald-950/50 relative overflow-hidden group"
      >
        {/* Ambient background glow */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-500" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-green-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-green-500/20 transition-all duration-500" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-3">
          {/* URL Input Box */}
          <div className="flex-1 w-full flex items-center bg-[#070d0a] border border-emerald-900/60 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-500/20 rounded-xl px-4 py-3 transition-all duration-200">
            <Globe className="w-5 h-5 text-emerald-400 mr-3 flex-shrink-0" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={t('search.placeholder')}
              disabled={isLoading}
              className="w-full bg-transparent text-white placeholder-slate-500 text-sm sm:text-base focus:outline-none disabled:opacity-50 font-medium"
            />
            {url && !isLoading && (
              <button
                type="button"
                onClick={() => setUrl('')}
                className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1"
              >
                {t('search.clear')}
              </button>
            )}
          </div>

          {/* Device Selector & Scan Button */}
          <div className="w-full md:w-auto flex items-center gap-2 justify-between">
            {/* Device Toggle */}
            <div className="flex bg-[#070d0a] p-1 rounded-xl border border-emerald-900/60">
              <button
                type="button"
                onClick={() => setDevice('desktop')}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  device === 'desktop'
                    ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Desktop Viewport"
              >
                <Monitor className="w-4 h-4" />
                <span className="hidden sm:inline">{t('search.desktop')}</span>
              </button>
              <button
                type="button"
                onClick={() => setDevice('mobile')}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  device === 'mobile'
                    ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Mobile Viewport"
              >
                <Smartphone className="w-4 h-4" />
                <span className="hidden sm:inline">{t('search.mobile')}</span>
              </button>
            </div>

            {/* Scan Action Button */}
            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="flex-1 md:flex-initial flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-500 to-green-400 hover:from-emerald-400 hover:to-green-300 text-slate-950 font-bold px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{t('search.scanningBtn')}</span>
                </>
              ) : (
                <>
                  <span>{t('search.auditBtn')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Progress Bar during active scan */}
        {isLoading && (
          <div className="mt-4 pt-4 border-t border-emerald-900/40 animate-fade-in">
            <div className="flex items-center justify-between text-xs text-emerald-300 mb-2">
              <span className="flex items-center space-x-2 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>{steps[currentStepIndex]}</span>
              </span>
              <span className="font-mono text-emerald-400 font-bold">
                {Math.round(((currentStepIndex + 1) / steps.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-emerald-900/40">
              <div
                className="bg-gradient-to-r from-emerald-500 via-green-400 to-teal-300 h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </form>

      {/* Preset Quick Chips */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
        <span className="flex items-center text-slate-500 font-medium mr-1">
          <Zap className="w-3.5 h-3.5 text-emerald-400 mr-1" /> {t('search.quickPresets')}
        </span>
        {PRESETS.map((preset) => (
          <button
            key={preset.name}
            onClick={() => handleSelectPreset(preset.url)}
            disabled={isLoading}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-800/30 hover:border-emerald-500/50 text-slate-300 hover:text-emerald-300 transition-all duration-150 disabled:opacity-50"
          >
            <span className="font-semibold text-white">{preset.name}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400">
              {preset.tag}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
