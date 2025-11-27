# --- Stage 1: Builder ---
FROM node:18-alpine AS builder
WORKDIR /app

# Salin file package.json dan package-lock.json
COPY package*.json ./
RUN npm install

# Salin seluruh kode sumber aplikasi
COPY . .

# Build arguments dari GitHub Actions
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_IMAGE_BASE_URL
ARG SKIP_ESLINT

ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_IMAGE_BASE_URL=$NEXT_PUBLIC_IMAGE_BASE_URL

# Ganti baris RUN npm run build dengan logika kondisional
RUN if [ "$SKIP_ESLINT" = "true" ]; then \
        echo "Skipping ESLint..."; \
        npm run build -- --no-lint; \
    else \
        echo "Running with ESLint..."; \
        npm run build; \
    fi

# --- Stage 2: Runner ---
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]