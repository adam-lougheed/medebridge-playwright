using Microsoft.Playwright;

namespace Medebridge.PlaywrightTests.POMElements;

/// <summary>
/// Page Object Model for the Homepage
/// </summary>
public class HomePage
{
    private readonly IPage _page;
    private const string ExpectedTitlePattern = "Create Next App|Test Dashboard|medEbridge";

    public HomePage(IPage page)
    {
        _page = page;
    }

    /// <summary>
    /// Navigates to the homepage
    /// </summary>
    public async Task NavigateAsync(string baseUrl)
    {
        var targetUrl = new Uri(new Uri(baseUrl, UriKind.Absolute), "/").ToString();
        await _page.GotoAsync(targetUrl);
    }

    /// <summary>
    /// Gets the page title
    /// </summary>
    public async Task<string> GetTitleAsync()
    {
        return await _page.TitleAsync();
    }

    /// <summary>
    /// Verifies the page title matches the expected pattern
    /// </summary>
    public async Task<bool> VerifyTitleAsync()
    {
        var title = await GetTitleAsync();
        return System.Text.RegularExpressions.Regex.IsMatch(
            title, 
            ExpectedTitlePattern, 
            System.Text.RegularExpressions.RegexOptions.IgnoreCase);
    }

    /// <summary>
    /// Waits for the page to be fully loaded
    /// </summary>
    public async Task WaitForPageLoadAsync(int timeoutMs = 2000)
    {
        await _page.WaitForTimeoutAsync(timeoutMs);
    }
}

