# Package Management Best Practices Guide

## Overview
This guide outlines the package management practices for the Tucker Trips Next.js application.

## Package Manager
- **Active package manager**: npm
- **Lock file**: `package-lock.json` (the canonical lock file for this repo)
- **Note**: A `pnpm-lock.yaml` file exists from a historical attempt to standardize on pnpm, but **npm is the active package manager**. The Replit workflow runs `npm run dev` and all dependency management uses npm.
- **Rule**: Use npm only. Do not run `pnpm` or `yarn` commands — they will create conflicting lock files.
- **Version strategy**: Semantic versioning with `^` prefix for minor updates

## Current Architecture
- **Framework**: Next.js 14 (React-based, JavaScript + TypeScript mixed)
- **Language**: TypeScript 5.x (mixed with JavaScript)
- **Styling**: Tailwind CSS 3.4.1
- **Database**: Supabase (PostgreSQL with RLS)
- **UI Components**: shadcn/ui (Radix UI primitives)
- **State Management**: React hooks (useState, useEffect)
- **Form Handling**: React Hook Form with Zod validation
- **Animations**: Framer Motion (motion package), GSAP
- **Charts**: Recharts
- **Date Handling**: date-fns
- **Utilities**: clsx, tailwind-merge, uuid

## Security Practices
1. **Regular Audits**: Run `npm audit` monthly
2. **Critical Updates**: Apply critical security patches within 7 days
3. **Vulnerability Monitoring**: Use GitHub Dependabot or similar tools
4. **Dependency Review**: Review new dependencies before adding

## Update Strategy
### Safe Updates (Minor/Patch)
- Run weekly: `npm update`
- Check for outdated: `npm outdated`
- Apply updates in development branch first

### Major Updates
- Requires testing plan
- Update in feature branch
- Verify compatibility with:
  - TypeScript types
  - Breaking changes documentation
  - Test suite
- Example major updates pending:
  - Next.js 14 → 15/16
  - React 18 → 19
  - Tailwind CSS 3 → 4
  - ESLint 8 → 9

## Dependency Categories
### Production Dependencies
- Essential for runtime functionality
- Minimize to reduce bundle size
- Regularly audit for unused packages

### Development Dependencies
- Build tools, linters, type definitions
- Keep up-to-date for best DX
- Includes: TypeScript, ESLint, Tailwind CSS, PostCSS

## Package Removal Guidelines
Before removing a package:
1. Search codebase for imports
2. Check configuration files
3. Verify no runtime errors
4. Update documentation

## Adding New Dependencies
Before adding a package:
1. Check if existing functionality can suffice
2. Evaluate bundle size impact
3. Check maintenance status and popularity
4. Verify security audit status
5. Prefer single-purpose libraries
6. Document the reason for addition

## Common Commands
```bash
# Install new dependency
npm install package-name

# Install dev dependency
npm install -D package-name

# Update all packages
npm update

# Check for outdated packages
npm outdated

# Run security audit
npm audit

# Fix vulnerabilities (safe)
npm audit fix

# Fix vulnerabilities (breaking changes — prefer manual review)
npm audit fix --force

# Check package details
npm info package-name

# List installed packages
npm list --depth=0
```

## Current Known Issues
1. **ESLint Glob Vulnerability**: High severity, requires ESLint 9 (major update)
   - Impact: Development only
   - Action: Plan for ESLint 9 migration

## Monitoring
- Set up GitHub Dependabot alerts
- Monitor security advisories
- Track bundle size changes

## Maintenance Schedule
- **Daily**: Monitor security alerts
- **Weekly**: Run `npm update`, check `npm outdated`
- **Monthly**: Full security audit with `npm audit`
- **Quarterly**: Review major version updates
- **Annually**: Complete dependency review and cleanup

## Bundle Optimization
- Use dynamic imports for large libraries
- Consider tree-shaking for utility libraries
- Monitor with `npm run build` output
- Use webpack-bundle-analyzer if needed

## Troubleshooting
### Common Issues
1. **Lock file conflicts**: Delete `node_modules` and run `npm install`
2. **Peer dependency warnings**: Review and install required peers
3. **Permission errors**: Avoid sudo; ensure npm is installed correctly

### Recovery Commands
```bash
# Full reinstall
rm -rf node_modules package-lock.json
npm install

# Verify install
npm run build
```

## Documentation Updates
- Update this guide when making structural changes
- Document any custom npm scripts
- Note any special installation requirements
