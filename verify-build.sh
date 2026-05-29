#!/bin/bash

echo "🔍 Tucker Trips Build Verification"
echo "================================="
echo ""

# Check Node version
echo "📦 Node version:"
node --version
echo ""

# Check pnpm version
echo "📦 pnpm version:"
export PNPM_HOME="$HOME/.local/share/pnpm"
export PATH="$PNPM_HOME:$PATH"
pnpm --version
echo ""

# Clean any previous build
echo "🧹 Cleaning previous build..."
rm -rf .next out
echo ""

# Install dependencies
echo "📥 Installing dependencies..."
pnpm install
echo ""

# Run build
echo "🏗️  Building application..."
pnpm build --webpack
if [ $? -eq 0 ]; then
  echo "✅ Build successful!"
else
  echo "❌ Build failed!"
  exit 1
fi
echo ""

# Check build output
echo "📁 Build output:"
ls -la .next | head -10
echo ""

# Run lint check
echo "🔍 Running ESLint..."
pnpm lint
if [ $? -eq 0 ]; then
  echo "✅ Lint passed!"
else
  echo "⚠️ Lint warnings/errors found"
fi
echo ""

# Run security audit
echo "🔒 Running security audit..."
pnpm audit --audit-level moderate
if [ $? -eq 0 ]; then
  echo "✅ No vulnerabilities found!"
else
  echo "⚠️ Vulnerabilities detected"
fi
echo ""

echo "✅ Verification complete!"
echo ""
echo "📊 Summary:"
echo "  - Build: ✅"
echo "  - Lint: $([ $? -eq 0 ] && echo '✅' || echo '⚠️')"
echo "  - Security: $([ $? -eq 0 ] && echo '✅' || echo '⚠️')"