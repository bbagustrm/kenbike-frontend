# --- Stage 1: Builder ---
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# >>> Tambahkan bagian ini untuk menerima variabel dari GitHub Actions <<<
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_IMAGE_BASE_URL

# Jadikan argumen tersebut sebagai environment variable
# agar bisa dibaca oleh `npm run build`
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_IMAGE_BASE_URL=$NEXT_PUBLIC_IMAGE_BASE_URL

# Sekarang, `npm run build` akan menggunakan variabel yang benar
RUN npm run build

# --- Stage 2: Runner ---
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# copy only necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]