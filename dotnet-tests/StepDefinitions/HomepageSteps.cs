using Medebridge.PlaywrightTests.POMElements;
using NUnit.Framework;
using Reqnroll;

namespace Medebridge.PlaywrightTests.StepDefinitions;

/// <summary>
/// Step definitions for homepage-related test operations using Reqnroll
/// </summary>
[Binding]
public class HomepageSteps : TestBase
{
    private HomePage? _homePage;

    /// <summary>
    /// Initializes the homepage page object
    /// </summary>
    private HomePage GetHomePage()
    {
        // Ensure Playwright is initialized first
        if (!PlaywrightContext.IsInitialized)
        {
            throw new InvalidOperationException("Playwright context must be initialized before accessing Page. Ensure [BeforeScenario] hook runs or call InitializeAsync() first.");
        }
        
        _homePage ??= new HomePage(Page);
        return _homePage;
    }

    [Given(@"I navigate to the homepage")]
    public async Task GivenINavigateToTheHomepage()
    {
        // Ensure Playwright is initialized (fallback if hook didn't run)
        if (!PlaywrightContext.IsInitialized)
        {
            await PlaywrightContext.InitializeAsync();
        }
        
        var baseUrl = GetBaseUrl();
        var homePage = GetHomePage();
        await homePage.NavigateAsync(baseUrl);
    }

    [When(@"the page loads")]
    public async Task WhenThePageLoads()
    {
        await GetHomePage().WaitForPageLoadAsync(2000);
    }

    [Then(@"the page title should match the expected pattern")]
    public async Task ThenThePageTitleShouldMatchTheExpectedPattern()
    {
        var isValid = await GetHomePage().VerifyTitleAsync();
        Assert.That(isValid, Is.True, "Homepage title does not match expected pattern");
    }

    /// <summary>
    /// Helper method: Get the current page title
    /// </summary>
    public async Task<string> GetPageTitleAsync()
    {
        return await GetHomePage().GetTitleAsync();
    }
}

