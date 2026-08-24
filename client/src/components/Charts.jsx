import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { TreePine, Car, Coffee, Zap, HardDrive } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const COLORS = {
  images: '#22c55e',     // Emerald Green
  javascript: '#eab308', // Yellow
  css: '#06b6d4',        // Cyan
  fonts: '#a855f7',      // Purple
  html: '#3b82f6',       // Blue
  media: '#f97316',      // Orange
  other: '#64748b',      // Slate
};

const LABELS = {
  images: 'Images',
  javascript: 'JavaScript',
  css: 'CSS Stylesheets',
  fonts: 'Web Fonts',
  html: 'HTML Document',
  media: 'Video / Audio',
  other: 'Other Assets',
};

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 KB';
  const k = 1024;
  if (bytes < k * k) return `${(bytes / k).toFixed(1)} KB`;
  return `${(bytes / (k * k)).toFixed(2)} MB`;
}

/**
 * 1. Donut Chart for Resource Breakdown
 */
export function ResourceBreakdownChart({ breakdown = {}, totalBytes = 0 }) {
  const { t } = useLanguage();

  const chartData = Object.keys(breakdown)
    .filter((key) => breakdown[key]?.bytes > 0)
    .map((key) => ({
      name: LABELS[key] || key,
      key,
      bytes: breakdown[key].bytes,
      count: breakdown[key].count || 0,
      percentage: totalBytes > 0 ? Math.round((breakdown[key].bytes / totalBytes) * 100) : 0,
      color: COLORS[key] || '#94a3b8',
    }))
    .sort((a, b) => b.bytes - a.bytes);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#0f1712] border border-emerald-500/40 p-3 rounded-xl shadow-xl text-xs">
          <div className="font-bold text-white mb-1 flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
            <span>{data.name}</span>
          </div>
          <div className="text-slate-300">
            Size: <strong className="text-emerald-400 font-mono">{formatBytes(data.bytes)}</strong> ({data.percentage}%)
          </div>
          <div className="text-slate-400">
            Requests: <strong className="text-white">{data.count}</strong>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel p-6 rounded-3xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-emerald-400" />
            {t('report.resourceBreakdown')}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">{t('report.resourceSubtitle')}</p>
        </div>
        <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
          {t('report.total')}: {formatBytes(totalBytes)}
        </span>
      </div>

      <div className="h-64 w-full">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="bytes"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#070c09" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-xs text-slate-500">
            No resource data recorded
          </div>
        )}
      </div>

      {/* Legend Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4 pt-4 border-t border-emerald-900/30">
        {chartData.map((item) => (
          <div key={item.key} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900/40 text-xs">
            <div className="flex items-center space-x-2 truncate">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-slate-300 truncate">{item.name}</span>
            </div>
            <span className="font-mono font-medium text-emerald-400 ml-2">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 2. Benchmark Comparison Bar Chart
 */
export function CarbonBenchmarkChart({ currentGrams = 0, domain = 'Current Site' }) {
  const { t } = useLanguage();

  const benchmarkData = [
    { name: 'Eco Target (A+)', grams: 0.095, fill: '#10b981' },
    { name: domain.length > 15 ? `${domain.slice(0, 12)}...` : domain, grams: currentGrams, fill: currentGrams <= 0.34 ? '#22c55e' : '#f59e0b' },
    { name: 'Global Average', grams: 0.500, fill: '#64748b' },
    { name: 'Heavy Website', grams: 1.250, fill: '#ef4444' },
  ];

  return (
    <div className="glass-panel p-6 rounded-3xl">
      <div className="mb-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-emerald-400" />
          {t('report.carbonBenchmark')}
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">{t('report.benchmarkSubtitle')}</p>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={benchmarkData} margin={{ top: 15, right: 10, left: -20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip
              formatter={(val) => [`${val} g CO2e`, 'Emissions']}
              contentStyle={{ backgroundColor: '#0f1712', borderColor: '#22c55e', borderRadius: '12px', fontSize: '12px' }}
            />
            <Bar dataKey="grams" radius={[6, 6, 0, 0]}>
              {benchmarkData.map((entry, index) => (
                <Cell key={`bar-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/**
 * 3. Environmental Equivalencies Grid
 */
export function EquivalenciesGrid({ equivalencies = {}, monthlyViews = 10000 }) {
  const { t } = useLanguage();

  const cards = [
    {
      title: t('equivalencies.annualTotal'),
      value: `${equivalencies.annual_kg_co2 || 0} kg`,
      unit: `${monthlyViews.toLocaleString()} ${t('report.visitsPerMonth')}`,
      icon: Zap,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: t('equivalencies.treesNeeded'),
      value: equivalencies.trees_needed || 0,
      unit: t('equivalencies.treesUnit'),
      icon: TreePine,
      color: 'text-green-400',
      bg: 'bg-green-500/10 border-green-500/20',
    },
    {
      title: t('equivalencies.carKm'),
      value: `${equivalencies.car_km_driven || 0} km`,
      unit: t('equivalencies.carUnit'),
      icon: Car,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      title: t('equivalencies.teaBoiled'),
      value: (equivalencies.tea_cups_boiled || 0).toLocaleString(),
      unit: t('equivalencies.teaUnit'),
      icon: Coffee,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10 border-cyan-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`p-5 rounded-2xl border ${card.bg} glass-panel-hover flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-300">{card.title}</span>
              <div className={`p-2 rounded-xl bg-slate-900/80 ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${card.color} font-mono`}>
                {card.value}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">{card.unit}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
