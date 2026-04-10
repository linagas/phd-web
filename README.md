# phd-web

[![CI Pipeline](https://github.com/linagas/phd-web/actions/workflows/ci.yml/badge.svg)](https://github.com/linagas/phd-web/actions/workflows/ci.yml)

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Testing

This project has comprehensive test coverage with Jest and Playwright:

```bash
# Unit & Integration tests
npm test                # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # With coverage report (minimum 80%)

# E2E tests
npm run test:e2e        # Run Playwright tests
npm run test:e2e:ui     # Interactive UI mode

# Lint
npm run lint            # ESLint check
```

**Test Structure:**
- `tests/unit/` - Unit tests (models, services, controllers, utils)
- `tests/integration/` - Integration tests (full flow)
- `e2e/` - End-to-end tests with Playwright

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## CI/CD

This project uses GitHub Actions for continuous integration. See [.github/workflows/README.md](.github/workflows/README.md) for configuration details.

