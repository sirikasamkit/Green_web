import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Zap, BarChart3, Flame, Sparkles, ArrowRight } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import GradeBadge from '../components/GradeBadge';
import { scanApi } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function Home() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total_scans: 142,
    average_carbon_grams: 0.38,
    green_hosting_percentage: 64,
    top_cleanest: [],
  });

  useEffect(() => {
    // Load live stats
    scanApi.getStats()
      .then((res) => {
        if (res?.data) {
          setStats((prev) => ({ ...prev, ...res.data }));
        }
      })
      .catch(() => {});
  }, []);

  const handleStartScan = async (url, device) => {
    setIsScanning(true);
    setError(null);
    try {
      const response = await scanApi.scanUrl(url, device);
      if (response && response.data && response.data.id) {
        navigate(`/scan/${response.data.id}`, { state: { scanResult: response.data } });
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (err) {
      console.error('Scan error:', err);
      const rawMsg = err.response?.data?.error || err.message || '';
      let displayError = t('errors.generic', 'Failed to connect to the target website. Please check the URL and try again.');

      if (rawMsg.includes('NXDOMAIN') || rawMsg.includes('ไม่พบ') || rawMsg.includes('unreachable') || rawMsg.includes('ENOTFOUND')) {
        displayError = t('errors.nxdomain', 'Unable to reach website: Could not resolve domain name (DNS Error: NXDOMAIN). Please verify the URL.');
      } else if (rawMsg.includes('ขาดนามสกุล') || rawMsg.includes('valid domain') || rawMsg.includes('extension')) {
        displayError = t('errors.invalidUrl', 'Invalid URL: Please enter a full domain with extension (e.g. example.com).');
      } else if (rawMsg) {
        displayError = rawMsg;
      }

      setError(displayError);
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative pt-8 sm:pt-14 pb-8 overflow-hidden text-center max-w-5xl mx-auto px-4">
        {/* Background glow flares */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Badge */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-xs font-semibold text-emerald-300 mb-6 shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>{t('hero.badge')}</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.15] mb-6">
          {t('hero.title1')} <span className="eco-gradient-text">{t('hero.title2')}</span> {t('hero.title3')}
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          {t('hero.subtitle')}
        </p>

        {/* Search Bar Component */}
        <SearchBar onScan={handleStartScan} isLoading={isScanning} />

        {/* Error Notification */}
        {error && (
          <div className="mt-6 p-4 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs sm:text-sm max-w-xl mx-auto flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-rose-400 hover:text-white font-bold ml-3"
            >
              ✕
            </button>
          </div>
        )}
      </section>

      {/* Realtime Stats Bar */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 glass-panel rounded-3xl border border-emerald-900/40">
          <div className="text-center p-3">
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">
              {stats.total_scans > 0 ? stats.total_scans.toLocaleString() : '50+'}
            </div>
            <div className="text-xs text-slate-400 mt-1">{t('statsBar.scannedCount')}</div>
          </div>

          <div className="text-center p-3 border-l border-emerald-950">
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
              {stats.average_carbon_grams || '0.34'}g
            </div>
            <div className="text-xs text-slate-400 mt-1">{t('statsBar.avgCo2')}</div>
          </div>

          <div className="text-center p-3 border-l border-emerald-950">
            <div className="text-2xl sm:text-3xl font-black text-teal-400 font-mono">
              {stats.green_hosting_percentage}%
            </div>
            <div className="text-xs text-slate-400 mt-1">{t('statsBar.greenRatio')}</div>
          </div>

          <div className="text-center p-3 border-l border-emerald-950">
            <div className="text-2xl sm:text-3xl font-black text-lime-400 font-mono">
              SWD v4
            </div>
            <div className="text-xs text-slate-400 mt-1">{t('statsBar.standardModel')}</div>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            {t('features.title')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            {t('features.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 glass-panel rounded-3xl border border-emerald-900/30 glass-panel-hover space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">{t('features.f1_title')}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t('features.f1_desc')}
            </p>
          </div>

          <div className="p-6 glass-panel rounded-3xl border border-emerald-900/30 glass-panel-hover space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">{t('features.f2_title')}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t('features.f2_desc')}
            </p>
          </div>

          <div className="p-6 glass-panel rounded-3xl border border-emerald-900/30 glass-panel-hover space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">{t('features.f3_title')}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t('features.f3_desc')}
            </p>
          </div>
        </div>
      </section>

      {/* Cleanest Leaderboard Preview */}
      {stats.top_cleanest && stats.top_cleanest.length > 0 && (
        <section className="max-w-6xl mx-auto px-4">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-emerald-900/40">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-emerald-400" />
                  {t('leaderboard.title')}
                </h3>
                <p className="text-xs text-slate-400">{t('leaderboard.subtitle')}</p>
              </div>
              <button
                onClick={() => navigate('/history')}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
              >
                <span>{t('leaderboard.viewAll')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {stats.top_cleanest.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/scan/${item.id}`)}
                  className="p-4 rounded-2xl bg-[#070d0a] border border-emerald-950 hover:border-emerald-500/40 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="truncate mr-3">
                    <div className="font-bold text-sm text-white group-hover:text-emerald-300 truncate">
                      {item.domain}
                    </div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      {item.carbon_grams}g CO2e / visit
                    </div>
                  </div>
                  <GradeBadge grade={item.grade} carbonGrams={item.carbon_grams} size="small" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
