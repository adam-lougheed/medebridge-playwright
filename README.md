## Overview

This repo contains:

- A Next.js application under `src/app` that provides a web UI for running and managing Playwright tests.
- A .NET 8 Playwright test suite in `dotnet-tests/` with homepage smoke tests.

Use the `BASE_URL` environment variable (defaults to `http://localhost:3000`) to point tests at any environment.

## Test matrix

| Suite | Test name | Location | Purpose |
| --- | --- | --- | --- |
| Playwright (.NET) | `HomepageLoadsDotNet` | `dotnet-tests/HomepageTests.cs` | Opens `/` and verifies the title matches `Create Next App | Test Dashboard | medEbridge` (case-insensitive). |

## Running the app locally

```bash
npm install
npm run dev
```

Then visit [http://localhost:3000](http://localhost:3000).

## Playwright (.NET) tests

Requirements: .NET SDK 8+.

First-time setup installs the browsers referenced by the .NET runner:

```powershell
dotnet build dotnet-tests
.\dotnet-tests\bin\Debug\net8.0\playwright.ps1 install
```

Run the tests with:

```powershell
dotnet test dotnet-tests
```

The C# suite currently includes `HomepageTests.cs`, which loads `/`, waits briefly, and ensures the title matches `Create Next App | Test Dashboard | medEbridge` (case-insensitive). Add additional tests by inheriting from `Microsoft.Playwright.NUnit.PageTest`.

Optional env vars:

- `BASE_URL` – defaults to `http://localhost:3000`.
- `HEADED` – set to `1` to run browser in headed mode (visible). Defaults to headless.

## Running tests via the web UI

The Next.js app provides a web interface at [http://localhost:3000](http://localhost:3000) where you can:
- View all available tests
- Run tests with a click
- Configure multiple environments (dev, staging, production, etc.)
- View test results and history

## Deployment

Deploy the Next.js app to any platform you prefer (Vercel, Azure Static Web Apps, etc.). The Playwright tests can run in CI using `dotnet test dotnet-tests` after running `playwright.ps1 install` for the C# suite.
