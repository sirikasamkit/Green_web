import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  GitCompare,
  Trophy,
  Plus,
  ArrowLeft,
  ExternalLink,
  CheckCircle,
  XCircle,
  Loader2,
  Sparkles
} from 'lucide-react';
import GradeBadge from '../components/GradeBadge';
import { scanApi } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 KB';
  const k = 1024;
  if (bytes < k * k) return `${(bytes / k).toFixed(1)} KB`;
  return `${(bytes / (k * k)).toFixed(2)} MB`;
}

// Default benchmark presets if history is empty
const BENCHMARK_PRESETS = [
  {
    id: 'preset_wiki',
    domain: 'en.wikipedia.org',
    url: 'https://en.wikipedia.org',
    title: 'Wikipedia, the free encyclopedia',
    carbon_grams: 0.082,
    grade: 'A+',
    cleaner_than_pct: 94,
    page_size_bytes: 520000,
    requests_count: 36,
    load_time_ms: 540,
    is_green_host: true,
    equivalencies: { annual_kg_co2: 9.84 }
  },
  {
    id: 'preset_greenpeace',
    domain: 'greenpeace.org',
    url: 'https://www.greenpeace.org',
    title: 'Greenpeace International',
    carbon_grams: 0.145,
    grade: 'A',
    cleaner_than_pct: 88,
    page_size_bytes: 820000,
    requests_count: 28,
    load_time_ms: 780,
    is_green_host: true,
    equivalencies: { annual_kg_co2: 17.4 }
  },
  {
    id: 'preset_stripe',
    domain: 'stripe.com',
    url: 'https://stripe.com',
    title: 'Stripe | Financial Infrastructure for the Internet',
    carbon_grams: 0.385,
    grade: 'C',
    cleaner_than_pct: 54,
    page_size_bytes: 1450000,
    requests_count: 42,
    load_time_ms: 920,
    is_green_host: false,
    equivalencies: { annual_kg_co2: 46.2 }
  },
  {
    id: 'preset_apple',
    domain: 'apple.com',
    url: 'https://apple.com',
    title: 'Apple (Official)',
    carbon_grams: 0.720,
    grade: 'E',
    cleaner_than_pct: 18,
    page_size_bytes: 2850000,
    requests_count: 68,
    load_time_ms: 1240,
    is_green_host: true,
    equivalencies: { annual_kg_co2: 86.4 }
  }
];

export default function Compare() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const presetIds = location.state?.presetIds || [];

  const [availableScans, setAvailableScans] = useState([]);
  const [selectedIds, setSelectedIds] = useState(presetIds);
  const [compareData, setCompareData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [isScanningNew, setIsScanningNew] = useState(false);

  // Fetch available scans
  useEffect(() => {
    scanApi.getHistory({ limit: 30 })
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : (res?.data?.scans || []);
        if (list.length > 0) {
          setAvailableScans(list);
          if (selectedIds.length === 0 && list.length >= 2) {
            setSelectedIds([list[0].id, list[1].id]);
          } else if (selectedIds.length === 1 && list.length >= 2) {
            const second = list.find((s) => s.id !== selectedIds[0]);
            if (second) setSelectedIds([selectedIds[0], second.id]);
          }
        } else {
          // Fallback to benchmarks if empty
          setAvailableScans(BENCHMARK_PRESETS);
          if (selectedIds.length === 0) {
            setSelectedIds(['preset_wiki', 'preset_greenpeace']);
          }
        }
      })
      .catch((err) => {
        console.error(err);
        setAvailableScans(BENCHMARK_PRESETS);
        if (selectedIds.length === 0) {
          setSelectedIds(['preset_wiki', 'preset_greenpeace']);
        }
      });
  }, []);

  // Fetch comparison data when selectedIds change
  useEffect(() => {
    if (selectedIds.length >= 2) {
      setLoading(true);

      // Check if comparing benchmark presets locally
      const presetMatches = BENCHMARK_PRESETS.filter((p) => selectedIds.includes(p.id));
      const availableMatches = availableScans.filter((s) => selectedIds.includes(s.id));
      const combined = [...availableMatches];
      presetMatches.forEach((p) => {
        if (!combined.some((c) => c.id === p.id)) combined.push(p);
      });

      scanApi.compareScans(selectedIds)
        .then((res) => {
          const fetchedScans = res?.data?.scans || res?.data?.items || [];
          if (fetchedScans.length >= 2) {
            setCompareData(res.data);
          } else if (combined.length >= 2) {
            // Local fallback calculation
            const winnerCarbon = [...combined].sort((a, b) => (a.carbon_grams || 0) - (b.carbon_grams || 0))[0];
            const winnerSpeed = [...combined].sort((a, b) => (a.load_time_ms || 0) - (b.load_time_ms || 0))[0];
            const winnerSize = [...combined].sort((a, b) => (a.page_size_bytes || 0) - (b.page_size_bytes || 0))[0];
            setCompareData({
              scans: combined,
              highlights: {
                cleanest: winnerCarbon ? { id: winnerCarbon.id, domain: winnerCarbon.domain, carbon_grams: winnerCarbon.carbon_grams } : null,
                fastest: winnerSpeed ? { id: winnerSpeed.id, domain: winnerSpeed.domain, load_time_ms: winnerSpeed.load_time_ms } : null,
                lightest: winnerSize ? { id: winnerSize.id, domain: winnerSize.domain, page_size_bytes: winnerSize.page_size_bytes } : null,
              }
            });
          }
        })
        .catch(() => {
          if (combined.length >= 2) {
            const winnerCarbon = [...combined].sort((a, b) => (a.carbon_grams || 0) - (b.carbon_grams || 0))[0];
            setCompareData({
              scans: combined,
              highlights: { cleanest: winnerCarbon }
            });
          }
        })
        .finally(() => setLoading(false));
    } else {
      setCompareData(null);
    }
  }, [selectedIds, availableScans]);

  const handleToggleId = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      if (selectedIds.length >= 4) {
        alert(t('compare.maxLimit'));
        return;
      }
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleScanAndAdd = async (e) => {
    e.preventDefault();
    if (!newUrl.trim() || isScanningNew) return;
    setIsScanningNew(true);
    try {
      const res = await scanApi.scanUrl(newUrl.trim());
      if (res?.data?.id) {
        setAvailableScans((prev) => [res.data, ...prev]);
        setSelectedIds((prev) => [...prev.slice(0, 3), res.data.id]);
        setNewUrl('');
      }
    } catch (err) {
      alert('Scan failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsScanningNew(false);
    }
  };

  const loadPresetPair = (pair) => {
    setSelectedIds(pair);
  };

  const scans = compareData?.scans || compareData?.items || [];
  const highlights = compareData?.highlights || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-emerald-900/40">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            <GitCompare className="w-6 h-6 text-emerald-400" />
            {t('compare.title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {t('compare.subtitle')}
          </p>
        </div>

        <Link
          to="/history"
          className="inline-flex items-center space-x-2 text-xs text-slate-400 hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('history.title')}</span>
        </Link>
      </div>

      {/* Selector & Quick Scan Input Bar */}
      <div className="glass-panel p-6 rounded-3xl border border-emerald-900/40 space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white">{t('compare.selectPrompt')}</h3>
            <p className="text-xs text-slate-400">{t('compare.selectSub')}</p>
          </div>

          {/* Quick Add URL form */}
          <form onSubmit={handleScanAndAdd} className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="text"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder={t('compare.auditNewAdd')}
              disabled={isScanningNew}
              className="bg-[#070d0a] border border-emerald-900/60 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none w-full md:w-64"
            />
            <button
              type="submit"
              disabled={isScanningNew || !newUrl.trim()}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1 disabled:opacity-50 flex-shrink-0"
            >
              {isScanningNew ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{t('compare.addBtn')}</span>
            </button>
          </form>
        </div>

        {/* Selected / Available Chips */}
        <div className="flex flex-wrap gap-2 pt-2">
          {availableScans.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            return (
              <button
                key={item.id}
                onClick={() => handleToggleId(item.id)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  isSelected
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-sm shadow-emerald-500/20'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span>{item.domain}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-950 font-mono text-emerald-400">
                  {item.carbon_grams}g
                </span>
                {isSelected && <span className="text-emerald-400 font-bold">✓</span>}
              </button>
            );
          })}
        </div>

        {/* Quick Benchmark Comparison Shortcuts */}
        <div className="pt-2 border-t border-emerald-950/60 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 flex items-center gap-1 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> {t('compare.quickBenchmarks', 'Quick Benchmarks:')}
          </span>
          <button
            type="button"
            onClick={() => loadPresetPair(['preset_wiki', 'preset_apple'])}
            className="px-2.5 py-1 rounded-lg bg-[#070d0a] border border-emerald-900/40 text-[11px] text-slate-300 hover:text-emerald-300 hover:border-emerald-500/40"
          >
            Wikipedia vs Apple
          </button>
          <button
            type="button"
            onClick={() => loadPresetPair(['preset_greenpeace', 'preset_stripe'])}
            className="px-2.5 py-1 rounded-lg bg-[#070d0a] border border-emerald-900/40 text-[11px] text-slate-300 hover:text-emerald-300 hover:border-emerald-500/40"
          >
            Greenpeace vs Stripe
          </button>
          <button
            type="button"
            onClick={() => setSelectedIds(['preset_wiki', 'preset_greenpeace', 'preset_stripe', 'preset_apple'])}
            className="px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/30 text-[11px] text-emerald-300 hover:bg-emerald-500/20 ml-auto"
          >
            ⚡ {t('compare.compareAll', 'Compare All 4 Global Sites')}
          </button>
        </div>
      </div>

      {/* Comparison Matrix */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 flex items-center justify-center space-x-2">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
          <span>{t('compare.calculating', 'Calculating comparison...')}</span>
        </div>
      ) : scans.length < 2 ? (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-3">
          <GitCompare className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">{t('compare.selectAtLeastTwo')}</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {t('compare.subtitle')}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Winner Highlights Bar */}
          {highlights.cleanest && (
            <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-green-950/40 to-teal-950/60 border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400 shadow-md">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider font-bold text-emerald-400">
                    {t('compare.ecoWinner')}
                  </div>
                  <h3 className="text-lg font-extrabold text-white">
                    {highlights.cleanest.domain}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-emerald-900/50">
                  <span className="text-slate-400">{t('compare.cleanest')}: </span>
                  <strong className="text-emerald-400">{highlights.cleanest.carbon_grams}g CO2e</strong>
                </div>
                {highlights.lightest && (
                  <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-emerald-900/50">
                    <span className="text-slate-400">{t('compare.lightest')}: </span>
                    <strong className="text-cyan-400">{formatBytes(highlights.lightest.page_size_bytes)}</strong>
                  </div>
                )}
                {highlights.fastest && (
                  <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-emerald-900/50">
                    <span className="text-slate-400">{t('compare.fastest')}: </span>
                    <strong className="text-lime-400">{((highlights.fastest.load_time_ms || 600) / 1000).toFixed(2)}s</strong>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Side by Side Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {scans.map((site) => {
              const isWinner = site.id === highlights.cleanest?.id;
              return (
                <div
                  key={site.id}
                  className={`glass-panel p-6 rounded-3xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                    isWinner ? 'border-emerald-400/80 shadow-2xl shadow-emerald-950' : 'border-emerald-900/30'
                  }`}
                >
                  {isWinner && (
                    <div className="absolute top-0 right-0 bg-emerald-500 text-black text-[10px] font-extrabold px-3 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1">
                      <Trophy className="w-3 h-3" /> Winner
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Site Header */}
                    <div>
                      <h4 className="text-lg font-bold text-white truncate">{site.domain}</h4>
                      <p className="text-[11px] text-slate-400 truncate">{site.title || site.url}</p>
                    </div>

                    {/* Grade & Carbon */}
                    <div className="py-2 text-center">
                      <GradeBadge
                        grade={site.grade}
                        carbonGrams={site.carbon_grams}
                        cleanerThan={site.cleaner_than_pct}
                      />
                    </div>

                    {/* Metric Rows */}
                    <div className="space-y-2 pt-2 border-t border-emerald-950 text-xs">
                      <div className="flex justify-between py-1.5 border-b border-emerald-950/60">
                        <span className="text-slate-400">{t('report.totalPageSize')}</span>
                        <span className="font-mono font-bold text-white">{formatBytes(site.page_size_bytes)}</span>
                      </div>

                      <div className="flex justify-between py-1.5 border-b border-emerald-950/60">
                        <span className="text-slate-400">{t('report.httpRequests')}</span>
                        <span className="font-mono font-bold text-white">{site.requests_count}</span>
                      </div>

                      <div className="flex justify-between py-1.5 border-b border-emerald-950/60">
                        <span className="text-slate-400">{t('report.loadTime')}</span>
                        <span className="font-mono font-bold text-white">{((site.load_time_ms || 600) / 1000).toFixed(2)}s</span>
                      </div>

                      <div className="flex justify-between py-1.5 border-b border-emerald-950/60">
                        <span className="text-slate-400">{t('report.greenHostVerified')}</span>
                        <span>
                          {site.is_green_host ? (
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" /> 100% Green
                            </span>
                          ) : (
                            <span className="text-slate-400 flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" /> Standard
                            </span>
                          )}
                        </span>
                      </div>

                      <div className="flex justify-between py-1.5">
                        <span className="text-slate-400">{t('equivalencies.annualTotal')}</span>
                        <span className="font-mono font-bold text-emerald-400">
                          {site.equivalencies?.annual_kg_co2 || 0} kg
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* View Detailed Report button */}
                  <div className="pt-6">
                    <button
                      onClick={() => navigate(`/scan/${site.id}`, { state: { scanResult: site } })}
                      className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-emerald-900/50 hover:border-emerald-500/40 text-xs font-bold text-white transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>{t('compare.fullReport')}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
