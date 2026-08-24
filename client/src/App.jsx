import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Direct Page Imports for instant zero-lag navigation across Cloudflare Edge
import Home from './pages/Home';
import Optimizer from './pages/Optimizer';
import ScanResult from './pages/ScanResult';
import History from './pages/History';
import Compare from './pages/Compare';
import Methodology from './pages/Methodology';

function App() {
  return (
    <LanguageProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-[#070c09] text-slate-100 selection:bg-emerald-500 selection:text-black">
          {/* Top Navbar */}
          <Navbar />

          {/* Main Content View */}
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/optimizer" element={<Optimizer />} />
              <Route path="/scan/:id" element={<ScanResult />} />
              <Route path="/history" element={<History />} />
              <Route path="/compare" element={<Compare />} />
              <Route path="/methodology" element={<Methodology />} />
            </Routes>
          </main>

          {/* Global Footer */}
          <Footer />
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App;
