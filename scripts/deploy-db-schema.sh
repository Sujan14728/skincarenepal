#!/bin/bash
# Deployment script to update production database schema

echo "🚀 Deploying database schema updates..."

# Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

# Push schema changes to database (no migrations)
echo "📊 Pushing schema to database..."
npx prisma db push --accept-data-loss

echo "✅ Database schema deployed successfully!"
