# 🌿 Green Web Analyzer

> **ระบบตรวจสอบและวิเคราะห์ปริมาณการปล่อยคาร์บอน (Carbon Footprint) และความเป็นมิตรต่อสิ่งแวดล้อมของเว็บไซต์** ตามมาตรฐานสากล **Sustainable Web Design (SWD Model v4 / @tgwf/co2)**

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```
green-web-analyzer/
├── client/                     # Frontend (React + Vite + Tailwind CSS + Recharts + Lucide)
│   ├── src/
│   │   ├── components/         # SearchBar, GradeBadge, Charts, RecCard, Navbar, Footer
│   │   ├── pages/              # Home, ScanResult, History, Compare, Methodology
│   │   ├── services/           # Axios API Client (api.js)
│   │   ├── App.jsx             # Router & Navigation Layout
│   │   ├── main.jsx            # React Entry Point
│   │   └── index.css           # Glassmorphism & Eco Theme Styles
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── server/                     # Backend (Node.js + Express + Puppeteer + SQLite)
│   ├── src/
│   │   ├── controllers/        # scanController.js, historyController.js
│   │   ├── services/
│   │   │   ├── scanner.js      # Puppeteer Engine (Payloads, TTFB, DOM, Screenshot, Green Check)
│   │   │   ├── carbonEngine.js # @tgwf/co2 calculation logic (SWD v4, Grades A+-F, Equivalencies)
│   │   │   └── auditRules.js   # กฎการวิเคราะห์ข้อบกพร่องและคำแนะนำ (Image, JS, Cache, Green Host)
│   │   ├── models/             # Database layer (SQLite with auto-migration / MySQL ready)
│   │   ├── routes/             # apiRoutes.js
│   │   └── app.js              # Server entry point
│   ├── data/                   # SQLite database storage
│   ├── public/screenshots/     # Captured website viewport screenshots
│   └── package.json
│
├── docker-compose.yml          # Setup สำหรับ MySQL 8, Redis 7, Server และ Client
└── README.md
```

---

## ✨ ฟีเจอร์เด่น (Key Features)

1. **🚀 Deep Automated Scanner (Puppeteer)**:
   - ตรวจจับขนาดการรับส่งข้อมูลจริง (Network Transfer Size) แยกตามประเภท: JavaScript, CSS, HTML, Images, Fonts, Media, Third-Party
   - วัดผลเวลาโหลด (Load Time), TTFB (Time to First Byte) และจำนวน DOM Elements
   - จับภาพหน้าจอจำลอง (Screenshot Preview) สำหรับ Desktop และ Mobile Viewport

2. **⚡ Certified Carbon Engine (@tgwf/co2)**:
   - คำนวณปริมาณคาร์บอน (g CO2e per visit) ตามมาตรฐาน **Sustainable Web Design (SWD v4)**
   - ตัดเกรด Eco Score อัตโนมัติ: **A+, A, B, C, D, E, F**
   - คำนวณผลกระทบต่อสิ่งแวดล้อมจริง: จำนวนต้นไม้ที่ต้องปลูก, ระยะทางขับรถยนต์, การชาร์จสมาร์ทโฟน และการต้มน้ำชา

3. **🌿 The Green Web Foundation Verification**:
   - เชื่อมต่อ API เพื่อตรวจสอบว่าเว็บไซต์โฮสต์อยู่บน Data Center ที่ใช้พลังงานหมุนเวียน 100% หรือไม่

4. **📋 Actionable Sustainability Audit**:
   - วิเคราะห์จุดบกพร่องพร้อมแนวทางแก้ไข: Image WebP/AVIF conversion, Code Splitting, Long-term Cache-Control, Brotli compression, Dark mode OLED power savings
   - มี Code Snippet และตัวอย่างคอนฟิก Nginx/Apache/React ที่คัดลอกไปใช้ได้ทันที

5. **📊 History & Head-to-Head Compare**:
   - เก็บบันทึกประวัติการสแกน ค้นหาตามโดเมน กรองตามเกรด
   - ฟีเจอร์ **Compare** เปรียบเทียบ 2 ถึง 4 เว็บไซต์พร้อมกันเพื่อดูผู้ชนะ (Eco Champion Winner)

---

## 🚀 วิธีการติดตั้งและรันใช้งาน (Getting Started)

### วิธีที่ 1: รันแบบ Local Development (รวดเร็วที่สุด)

#### 1. ติดตั้ง Dependencies ฝั่ง Server
```bash
cd server
npm install
npm run dev
```
> Server จะเริ่มทำงานที่ `http://localhost:5000` (สร้างฐานข้อมูล SQLite ให้อัตโนมัติ ไม่ต้องลง Database เพิ่ม)

#### 2. ติดตั้ง Dependencies ฝั่ง Client
```bash
cd ../client
npm install
npm run dev
```
> Client จะเริ่มทำงานที่ `http://localhost:5173`

---

### วิธีที่ 2: รันผ่าน Docker Compose

```bash
docker-compose up --build
```
- **Frontend App**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000`
- **MySQL Database**: `localhost:3306`
- **Redis Cache**: `localhost:6379`

---

## 📡 สรุป API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/scan` | สแกน URL ใหม่ (`{ "url": "...", "device": "desktop" }`) |
| `GET` | `/api/scans/:id` | ดึงข้อมูลผลการสแกนเฉพาะ ID |
| `GET` | `/api/scans` | ดึงประวัติการสแกนทั้งหมด (รองรับ `search`, `grade`, `greenOnly`, `sort`) |
| `DELETE` | `/api/scans/:id` | ลบประวัติการสแกน |
| `POST` | `/api/compare` | เปรียบเทียบผลการสแกน (`{ "ids": ["id1", "id2"] }`) |
| `GET` | `/api/stats` | สถิติภาพรวม (จำนวนเว็บไซต์, ค่าเฉลี่ยคาร์บอน, Top Cleanest) |
| `GET` | `/api/health` | ตรวจสอบสถานะการทำงานของเซิร์ฟเวอร์ |

---

## 🔬 สูตรการคำนวณคาร์บอน (Carbon Calculation)

อ้างอิงจาก **Sustainable Web Design Model (SWD v4)**:

$$E = \text{Data Transferred (GB)} \times 0.812\text{ kWh/GB}$$

$$\text{CO2e} = E \times \text{Carbon Intensity}$$
- **Green Host**: $50\text{ gCO2/kWh}$
- **Standard Grid**: $442\text{ gCO2/kWh}$

**Blended Visit Model**:
$$\text{Total CO2/Visit} = (\text{First Visit} \times 0.75) + (\text{Return Visit (25\% Cache)} \times 0.25)$$

---

## 📄 License
MIT License
