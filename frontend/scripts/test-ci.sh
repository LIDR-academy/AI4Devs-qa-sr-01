#!/bin/bash

# CI Test Script for Frontend
# This script simulates the CI environment locally

echo "🚀 Starting CI Test Simulation..."

# Check Node.js version
echo "📋 Checking Node.js version..."
node --version
npm --version

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Check if installation was successful
if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Run linting
echo "🔍 Running linting..."
npm run lint

# Check if linting passed
if [ $? -eq 0 ]; then
    echo "✅ Linting passed"
else
    echo "⚠️ Linting warnings (non-blocking)"
fi

# Run build
echo "🏗️ Building application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi

echo "🎉 CI Test Simulation completed successfully!"
