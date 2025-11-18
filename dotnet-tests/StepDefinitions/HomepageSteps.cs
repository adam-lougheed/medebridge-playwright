using Medebridge.PlaywrightTests.POMElements;
using NUnit.Framework;

namespace Medebridge.PlaywrightTests.StepDefinitions;

/// <summary>
/// Step definitions for homepage-related test operations
/// </summary>
public class HomepageSteps : TestBase
{
    private HomePage? _homePage;

    /// <summary>
    /// Initializes the homepage page object
    /// </summary>
    protected HomePage GetHomePage()
    {
        _homePage ??= new HomePage(Page);
        return _homePage;
    }

    /// <summary>
    /// Step: Navigate to the homepage
    /// </summary>
    public async Task NavigateToHomepageAsync()
    {
        var baseUrl = GetBaseUrl();
        await GetHomePage().NavigateAsync(baseUrl);
    }

    /// <summary>
    /// Step: Wait for page to load
    /// </summary>
    public async Task WaitForPageLoadAsync(int timeoutMs = 2000)
    {
        await GetHomePage().WaitForPageLoadAsync(timeoutMs);
    }

    /// <summary>
    /// Step: Verify the homepage title is correct
    /// </summary>
    public async Task VerifyHomepageTitleAsync()
    {
        var isValid = await GetHomePage().VerifyTitleAsync();
        Assert.That(isValid, Is.True, "Homepage title does not match expected pattern");
    }

    /// <summary>
    /// Step: Get the current page title
    /// </summary>
    public async Task<string> GetPageTitleAsync()
    {
        return await GetHomePage().GetTitleAsync();
    }
}

