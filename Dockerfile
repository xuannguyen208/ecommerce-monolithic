FROM node:24-bookworm-slim

WORKDIR /app

# Cài OpenSSL cho Prisma
RUN apt-get update -y \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Cài các thư viện Node.js
COPY package*.json ./

RUN npm ci

# Sao chép Prisma schema
COPY prisma ./prisma

# Tạo Prisma Client
RUN npx prisma generate

# Sao chép mã nguồn
COPY server.js ./
COPY src ./src

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node prisma/seed.js && exec node server.js"]