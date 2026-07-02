FROM node:22-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
# next-auth v5 requires trusting the host header behind a proxy (Render).
ENV AUTH_TRUST_HOST=true

# Runtime deps (includes tsx + cross-env, needed to run the custom TS server).
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Next build output + static assets.
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next

# Custom Socket.IO server + the source it imports at runtime (via tsx).
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/src ./src
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/next.config.ts ./next.config.ts

# Render (and most hosts) inject PORT; the server reads process.env.PORT.
EXPOSE 3000
CMD ["npm", "start"]
