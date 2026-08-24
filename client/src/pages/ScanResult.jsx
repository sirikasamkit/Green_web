import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Globe,
  Share2,
  RefreshCw,
  GitCompare,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Zap,
  Sliders,
  AlertTriangle,
  Monitor,
  Smartphone,
  ExternalLink,
  Printer
} from 'lucide-react';
import GradeBadge from '../components/GradeBadge';
import { ResourceBreakdownChart, CarbonBenchmarkChart, EquivalenciesGrid } from '../components/Charts';
import RecCard from '../components/RecCard';
import { scanApi } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 KB';
  const k = 1024;
  if (bytes < k * k) return `${(bytes / k).toFixed(1)} KB`;
  return `${(bytes / (k * k)).toFixed(2)} MB`;
}

export default function ScanResult() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const [scan, setScan] = useState(location.state?.scanResult || null);
  const [loading, setLoading] = useState(!scan);
  const [error, setError] = useState(null);
  const [monthlyTraffic, setMonthlyTraffic] = useState(10000);
  const [filterImpact, setFilterImpact] = useState('ALL');
  const [copiedUrl, setCopiedUrl] = useState(false);

  useEffect(() => {
    if (!scan && id) {
      setLoading(true);
      scanApi.getScanById(id)
        .then((res) => {
          if (res?.data) {
            setScan(res.data);
            if (res.data.grade === 'A+' || res.data.grade === 'A') {
              triggerConfetti();
            }
          } else {
            setError(t('report.notFoundTitle'));
          }
        })
        .catch((err) => {
          console.error(err);
          setError(t('report.notFoundTitle'));
        })
        .finally(() => setLoading(false));
    } else if (scan && (scan.grade === 'A+' || scan.grade === 'A')) {
      triggerConfetti();
    }
  }, [id]);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#10b981', '#4ade80', '#34d399']
      });
    } catch (e) {}
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleRerun = async () => {
    if (!scan?.url) return;
    setLoading(true);
    try {
      const res = await scanApi.scanUrl(scan.url, scan.device_type || 'desktop');
      if (res?.data?.id) {
        navigate(`/scan/${res.data.id}`, { state: { scanResult: res.data } });
        setScan(res.data);
      }
    } catch (err) {
      alert('Failed to rerun scan: ' + (err.message || 'Error'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-24 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <h2 className="text-xl font-bold text-white">{t('report.loadingReport')}</h2>
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center glass-panel p-8 rounded-3xl space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">{t('report.notFoundTitle')}</h2>
        <Link
          to="/"
          className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-emerald-500 text-black font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('report.backToScanner')}</span>
        </Link>
      </div>
    );
  }

  // Dynamic calculations based on monthly traffic slider
  const annualVisits = monthlyTraffic * 12;
  const annualGrams = scan.carbon_grams * annualVisits;
  const dynamicEquivalencies = {
    annual_kg_co2: Number((annualGrams / 1000).toFixed(2)),
    trees_needed: Number((annualGrams / 21770).toFixed(2)),
    car_km_driven: Number((annualGrams / 120).toFixed(1)),
    tea_cups_boiled: Math.round(annualGrams / 7),
  };

  const recommendations = scan.recommendations || [];
  const filteredRecs = recommendations.filter((r) => {
    if (filterImpact === 'ALL') return true;
    return r.impact === filterImpact;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-emerald-900/40">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Link
              to="/"
              className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> {t('report.backToScanner')}
            </Link>
            <span className="text-slate-600">•</span>
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              {scan.device_type === 'mobile' ? (
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Monitor className="w-3.5 h-3.5 text-emerald-400" />
              )}
              {scan.device_type === 'mobile' ? t('report.mobileViewport') : t('report.desktopViewport')}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            <span>{scan.domain}</span>
            <a
              href={scan.url}
              target="_blank"
              rel="noreferrer"
              className="text-slate-500 hover:text-emerald-400 transition-colors"
              title="Open Target Website"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </h1>

          <p className="text-xs text-slate-400 flex items-center gap-2 font-mono">
            <span>{scan.url}</span>
            <span className="text-slate-600">|</span>
            <span>{t('report.auditedOn')} {new Date(scan.created_at).toLocaleDateString()}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleShare}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-emerald-900/50 hover:border-emerald-500/40 text-xs font-semibold text-slate-300 hover:text-white transition-all"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{copiedUrl ? t('report.linkCopied') : t('report.shareReport')}</span>
          </button>

          <button
            onClick={() => navigate('/compare', { state: { presetIds: [scan.id] } })}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-emerald-900/50 hover:border-emerald-500/40 text-xs font-semibold text-slate-300 hover:text-white transition-all"
          >
            <GitCompare className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('report.compareSite')}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-emerald-900/50 hover:border-emerald-500/40 text-xs font-semibold text-slate-300 hover:text-white transition-all"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('report.exportPrint')}</span>
          </button>

          <button
            onClick={handleRerun}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t('report.rerunScan')}</span>
          </button>
        </div>
      </div>

      {/* Main Score & Green Hosting Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Col 1: Grade Badge */}
        <div className="lg:col-span-1">
          <GradeBadge
            grade={scan.grade}
            carbonGrams={scan.carbon_grams}
            cleanerThan={scan.cleaner_than_pct}
          />
        </div>

        {/* Col 2 & 3: Key Performance & Eco Indicators */}
        <div className="lg:col-span-2 space-y-4">
          {/* Green Hosting Banner */}
          <div
            className={`p-6 rounded-3xl border flex items-start justify-between gap-4 ${
              scan.is_green_host
                ? 'bg-emerald-950/40 border-emerald-500/40'
                : 'bg-slate-900/80 border-slate-800'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                {scan.is_green_host ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-slate-400" />
                )}
                <h3 className="text-base font-bold text-white">
                  {scan.is_green_host ? t('report.greenHostVerified') : t('report.standardGridHost')}
                </h3>
              </div>
              <p className="text-xs text-slate-300">
                {scan.is_green_host ? t('report.greenHostDesc') : t('report.standardGridDesc')}
              </p>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-bold font-mono uppercase tracking-wider flex-shrink-0 ${
                scan.is_green_host
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {scan.is_green_host ? '100% Green' : 'Standard Grid'}
            </span>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-emerald-900/30">
              <div className="text-[11px] text-slate-400">{t('report.totalPageSize')}</div>
              <div className="text-lg sm:text-xl font-bold text-white font-mono mt-1">
                {formatBytes(scan.page_size_bytes)}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-emerald-900/30">
              <div className="text-[11px] text-slate-400">{t('report.httpRequests')}</div>
              <div className="text-lg sm:text-xl font-bold text-white font-mono mt-1">
                {scan.requests_count}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-emerald-900/30">
              <div className="text-[11px] text-slate-400">{t('report.loadTime')}</div>
              <div className="text-lg sm:text-xl font-bold text-white font-mono mt-1">
                {(scan.load_time_ms / 1000).toFixed(2)}s
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-emerald-900/30">
              <div className="text-[11px] text-slate-400">{t('report.ttfb')}</div>
              <div className="text-lg sm:text-xl font-bold text-white font-mono mt-1">
                {scan.ttfb_ms}ms
              </div>
            </div>
          </div>

          {/* Traffic Carbon Impact Simulator */}
          <div className="p-6 rounded-3xl glass-panel border border-emerald-900/40 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">{t('report.trafficSimulatorTitle')}</h4>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-800/40">
                {monthlyTraffic.toLocaleString()} {t('report.visitsPerMonth')}
              </span>
            </div>

            <input
              type="range"
              min="1000"
              max="500000"
              step="5000"
              value={monthlyTraffic}
              onChange={(e) => setMonthlyTraffic(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />

            <EquivalenciesGrid equivalencies={dynamicEquivalencies} monthlyViews={monthlyTraffic} />
          </div>
        </div>
      </div>

      {/* Visual Analytics & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ResourceBreakdownChart
          breakdown={scan.resource_breakdown}
          totalBytes={scan.page_size_bytes}
        />
        <CarbonBenchmarkChart currentGrams={scan.carbon_grams} domain={scan.domain} />
      </div>

      {/* Actionable Eco Audit Recommendations */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-400" />
              {t('report.recsTitle')}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {t('report.recsSubtitle')}
            </p>
          </div>

          {/* Filter Chips */}
          <div className="flex items-center space-x-1.5 p-1 bg-slate-900 rounded-xl border border-emerald-900/40 text-xs">
            {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterImpact(filter)}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  filterImpact === filter
                    ? 'bg-emerald-500 text-black font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {filter === 'ALL' ? t('report.filterAll') : filter === 'HIGH' ? t('report.filterHigh') : filter === 'MEDIUM' ? t('report.filterMedium') : t('report.filterLow')}
              </button>
            ))}
          </div>
        </div>

        {/* Recommendations list */}
        {filteredRecs.length > 0 ? (
          <div className="space-y-3">
            {filteredRecs.map((rec) => (
              <RecCard key={rec.id} recommendation={rec} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center glass-panel rounded-2xl text-xs text-slate-400">
            No recommendations match the selected filter.
          </div>
        )}
      </div>

      {/* Screenshot Preview Card if available */}
      {scan.screenshot_url && (
        <div className="glass-panel p-6 rounded-3xl border border-emerald-900/40 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400" />
            {t('report.viewportRender')}
          </h3>
          <div className="rounded-2xl overflow-hidden border border-emerald-900/40 bg-black/50 max-h-96">
            <img
              src={scan.screenshot_url}
              alt={`Screenshot of ${scan.domain}`}
              className="w-full object-cover object-top hover:scale-[1.01] transition-transform duration-300"
            />
          </div>
        </div>
      )}
    </div>
  );
}
