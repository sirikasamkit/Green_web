import React, { useState } from 'react';
import { Terminal, Copy, Check, Server, Moon, Layers, ShieldCheck } from 'lucide-react';

const CONFIGS = [
  {
    id: 'nginx',
    name: 'Nginx Eco Config',
    category: 'Server / Hosting',
    icon: Server,
    description: 'Enables Brotli & Gzip compression, HTTP/2, and 1-year immutable caching for static assets.',
    code: `# /etc/nginx/conf.d/eco-website.conf
server {
    listen 443 ssl http2;
    server_name example.com;

    # 1. Enable Modern Text Compression (Brotli + Gzip)
    brotli on;
    brotli_comp_level 6;
    brotli_types text/plain text/css application/javascript application/json image/svg+xml;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;

    # 2. Aggressive 1-Year Immutable Caching (Prevents re-downloads on return visits)
    location ~* \\.(js|css|webp|avif|png|jpg|jpeg|gif|svg|woff2|woff|ttf|ico)$ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
        access_log off;
    }

    # 3. Security & Clean HTML delivery
    location / {
        try_files $uri $uri/ /index.html;
        add_header X-Content-Type-Options "nosniff";
    }
}`
  },
  {
    id: 'apache',
    name: 'Apache .htaccess Rules',
    category: 'Server / Hosting',
    icon: Server,
    description: 'ExpiresHeaders, Deflate module, and Keep-Alive headers for Apache web servers.',
    code: `# Apache .htaccess Low-Carbon Directives
<IfModule mod_deflate.c>
    # Compress HTML, CSS, JavaScript, Text, XML and fonts
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/json
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE image/svg+xml
</IfModule>

<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresDefault "access plus 1 month"
    
    # 1-Year caching for versioned assets
    ExpiresByType image/webp "access plus 1 year"
    ExpiresByType image/avif "access plus 1 year"
    ExpiresByType font/woff2 "access plus 1 year"
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
</IfModule>`
  },
  {
    id: 'darkmode',
    name: 'OLED Battery Saver CSS',
    category: 'Front-End / UX',
    icon: Moon,
    description: 'CSS media queries and color tokens that reduce power draw on OLED/AMOLED screens by 30-40%.',
    code: `/* Eco OLED Power-Saving CSS Variables */
:root {
  --bg-primary: #ffffff;
  --text-primary: #111827;
}

/* Reduces pixel illumination power on OLED mobile devices */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #080c0a; /* Deep true black saves maximum battery */
    --bg-card: #111815;
    --text-primary: #f3f4f6;
    --accent: #22c55e;
  }

  body {
    background-color: var(--bg-primary);
    color: var(--text-primary);
  }
}`
  },
  {
    id: 'vite',
    name: 'Vite / Webpack Code Splitting',
    category: 'Build Pipeline',
    icon: Layers,
    description: 'Configures aggressive manual chunking to avoid shipping massive monolithic JS bundles.',
    code: `// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Strips console logs to reduce weight
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
          icons: ['lucide-react'],
        },
      },
    },
  },
});`
  },
  {
    id: 'cicd',
    name: 'GitHub Actions Carbon Budget',
    category: 'CI / CD Automation',
    icon: ShieldCheck,
    description: 'Automated workflow step to fail PRs if total JavaScript/CSS bundle exceeds performance budget.',
    code: `# .github/workflows/carbon-budget.yml
name: Eco Performance Budget Check

on: [pull_request]

jobs:
  budget:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - name: Enforce Maximum 300KB Asset Limit
        run: |
          MAX_SIZE=307200 # 300 KB
          ACTUAL_SIZE=$(du -sb dist/assets/*.js | awk '{sum+=$1} END {print sum}')
          if [ $ACTUAL_SIZE -gt $MAX_SIZE ]; then
            echo "❌ Bundle size ($ACTUAL_SIZE bytes) exceeds the carbon budget!"
            exit 1
          fi
          echo "✅ Carbon budget passed!"`
  }
];

export default function ConfigGenerator() {
  const [selectedId, setSelectedId] = useState(CONFIGS[0].id);
  const [copied, setCopied] = useState(false);

  const activeConfig = CONFIGS.find((c) => c.id === selectedId) || CONFIGS[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeConfig.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel p-6 rounded-3xl border border-emerald-900/40 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-950/60 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-400" />
            Zero-Carbon Configuration & Snippet Generator
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Production-ready server configs, CSS energy savers, and build pipelines to eliminate digital waste
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {CONFIGS.map((c) => {
          const Icon = c.icon;
          const isActive = c.id === selectedId;
          return (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white border border-emerald-950 hover:border-emerald-500/40'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{c.name}</span>
            </button>
          );
        })}
      </div>

      {/* Active Snippet Display */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-white text-sm">{activeConfig.name}</span>
            <p className="text-xs text-slate-400 mt-0.5">{activeConfig.description}</p>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-emerald-900/50 hover:border-emerald-500/40 text-xs text-slate-200 hover:text-white transition-all"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copy Snippet</span>
              </>
            )}
          </button>
        </div>

        <div className="rounded-2xl overflow-hidden border border-slate-800 bg-[#050806] relative">
          <pre className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed max-h-96">
            <code>{activeConfig.code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
