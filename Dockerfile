# ---- Base deps layer ----
FROM node:20-alpine AS base
WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable

# Copy lockfiles first for better caching
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY turbo.json ./

# Copy package manifests
COPY apps/web/package.json apps/web/package.json
COPY apps/docs/package.json apps/docs/package.json
COPY packages ./packages

RUN pnpm install --frozen-lockfile

# ---- Build layer ----
FROM base AS build
WORKDIR /app
COPY . .

# Build only the selected app
ARG APP_NAME
RUN pnpm turbo build --filter=${APP_NAME}

# ---- Runtime layer ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable

# Copy built artifacts
ARG APP_NAME
COPY --from=build /app ./

# Install only production deps
RUN pnpm install --prod --frozen-lockfile

# Default port (DevPush will override with $PORT)
ENV PORT=3000
EXPOSE 3000

CMD if [ "$APP_NAME" = "web" ]; then pnpm --filter web start; \
    else npx mintlify dev --port $PORT --host 0.0.0.0; fi