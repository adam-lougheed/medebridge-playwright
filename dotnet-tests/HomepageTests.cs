using System.Text.RegularExpressions;
using Microsoft.Playwright.NUnit;
using NUnit.Framework;

namespace Medebridge.PlaywrightTests;

[Parallelizable(ParallelScope.Self)]
public class HomepageTests : PageTest
{
    private static readonly Regex TitlePattern =
        new("Create Next App|Test Dashboard|medEbridge", RegexOptions.IgnoreCase | RegexOptions.Compiled);

    [Test]
    public async Task HomepageLoadsDotNet()
    {
        var baseUrl = Environment.GetEnvironmentVariable("BASE_URL") ?? "http://localhost:3000";
        var targetUrl = new Uri(new Uri(baseUrl, UriKind.Absolute), "/").ToString();

        await Page.GotoAsync(targetUrl);
        await Page.WaitForTimeoutAsync(2000);

        var title = await Page.TitleAsync();
        Assert.That(title, Does.Match(TitlePattern), "Unexpected page title when loading the homepage.");
    }
}