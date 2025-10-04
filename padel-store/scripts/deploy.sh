#!/usr/bin/env bash
set -euo pipefail

# Required env vars in CI: VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID, DATABASE_URL

echo '==> Installing dependencies'
npm ci

echo '==> Generate Prisma client'
npx prisma generate

echo '==> Build Next.js'
npm run build

echo '==> Run database migrations'
DATABASE_URL="${DATABASE_URL:-}" npx prisma migrate deploy

if [[ "${RUN_SEED:-false}" == "true" ]]; then
  echo '==> Seeding database'
  node prisma/seed.js
fi

# Install Vercel CLI if not present
if ! command -v vercel >/dev/null 2>&1; then
  echo '==> Installing Vercel CLI'
  npm i -g vercel@latest
fi

# Link project (no interactive prompts)
vercel link --project "$VERCEL_PROJECT_ID" --org "$VERCEL_ORG_ID" --yes >/dev/null 2>&1 || true

# Decide environment
DEPLOY_ENV="production"
if [[ "${TARGET_ENV:-production}" == "preview" ]]; then
  DEPLOY_ENV="preview"
fi

# Pass environment variables at deploy time (for serverless runtime)
VERCEL_ENV_FLAGS=(
  --env DATABASE_URL="$DATABASE_URL"
)

# Optionally pass NextAuth envs if set
if [[ -n "${NEXTAUTH_URL:-}" ]]; then
  VERCEL_ENV_FLAGS+=( --env NEXTAUTH_URL="$NEXTAUTH_URL" )
fi
if [[ -n "${NEXTAUTH_SECRET:-}" ]]; then
  VERCEL_ENV_FLAGS+=( --env NEXTAUTH_SECRET="$NEXTAUTH_SECRET" )
fi

if [[ "$DEPLOY_ENV" == "production" ]]; then
  echo '==> Deploying to Vercel (production)'
  vercel deploy --prod --token "$VERCEL_TOKEN" "${VERCEL_ENV_FLAGS[@]}"
else
  echo '==> Deploying to Vercel (preview)'
  vercel deploy --token "$VERCEL_TOKEN" "${VERCEL_ENV_FLAGS[@]}"
fi
