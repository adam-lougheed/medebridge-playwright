## Overview

This repo contains:

- A Next.js application under `src/app` that provides a web UI for running and managing Playwright tests.
- A scalable .NET 8 Playwright test suite in `dotnet-tests/` organized using Page Object Model (POM) pattern.

## Project Structure

The test project follows a scalable architecture with clear separation of concerns:

```
dotnet-tests/
├── Features/              # Test feature classes (NUnit test classes)
│   └── HomepageFeature.cs
├── StepDefinitions/       # Reusable step definitions and test helpers
│   ├── TestBase.cs       # Base class with common test functionality
│   └── HomepageSteps.cs  # Homepage-specific step definitions
├── POMElements/          # Page Object Model classes
│   └── HomePage.cs       # Homepage page object
└── Medebridge.PlaywrightTests.csproj
```

### Architecture Benefits

- **Features/**: Contains test classes that define what to test
- **StepDefinitions/**: Contains reusable test steps and helper methods for maintainability
- **POMElements/**: Contains Page Object Model classes that encapsulate page interactions, making tests more maintainable and readable

Use the `BASE_URL` environment variable (defaults to `http://localhost:3000`) to point tests at any environment.

## Test matrix

| Suite | Test name | Location | Purpose |
| --- | --- | --- | --- |
| Playwright (.NET) | `HomepageLoadsDotNet` | `dotnet-tests/Features/HomepageFeature.cs` | Opens `/` and verifies the title matches `Create Next App | Test Dashboard | medEbridge` (case-insensitive). |

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

### Adding New Tests

To add a new test feature:

1. **Create a Page Object** in `POMElements/`:
   ```csharp
   public class MyPage : IPageObject
   {
       // Page elements and interactions
   }
   ```

2. **Create Step Definitions** in `StepDefinitions/`:
   ```csharp
   public class MyPageSteps : TestBase
   {
       // Reusable test steps
   }
   ```

3. **Create Feature Test** in `Features/`:
   ```csharp
   public class MyFeature : MyPageSteps
   {
       [Test]
       public async Task MyTest()
       {
           // Test implementation using steps
       }
   }
   ```

The test suite uses the Page Object Model pattern for maintainability and scalability.

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
