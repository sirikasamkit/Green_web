import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  History as HistoryIcon,
  Search,
  Trash2,
  GitCompare,
  CheckCircle,
  Globe,
  Loader2,
  Plus
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

export default function History() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [greenOnly, setGreenOnly] = useState(false);
  const [sortBy, setSortBy] = useState('latest');
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchScans = async () => {
    setLoading(true);
    try {
      const res = await scanApi.getHistory({
        search: searchTerm,
        grade: gradeFilter,
        greenOnly,
        sort: sortBy,
        limit: 50,
      });
      const scanList = Array.isArray(res?.data) ? res.data : (res?.data?.scans || []);
      setScans(scanList);
    } catch (err) {
      console.error('Failed to load history:', err);
      setScans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScans();
  }, [searchTerm, gradeFilter, greenOnly, sortBy]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this scan record?')) return;
    try {
      await scanApi.deleteScan(id);
      setScans((prev) => prev.filter((s) => s.id !== id));
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    } catch (err) {
      alert('Failed to delete scan: ' + (err.message || 'Error'));
    }
  };

  const handleToggleSelect = (id) => {
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

  const handleCompareSelected = () => {
    if (selectedIds.length < 2) return;
    navigate('/compare', { state: { presetIds: selectedIds } });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-emerald-900/40">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            <HistoryIcon className="w-6 h-6 text-emerald-400" />
            {t('history.title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {t('history.subtitle')}
          </p>
        </div>

        {/* Compare Action Button for selected items */}
        {selectedIds.length >= 2 && (
          <button
            onClick={handleCompareSelected}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/30 transition-all animate-bounce"
          >
            <GitCompare className="w-4 h-4" />
            <span>{t('history.compareBtn')} ({selectedIds.length}) {t('history.sites')}</span>
          </button>
        )}
      </div>

      {/* Filter & Search Controls */}
      <div className="glass-panel p-4 rounded-2xl border border-emerald-900/40 flex flex-col md:flex-row items-center gap-3">
        {/* Search box */}
        <div className="flex-1 w-full flex items-center bg-[#070d0a] border border-emerald-900/60 rounded-xl px-3.5 py-2 text-xs">
          <Search className="w-4 h-4 text-emerald-400 mr-2 flex-shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('history.searchPlaceholder')}
            className="w-full bg-transparent text-white placeholder-slate-500 focus:outline-none font-medium"
          />
        </div>

        {/* Grade filter */}
        <select
          value={gradeFilter}
          onChange={(e) => setGradeFilter(e.target.value)}
          className="w-full md:w-auto bg-[#070d0a] border border-emerald-900/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
        >
          <option value="">{t('history.allGrades')}</option>
          <option value="A+">Grade A+ (Elite)</option>
          <option value="A">Grade A</option>
          <option value="B">Grade B</option>
          <option value="C">Grade C</option>
          <option value="D">Grade D</option>
          <option value="E">Grade E</option>
          <option value="F">Grade F (Critical)</option>
        </select>

        {/* Sort order */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full md:w-auto bg-[#070d0a] border border-emerald-900/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
        >
          <option value="latest">{t('history.sortLatest')}</option>
          <option value="cleanest">{t('history.sortCleanest')}</option>
          <option value="heaviest">{t('history.sortHeaviest')}</option>
          <option value="fastest">{t('history.sortFastest')}</option>
        </select>

        {/* Green only toggle */}
        <button
          type="button"
          onClick={() => setGreenOnly(!greenOnly)}
          className={`w-full md:w-auto px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
            greenOnly
              ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
              : 'bg-[#070d0a] border border-emerald-900/60 text-slate-300 hover:text-white'
          }`}
        >
          <span>{t('history.greenOnly')}</span>
        </button>
      </div>

      {/* Scans List / Table */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mx-auto" />
          <p className="text-xs text-slate-400">Loading records...</p>
        </div>
      ) : scans.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-4">
          <Globe className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">{t('history.noScans')}</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchTerm || gradeFilter || greenOnly
              ? 'No records match your active search or filters.'
              : 'You have not performed any website sustainability scans yet.'}
          </p>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 px-5 py-2 rounded-xl bg-emerald-500 text-black font-bold text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{t('history.scanFirst')}</span>
          </Link>
        </div>
      ) : (
        <div className="glass-panel rounded-3xl border border-emerald-900/40 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#070d0a]/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-emerald-900/40">
                <tr>
                  <th className="py-3 px-4 w-10 text-center">{t('history.colCompare')}</th>
                  <th className="py-3 px-4">{t('history.colDomain')}</th>
                  <th className="py-3 px-4 text-center">{t('history.colGrade')}</th>
                  <th className="py-3 px-4 text-right">{t('history.colCo2')}</th>
                  <th className="py-3 px-4 text-right">{t('history.colSize')}</th>
                  <th className="py-3 px-4 text-right">{t('history.colTime')}</th>
                  <th className="py-3 px-4 text-center">{t('history.colHost')}</th>
                  <th className="py-3 px-4 text-right">{t('history.colDate')}</th>
                  <th className="py-3 px-4 text-center w-16">{t('history.colAction')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-950/60">
                {scans.map((scan) => {
                  const isSelected = selectedIds.includes(scan.id);
                  return (
                    <tr
                      key={scan.id}
                      onClick={() => navigate(`/scan/${scan.id}`, { state: { scanResult: scan } })}
                      className={`hover:bg-slate-800/30 cursor-pointer transition-colors ${
                        isSelected ? 'bg-emerald-950/20' : ''
                      }`}
                    >
                      {/* Compare Checkbox */}
                      <td className="py-4 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(scan.id)}
                          className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-emerald-400 focus:ring-offset-slate-900 cursor-pointer"
                        />
                      </td>

                      {/* Domain & Title */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-white hover:text-emerald-300 truncate max-w-xs sm:max-w-md">
                          {scan.domain}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">
                          {scan.title || scan.url}
                        </div>
                      </td>

                      {/* Grade Badge */}
                      <td className="py-4 px-4 text-center">
                        <GradeBadge grade={scan.grade} carbonGrams={scan.carbon_grams} size="small" />
                      </td>

                      {/* Carbon Emissions */}
                      <td className="py-4 px-4 text-right font-mono font-bold text-emerald-400">
                        {scan.carbon_grams}g
                      </td>

                      {/* Page Size */}
                      <td className="py-4 px-4 text-right font-mono text-slate-300">
                        {formatBytes(scan.page_size_bytes)}
                      </td>

                      {/* Load Time */}
                      <td className="py-4 px-4 text-right font-mono text-slate-400">
                        {(scan.load_time_ms / 1000).toFixed(2)}s
                      </td>

                      {/* Green Host */}
                      <td className="py-4 px-4 text-center">
                        {scan.is_green_host ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40">
                            <CheckCircle className="w-3 h-3 text-emerald-400" /> Green
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                            Standard
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 text-right text-slate-500 text-[11px]">
                        {new Date(scan.created_at).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => handleDelete(e, scan.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                          title="Delete scan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
