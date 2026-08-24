# ==========================================
# Stage 1: Build React Frontend Client
# ==========================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/client

COPY client/package*.json ./
RUN npm install

COPY client/ ./
RUN npm run build

# ==========================================
# Stage 2: Production Node.js Server Runner
# ==========================================
FROM node:20-slim AS runner

# Install Chromium and required font packages for Puppeteer
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    fonts-noto-color-emoji \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    PORT=5000 \
    NODE_ENV=production

WORKDIR /app

# Install production dependencies for server
COPY server/package*.json ./server/
RUN npm --prefix server install --omit=dev

# Copy server application code
COPY server/ ./server/

# Copy built frontend assets from builder stage
COPY --from=frontend-builder /app/client/dist ./client/dist

# Ensure required runtime folders exist
RUN mkdir -p /app/server/data /app/server/public/screenshots

EXPOSE 5000

CMD ["node", "server/src/app.js"]
