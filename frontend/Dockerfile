FROM node:20 AS base

FROM base AS builder
ENV TURBO_TELEMETRY_DISABLED=1
WORKDIR /app
RUN npm install -g npm@10.5.0
RUN npm install --global turbo
COPY . .
RUN turbo prune frontend --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
ENV TURBO_TELEMETRY_DISABLED=1
WORKDIR /app

# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY .env .env
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/package-lock.json ./package-lock.json
RUN npm i

# Build the project
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
RUN npx dotenv -- turbo run build --filter=frontend...

# Uncomment and use build args to enable remote caching
# ARG TURBO_TEAM
# ENV TURBO_TEAM=$TURBO_TEAM

# ARG TURBO_TOKEN
# ENV TURBO_TOKEN=$TURBO_TOKEN

FROM base AS runner
ENV TURBO_TELEMETRY_DISABLED=1
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=installer /app/frontend/next.config.js .
COPY --from=installer /app/frontend/package.json .

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=installer --chown=nextjs:nodejs /app/frontend/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/frontend/.next/static ./frontend/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/frontend/public ./frontend/public
#RUN watch ls -la ./frontend/
CMD node ./frontend/server.js
