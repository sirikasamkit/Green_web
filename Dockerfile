FROM node:20-slim AS builder

# 1. Build React Frontend
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# 2. Setup Server Environment
WORKDIR /app
COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev

COPY server/ ./server/
COPY --from=builder /app/client/dist ./client/dist

# 3. Install Chromium for Puppeteer Scanner
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-thai-tlwg fonts-freefont-ttf \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    PORT=5000 \
    NODE_ENV=production

EXPOSE 5000

CMD ["node", "server/src/app.js"]
