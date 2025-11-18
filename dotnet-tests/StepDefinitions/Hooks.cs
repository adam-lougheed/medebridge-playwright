using Reqnroll;

namespace Medebridge.PlaywrightTests.StepDefinitions;

/// <summary>
/// Hooks for Reqnroll scenarios to manage Playwright lifecycle
/// </summary>
[Binding]
public class Hooks
{
    [BeforeScenario(Order = 0)]
    public async Task BeforeScenarioAsync()
    {
        await PlaywrightContext.InitializeAsync();
    }

    [AfterScenario(Order = 1000)]
    public async Task AfterScenarioAsync()
    {
        await PlaywrightContext.CleanupAsync();
    }
}

