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
  Loader2
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

  // Fetch available scans for dropdown
  useEffect(() => {
    scanApi.getHistory({ limit: 30 })
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : (res?.data?.scans || []);
        setAvailableScans(list);
        if (selectedIds.length === 0 && list.length >= 2) {
          setSelectedIds([list[0].id, list[1].id]);
        }
      })
      .catch((err) => {
        console.error(err);
        setAvailableScans([]);
      });
  }, []);

  // Fetch comparison data when selectedIds change
  useEffect(() => {
    if (selectedIds.length >= 2) {
      setLoading(true);
      scanApi.compareScans(selectedIds)
        .then((res) => {
          if (res?.data) {
            setCompareData(res.data);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setCompareData(null);
    }
  }, [selectedIds]);

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

  const scans = compareData?.scans || [];
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
      </div>

      {/* Comparison Matrix */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mx-auto" />
          <p className="text-xs text-slate-400">Calculating comparison...</p>
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
                    <strong className="text-lime-400">{(highlights.fastest.load_time_ms / 1000).toFixed(2)}s</strong>
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
                        <span className="font-mono font-bold text-white">{(site.load_time_ms / 1000).toFixed(2)}s</span>
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
