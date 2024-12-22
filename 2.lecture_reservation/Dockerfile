# Build stage
FROM node:20-alpine AS builder

COPY package.json pnpm-lock.yaml ./

RUN apk add --no-cache libc6-compat && corepack enable && corepack prepare pnpm@latest --activate

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build


# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache libc6-compat && corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --prod --frozen-lockfile

COPY --from=builder dist ./dist

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE $PORT

CMD ["node", "dist/main"]