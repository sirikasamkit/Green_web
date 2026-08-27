/**
 * Eco-friendly web audit rules engine.
 * Analyzes network transfer, headers, DOM structure, and hosting to provide actionable carbon reduction advice.
 */

function generateAuditRecommendations(scanData) {
  const recommendations = [];
  const {
    pageSizeBytes = 0,
    resourceBreakdown = {},
    isGreenHost = false,
    headersInfo = {},
    domElements = 0,
    loadTimeMs = 0,
    carbonMetrics = {}
  } = scanData;

  const imagesBytes = resourceBreakdown.images?.bytes || 0;
  const jsBytes = resourceBreakdown.javascript?.bytes || 0;
  const cssBytes = resourceBreakdown.css?.bytes || 0;
  const fontsBytes = resourceBreakdown.fonts?.bytes || 0;
  const mediaBytes = resourceBreakdown.media?.bytes || 0;
  const totalMb = pageSizeBytes / (1024 * 1024);

  // 1. Green Web Hosting
  if (!isGreenHost) {
    recommendations.push({
      id: 'green_hosting',
      category: 'Hosting & Infrastructure',
      category_th: 'โฮสติ้งและโครงสร้างพื้นฐาน',
      title: 'ย้ายเซิร์ฟเวอร์ไปใช้ Green Web Hosting (พลังงานหมุนเวียน 100%)',
      title_en: 'Switch to a Certified Green Web Hosting Provider',
      impact: 'HIGH',
      co2_savings_pct: 15,
      description: 'โฮสติ้งปัจจุบันยังไม่ได้รับการรับรองว่าใช้พลังงานหมุนเวียน 100% จาก The Green Web Foundation การเปลี่ยนไปใช้โฮสต์ที่เป็นมิตรต่อสิ่งแวดล้อมจะช่วยลด Carbon Footprint ทันที 9-15%',
      description_en: 'Current server is not certified as running on 100% renewable energy by The Green Web Foundation. Migrating to a green host instantly slashes emissions by 9-15%.',
      suggestion: 'เลือกใช้ผู้ให้บริการคลาวด์ที่ใช้พลังงานหมุนเวียน เช่น Google Cloud Platform, AWS (เฉพาะภูมิภาค Green), Hetzner, หรือ Kinsta/Cloudflare',
      suggestion_en: 'Choose verified eco-friendly cloud providers such as Google Cloud Platform, Hetzner, Cloudflare, or Kinsta.',
      codeSnippet: `// Example: Check your host at The Green Web Foundation directory
// https://www.thegreenwebfoundation.org/directory/`
    });
  }

  // 2. Image Optimization (WebP / AVIF & Compression)
  if (imagesBytes > 500 * 1024) {
    const imgMb = (imagesBytes / (1024 * 1024)).toFixed(2);
    recommendations.push({
      id: 'image_optimization',
      category: 'Assets & Media',
      category_th: 'รูปภาพและสื่อดิจิทัล',
      title: `บีบอัดรูปภาพและแปลงเป็น Next-Gen Formats (WebP / AVIF) (ปัจจุบัน: ${imgMb} MB)`,
      title_en: `Convert Images to Modern WebP / AVIF Format (${imgMb} MB)`,
      impact: imagesBytes > 1.5 * 1024 * 1024 ? 'HIGH' : 'MEDIUM',
      co2_savings_pct: Math.min(35, Math.round((imagesBytes / pageSizeBytes) * 45)),
      description: 'รูปภาพมีสัดส่วนขนาดไฟล์ที่สูง การบีบอัดแบบ Lossless/Lossy และเปลี่ยนเป็น AVIF หรือ WebP จะช่วยลดขนาดไฟล์ภาพลงได้ถึง 40-70%',
      description_en: 'Images are typically the largest contributor to page weight. Converting assets to WebP/AVIF and serving responsive sizes reduces data payload by 40-70%.',
      suggestion: 'ใช้ <picture> tag ร่วมกับ AVIF/WebP, เปิดใช้งาน Lazy loading (`loading="lazy"`), และใช้เครื่องมือเช่น Sharp, Squoosh หรือ CDN Image Resizing',
      suggestion_en: 'Use <picture> tags or Next-Gen WebP formats with loading="lazy" for all below-the-fold images.',
      codeSnippet: `<picture>
  <source srcset="hero.avif" type="image/avif">
  <source srcset="hero.webp" type="image/webp">
  <img src="hero.jpg" alt="Hero Banner" loading="lazy" width="800" height="450" />
</picture>`
    });
  }

  // 3. JavaScript Bundle Reduction
  if (jsBytes > 400 * 1024) {
    const jsMb = (jsBytes / (1024 * 1024)).toFixed(2);
    recommendations.push({
      id: 'javascript_bloat',
      category: 'Code & Scripts',
      category_th: 'โค้ดและสคริปต์',
      title: `ลดขนาด JavaScript Bundle และแยก Code Splitting (ปัจจุบัน: ${jsMb} MB)`,
      title_en: `Reduce JavaScript Payload & Implement Code Splitting (${jsMb} MB)`,
      impact: jsBytes > 1024 * 1024 ? 'HIGH' : 'MEDIUM',
      co2_savings_pct: Math.min(25, Math.round((jsBytes / pageSizeBytes) * 35)),
      description: 'JavaScript นอกจากต้องดาวน์โหลดแล้ว ยังกินพลังงาน CPU ของผู้ใช้ในการ Parse และ Execute อย่างมาก การลด Bundle ช่วยประหยัดแบตเตอรี่และพลังงานประมวลผล',
      description_en: 'JavaScript requires both network data transfer and heavy client CPU execution power. Trimming monolithic bundles significantly cuts device energy usage.',
      suggestion: 'ทำ Dynamic Import (React.lazy / import()), ลบ Library ที่ไม่ได้ใช้ด้วย Tree-shaking, และย้าย Analytics Scripts ไปโหลดแบบ defer/async',
      suggestion_en: 'Implement dynamic code splitting (React.lazy / import()), eliminate unused dependencies, and defer third-party scripts.',
      codeSnippet: `// Example: Lazy load heavy components
import { lazy, Suspense } from 'react';
const HeavyChart = lazy(() => import('./HeavyChart'));

function Dashboard() {
  return (
    <Suspense fallback={<div>Loading Chart...</div>}>
      <HeavyChart />
    </Suspense>
  );
}`
    });
  }

  // 4. HTTP Caching Headers
  if (headersInfo.missingCaching) {
    recommendations.push({
      id: 'cache_control',
      category: 'Network & Caching',
      category_th: 'เครือข่ายและแคชชิ่ง',
      title: 'ตั้งค่า Cache-Control สำหรับ Static Assets ให้มีอายุยาวนาน',
      title_en: 'Configure Long-term Cache-Control Headers for Static Assets',
      impact: 'HIGH',
      co2_savings_pct: 20,
      description: 'เมื่อผู้ใช้เข้าชมซ้ำ (Return Visits) บราวเซอร์ไม่ต้องดาวน์โหลดไฟล์ใหม่ซ้ำซ้อน ช่วยลดปริมาณคาร์บอนลงได้มากกว่า 50% สำหรับผู้ใช้ประจำ',
      description_en: 'Leveraging immutable caching prevents repeat visitors from re-downloading static assets, reducing emissions on return visits by over 50%.',
      suggestion: 'กำหนด `Cache-Control: public, max-age=31536000, immutable` สำหรับไฟล์รูปภาพ, ฟอนต์, JS/CSS ที่มี content hash',
      suggestion_en: 'Add `Cache-Control: public, max-age=31536000, immutable` headers to all versioned static assets, fonts, and images.',
      codeSnippet: `# Nginx Configuration Example
location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff2|avif|webp)$ {
    expires 1y;
    add_header Cache-Control "public, max-age=31536000, immutable";
}`
    });
  }

  // 5. Compression (Gzip / Brotli)
  if (headersInfo.missingCompression) {
    recommendations.push({
      id: 'text_compression',
      category: 'Network & Caching',
      title: 'เปิดใช้งานการบีบอัด Brotli หรือ Gzip สำหรับ Text Assets',
      title_en: 'Enable Brotli or Gzip Compression',
      impact: 'MEDIUM',
      co2_savings_pct: 12,
      description: 'ไฟล์ HTML, CSS, JavaScript และ JSON สามารถลดขนาดในการส่งผ่านเครือข่ายลงได้ 60-80% เมื่อเปิดใช้งาน Brotli/Gzip',
      suggestion: 'เปิดการบีบอัดใน Web Server (Nginx/Apache) หรือ Reverse Proxy / Cloudflare CDN',
      codeSnippet: `# Enable Brotli in Nginx
brotli on;
brotli_comp_level 6;
brotli_types text/plain text/css application/javascript application/json image/svg+xml;`
    });
  }

  // 6. Web Fonts Optimization
  if (fontsBytes > 150 * 1024) {
    const fontsKb = Math.round(fontsBytes / 1024);
    recommendations.push({
      id: 'font_optimization',
      category: 'Assets & Media',
      title: `ปรับปรุงขนาด Web Fonts และใช้ WOFF2 Subset (ปัจจุบัน: ${fontsKb} KB)`,
      title_en: `Optimize Web Fonts with WOFF2 and Subsetting (${fontsKb} KB)`,
      impact: 'LOW',
      co2_savings_pct: 6,
      description: 'ฟอนต์ภายนอกมักมีตัวอักษรที่ไม่จำเป็น การใช้ WOFF2 พร้อม Font Subsetting (ตัดเฉพาะภาษาที่ใช้) และ `font-display: swap` ช่วยประหยัดแบนด์วิดท์อย่างมาก',
      suggestion: 'ใช้ฟอนต์ฟอร์แมต `.woff2`, ตัด glyphs ด้วย Glyphhanger หรือ Subfont, หรือใช้ System Font Stack',
      codeSnippet: `@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom.woff2') format('woff2');
  font-display: swap;
  unicode-range: U+0E01-0E5B, U+0020-007E; /* Thai + Basic Latin */
}`
    });
  }

  // 7. Dark Mode & Carbon Budget UI
  recommendations.push({
    id: 'dark_mode_eco',
    category: 'Design & UX',
    title: 'รองรับ Dark Mode เพื่อประหยัดพลังงานหน้าจอ OLED / AMOLED',
    title_en: 'Support Dark Mode to Save OLED Display Energy',
    impact: 'LOW',
    co2_savings_pct: 5,
    description: 'หน้าจอสมาร์ทโฟนและแล็ปท็อปยุคใหม่ใช้จอ OLED ซึ่งพิกเซลสีดำและสีเข้มจะใช้พลังงานไฟฟ้าน้อยกว่าสีขาวสว่างมาก (ประหยัดพลังงานจอได้ถึง 30-40%)',
    suggestion: 'ใช้ CSS Media Query `@media (prefers-color-scheme: dark)` เพื่อปรับโทนสีพื้นหลังให้เป็นโทนเข้ม',
    codeSnippet: `@media (prefers-color-scheme: dark) {
  body {
    background-color: #0d1117;
    color: #e6edf3;
  }
}`
  });

  // 8. Total Page Weight Alert (> 2MB)
  if (totalMb > 2.0) {
    recommendations.push({
      id: 'overall_budget',
      category: 'Performance',
      title: `ตั้งค่า Carbon / Performance Budget เพื่อคุมขนาดเว็บไม่ให้เกิน 1.5MB (ปัจจุบัน: ${totalMb.toFixed(2)} MB)`,
      title_en: `Enforce a Carbon & Page Weight Budget (< 1.5MB target, current: ${totalMb.toFixed(2)} MB)`,
      impact: 'HIGH',
      co2_savings_pct: 30,
      description: 'หน้าเว็บขนาดใหญ่กว่า 2MB จัดอยู่ในกลุ่มที่ปล่อยคาร์บอนสูงกว่าค่าเฉลี่ยสากลอย่างมีนัยสำคัญ ควรตั้งงบประมาณจำกัดขนาดไฟล์ใน CI/CD Pipeline',
      suggestion: 'ใช้เครื่องมืออย่าง Lighthouse CI หรือ Bundlesize ตรวจจับการบวมของไฟล์ก่อน Deploy ขึ้น Production',
      codeSnippet: `// Example: bundlesize in package.json
"bundlesize": [
  {
    "path": "./dist/**/*.js",
    "maxSize": "300 kB"
  }
]`
    });
  }

  return recommendations;
}

module.exports = { generateAuditRecommendations };
