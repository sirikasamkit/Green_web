import React from 'react';
import { Leaf, Heart, ExternalLink, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-emerald-900/30 bg-[#070c09] mt-20 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                <Leaf className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="font-extrabold text-base text-white tracking-tight">
                GREEN<span className="text-emerald-400">WEB</span> ANALYZER
              </span>
            </div>
            <p className="text-slate-400 max-w-sm text-xs leading-relaxed">
              {t('footer.desc')}
            </p>
            <div className="flex items-center space-x-2 text-[11px] text-emerald-400 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Powered by @tgwf/co2 & The Green Web Foundation</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">{t('footer.navTitle')}</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-emerald-400 transition-colors">{t('nav.analyzer')}</Link>
              </li>
              <li>
                <Link to="/optimizer" className="hover:text-emerald-400 transition-colors">{t('nav.optimizer')}</Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-emerald-400 transition-colors">{t('nav.history')}</Link>
              </li>
              <li>
                <Link to="/compare" className="hover:text-emerald-400 transition-colors">{t('nav.compare')}</Link>
              </li>
              <li>
                <Link to="/methodology" className="hover:text-emerald-400 transition-colors">{t('nav.methodology')}</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Standards & References */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">{t('footer.resourcesTitle')}</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://sustainablewebdesign.org"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 hover:text-emerald-400 transition-colors"
                >
                  Sustainable Web Design <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.thegreenwebfoundation.org"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 hover:text-emerald-400 transition-colors"
                >
                  The Green Web Foundation <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://w3c.github.io/sustyweb/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 hover:text-emerald-400 transition-colors"
                >
                  W3C Web Sustainability <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-emerald-950 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <div>© {new Date().getFullYear()} Green Web Analyzer. {t('footer.rights')}</div>
          <div className="flex items-center space-x-1">
            <span>Crafted with</span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
            <span>{t('footer.forPlanet')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
