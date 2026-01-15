# Setup Instructions

## Install Dependencies

After cloning the repository, install all dependencies:

```bash
npm install
```

This will install:
- Astro and its dependencies
- Prettier for code formatting
- ESLint for linting
- Husky for git hooks
- lint-staged for pre-commit checks

## Setup Husky

Husky will be automatically set up when you run `npm install` (via the `prepare` script).

If you need to set it up manually:

```bash
npx husky install
```

## Pre-commit Hooks

Husky is configured to run lint-staged before each commit. This will:
- Run ESLint on staged JavaScript/TypeScript/Astro files
- Format staged files with Prettier
- Ensure code quality before commits

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run format` - Format all files with Prettier
- `npm run format:check` - Check if files are formatted
- `npm run format:css` - Format CSS files (unminify)
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint and fix issues

## CSS Formatting

The CSS files were minified when scraped. A custom formatter (`scripts/format-css.js`) has been used to format them. You can re-run it with:

```bash
npm run format:css
```

## Code Quality

- **Prettier**: Ensures consistent code formatting
- **ESLint**: Catches code quality issues
- **Husky**: Runs checks before commits
- **lint-staged**: Only checks staged files (faster)

## Troubleshooting

### npm install fails with permission errors

If you see permission errors, fix npm cache permissions:

```bash
sudo chown -R $(whoami) ~/.npm
```

### Husky hooks not running

Make sure Husky is installed:

```bash
npx husky install
chmod +x .husky/pre-commit
```

### Pre-commit hook fails

If the pre-commit hook fails:
1. Fix the linting/formatting issues
2. Stage the fixed files
3. Try committing again

You can skip hooks (not recommended) with:

```bash
git commit --no-verify
```
