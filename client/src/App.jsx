import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { Loader2 } from 'lucide-react';

// Dynamic Code-Splitting (Lazy Loading) to minimize initial page payload and carbon emissions
const Home = lazy(() => import('./pages/Home'));
const Optimizer = lazy(() => import('./pages/Optimizer'));
const ScanResult = lazy(() => import('./pages/ScanResult'));
const History = lazy(() => import('./pages/History'));
const Compare = lazy(() => import('./pages/Compare'));
const Methodology = lazy(() => import('./pages/Methodology'));

function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      <span className="text-xs text-slate-400 font-mono">Loading lean module...</span>
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-[#070c09] text-slate-100 selection:bg-emerald-500 selection:text-black">
          {/* Top Navbar */}
          <Navbar />

          {/* Main Content View with Suspense code splitting */}
          <main className="flex-1">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/optimizer" element={<Optimizer />} />
                <Route path="/scan/:id" element={<ScanResult />} />
                <Route path="/history" element={<History />} />
                <Route path="/compare" element={<Compare />} />
                <Route path="/methodology" element={<Methodology />} />
              </Routes>
            </Suspense>
          </main>

          {/* Global Footer */}
          <Footer />
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App;
