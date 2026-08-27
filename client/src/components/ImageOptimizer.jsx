import React, { useState } from 'react';
import { Upload, Image as ImageIcon, Download, Sparkles, Check, ArrowRight, Zap, RefreshCw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function ImageOptimizer() {
  const { t } = useLanguage();
  const [originalFile, setOriginalFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [compressedBlob, setCompressedBlob] = useState(null);
  const [compressedUrl, setCompressedUrl] = useState(null);
  const [quality, setQuality] = useState(0.8);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPEG, etc.)');
      return;
    }

    setOriginalFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setCompressedBlob(null);
    setCompressedUrl(null);
    setStats(null);

    compressImage(file, quality);
  };

  const compressImage = (file, qual) => {
    setIsProcessing(true);
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (event) => {
      img.src = event.target?.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              setCompressedBlob(blob);
              setCompressedUrl(url);

              const origBytes = file.size;
              const newBytes = blob.size;
              const savedBytes = Math.max(0, origBytes - newBytes);
              const savedPercent = Math.round((savedBytes / origBytes) * 100);

              const co2Factor = 0.812 * 442 * 0.8125 / (1024 * 1024 * 1024);
              const co2Saved = (savedBytes * co2Factor).toFixed(4);

              setStats({
                origSize: (origBytes / 1024).toFixed(1),
                newSize: (newBytes / 1024).toFixed(1),
                savedBytes: (savedBytes / 1024).toFixed(1),
                savedPercent,
                co2SavedGrams: co2Saved,
              });
            }
            setIsProcessing(false);
          },
          'image/webp',
          qual
        );
      };
    };

    reader.readAsDataURL(file);
  };

  const handleQualityChange = (val) => {
    setQuality(val);
    if (originalFile) {
      compressImage(originalFile, val);
    }
  };

  const handleDownload = () => {
    if (!compressedUrl || !originalFile) return;
    const a = document.createElement('a');
    a.href = compressedUrl;
    const nameWithoutExt = originalFile.name.substring(0, originalFile.name.lastIndexOf('.')) || originalFile.name;
    a.download = `${nameWithoutExt}-eco-optimized.webp`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="glass-panel p-6 rounded-3xl border border-emerald-900/40 space-y-6">
      <div className="border-b border-emerald-950/60 pb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-emerald-400" />
          {t('optimizer.imageTitle', 'Next-Gen WebP Image Compressor')}
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          {t('optimizer.imageSubtitle', 'Shrink image payloads up to 80% without visible loss to accelerate page load and save carbon')}
        </p>
      </div>

      {!previewUrl ? (
        <label className="border-2 border-dashed border-emerald-800/60 hover:border-emerald-400/80 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all bg-emerald-950/20 hover:bg-emerald-950/40 text-center group">
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-110 transition-transform">
            <Upload className="w-6 h-6" />
          </div>
          <span className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
            {t('optimizer.dropPrompt', 'Drop an image here or click to browse')}
          </span>
          <span className="text-xs text-slate-400 mt-1">
            {t('optimizer.dropSub', 'Supports PNG, JPEG, GIF (Outputs lean WebP)')}
          </span>
        </label>
      ) : (
        <div className="space-y-6">
          {/* Controls & Comparison Slider */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-emerald-900/40">
            <div className="flex-1 space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <span>{t('optimizer.qualityLabel', 'WebP Compression Quality')}</span>
                <span className="text-emerald-400 font-mono font-bold">{Math.round(quality * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.4"
                max="0.95"
                step="0.05"
                value={quality}
                onChange={(e) => handleQualityChange(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>

            <label className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 cursor-pointer flex items-center gap-1.5 flex-shrink-0 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t('optimizer.chooseAnother', 'Choose Another')}</span>
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          </div>

          {/* Results Summary Card */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-950">
                <div className="text-[11px] text-slate-400">{t('optimizer.origSize', 'Original Size')}</div>
                <div className="text-lg font-bold text-white font-mono mt-1">{stats.origSize} KB</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/30">
                <div className="text-[11px] text-slate-400">{t('optimizer.newSize', 'WebP Size')}</div>
                <div className="text-lg font-bold text-emerald-400 font-mono mt-1">{stats.newSize} KB</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-950">
                <div className="text-[11px] text-slate-400">{t('optimizer.weightSaved', 'Weight Saved')}</div>
                <div className="text-lg font-bold text-teal-300 font-mono mt-1">-{stats.savedPercent}%</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-950">
                <div className="text-[11px] text-slate-400">{t('optimizer.co2SavedView', 'CO2 Saved / View')}</div>
                <div className="text-lg font-bold text-lime-400 font-mono mt-1">~{stats.co2SavedGrams}g</div>
              </div>
            </div>
          )}

          {/* Previews Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400">Original ({originalFile?.name})</span>
              <div className="h-56 rounded-2xl overflow-hidden border border-slate-800 bg-black/40 flex items-center justify-center p-2">
                <img src={previewUrl} alt="Original" className="max-h-full max-w-full object-contain rounded-lg" />
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-emerald-400">Optimized Next-Gen WebP</span>
              <div className="h-56 rounded-2xl overflow-hidden border border-emerald-500/40 bg-black/40 flex items-center justify-center p-2">
                {compressedUrl && (
                  <img src={compressedUrl} alt="Optimized" className="max-h-full max-w-full object-contain rounded-lg" />
                )}
              </div>
            </div>
          </div>

          {/* Download Action */}
          <button
            onClick={handleDownload}
            disabled={!compressedUrl || isProcessing}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-400 hover:from-emerald-400 hover:to-green-300 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{t('optimizer.downloadBtn', 'Download Lean WebP Image')}</span>
          </button>
        </div>
      )}
    </div>
  );
}
