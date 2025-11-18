using Microsoft.Playwright.NUnit;

namespace Medebridge.PlaywrightTests.StepDefinitions;

/// <summary>
/// Base class for test steps providing common functionality
/// </summary>
public abstract class TestBase : PageTest
{
    /// <summary>
    /// Gets the base URL from environment variable or defaults to localhost:3000
    /// </summary>
    protected string GetBaseUrl()
    {
        return Environment.GetEnvironmentVariable("BASE_URL") ?? "http://localhost:3000";
    }

    /// <summary>
    /// Checks if tests should run in headed mode
    /// </summary>
    protected bool IsHeadedMode()
    {
        var headed = Environment.GetEnvironmentVariable("HEADED");
        return headed == "1" || headed?.ToLower() == "true";
    }
}

