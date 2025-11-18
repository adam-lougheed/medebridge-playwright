using Microsoft.Playwright;
using System.Threading;

namespace Medebridge.PlaywrightTests.StepDefinitions;

/// <summary>
/// Manages Playwright context for Reqnroll tests
/// </summary>
public class PlaywrightContext
{
    private static IPage? _page;
    private static IBrowserContext? _browserContext;
    private static IPlaywright? _playwright;
    private static IBrowser? _browser;
    private static readonly object _lock = new();

    public static IPage? Page
    {
        get
        {
            lock (_lock)
            {
                return _page;
            }
        }
        set
        {
            lock (_lock)
            {
                _page = value;
            }
        }
    }
    
    public static bool IsInitialized
    {
        get
        {
            lock (_lock)
            {
                return _page != null;
            }
        }
    }

    public static IBrowserContext BrowserContext
    {
        get
        {
            lock (_lock)
            {
                return _browserContext ?? throw new InvalidOperationException("BrowserContext is not initialized.");
            }
        }
        set
        {
            lock (_lock)
            {
                _browserContext = value;
            }
        }
    }

    public static IPlaywright Playwright
    {
        get
        {
            lock (_lock)
            {
                return _playwright ?? throw new InvalidOperationException("Playwright is not initialized.");
            }
        }
        set
        {
            lock (_lock)
            {
                _playwright = value;
            }
        }
    }

    public static IBrowser Browser
    {
        get
        {
            lock (_lock)
            {
                return _browser ?? throw new InvalidOperationException("Browser is not initialized.");
            }
        }
        set
        {
            lock (_lock)
            {
                _browser = value;
            }
        }
    }

    public static async Task InitializeAsync()
    {
        var playwright = await Microsoft.Playwright.Playwright.CreateAsync();
        Playwright = playwright;

        var isHeaded = Environment.GetEnvironmentVariable("HEADED") == "1";
        var browser = await playwright.Chromium.LaunchAsync(new BrowserTypeLaunchOptions
        {
            Headless = !isHeaded
        });
        Browser = browser;

        var context = await browser.NewContextAsync();
        BrowserContext = context;

        var page = await context.NewPageAsync();
        Page = page;
    }

    public static async Task CleanupAsync()
    {
        IPage? pageToClose = null;
        IBrowserContext? contextToClose = null;
        IBrowser? browserToClose = null;
        IPlaywright? playwrightToDispose = null;

        lock (_lock)
        {
            pageToClose = _page;
            contextToClose = _browserContext;
            browserToClose = _browser;
            playwrightToDispose = _playwright;

            _page = null;
            _browserContext = null;
            _browser = null;
            _playwright = null;
        }

        if (pageToClose != null)
        {
            await pageToClose.CloseAsync();
        }

        if (contextToClose != null)
        {
            await contextToClose.CloseAsync();
        }

        if (browserToClose != null)
        {
            await browserToClose.CloseAsync();
        }

        playwrightToDispose?.Dispose();
    }
}

