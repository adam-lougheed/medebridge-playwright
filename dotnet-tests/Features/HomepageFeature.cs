using Medebridge.PlaywrightTests.StepDefinitions;
using NUnit.Framework;

namespace Medebridge.PlaywrightTests.Features;

/// <summary>
/// Feature: Homepage functionality tests
/// </summary>
[Parallelizable(ParallelScope.Self)]
public class HomepageFeature : HomepageSteps
{
    [Test]
    public async Task HomepageLoadsDotNet()
    {
        // Arrange
        var baseUrl = GetBaseUrl();

        // Act
        await NavigateToHomepageAsync();
        await WaitForPageLoadAsync(2000);

        // Assert
        await VerifyHomepageTitleAsync();
    }
}

