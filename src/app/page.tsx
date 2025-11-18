'use client';

import { useState, useEffect } from 'react';

interface Test {
  id: number;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'error';
}

interface TestResult {
  id: string;
  testName: string;
  status: 'passed' | 'failed' | 'error';
  timestamp: Date;
  message?: string;
  error?: string;
}

interface Environment {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'tests' | 'results' | 'settings' | 'environments'>('tests');
  const headless = false; // Always run headed; browser window will open
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', String(newDarkMode));
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  const [tests, setTests] = useState<Test[]>([
    {
      id: 1,
      name: 'HomepageLoadsDotNet',
      description: 'Verifies that the homepage loads correctly',
      status: 'pending',
    },
  ]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [newEnvName, setNewEnvName] = useState('');
  const [newEnvUrl, setNewEnvUrl] = useState('');

  // Initialize environments from localStorage
  useEffect(() => {
    const savedEnvironments = localStorage.getItem('environments');
    if (savedEnvironments) {
      setEnvironments(JSON.parse(savedEnvironments));
    } else {
      // Default local environment
      const defaultEnv: Environment[] = [
        { id: 'default', name: 'Local', url: 'http://localhost:3000', enabled: true },
      ];
      setEnvironments(defaultEnv);
      localStorage.setItem('environments', JSON.stringify(defaultEnv));
    }
  }, []);

  // Save environments to localStorage whenever they change
  useEffect(() => {
    if (environments.length > 0) {
      localStorage.setItem('environments', JSON.stringify(environments));
    }
  }, [environments]);

  const addEnvironment = () => {
    if (!newEnvName.trim() || !newEnvUrl.trim()) return;

    const newEnv: Environment = {
      id: `${Date.now()}-${Math.random()}`,
      name: newEnvName.trim(),
      url: newEnvUrl.trim(),
      enabled: false,
    };

    setEnvironments((prev) => [...prev, newEnv]);
    setNewEnvName('');
    setNewEnvUrl('');
  };

  const toggleEnvironment = (envId: string) => {
    setEnvironments((prev) =>
      prev.map((env) => ({
        ...env,
        enabled: env.id === envId ? !env.enabled : false, // Only one enabled at a time
      }))
    );
  };

  const deleteEnvironment = (envId: string) => {
    setEnvironments((prev) => prev.filter((env) => env.id !== envId));
  };

  const getEnabledEnvironment = (): Environment | undefined => {
    return environments.find((env) => env.enabled) || environments.find((env) => env.id === 'default');
  };

  const runTest = async (testId: number) => {
    const test = tests.find((t) => t.id === testId);
    if (!test) return;

    // Update status to running
    setTests((prevTests) =>
      prevTests.map((t) =>
        t.id === testId ? { ...t, status: 'running' as const } : t
      )
    );

    const resultId = `${Date.now()}-${Math.random()}`;
    const startTime = new Date();

    try {
      const enabledEnv = getEnabledEnvironment();
      const baseURL = enabledEnv?.url || 'http://localhost:3000';

      const response = await fetch('/api/run-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testName: test.name, baseURL }),
      });

      const data = await response.json();

      // Update test status
      setTests((prevTests) =>
        prevTests.map((t) =>
          t.id === testId
            ? { ...t, status: data.status as Test['status'] }
            : t
        )
      );

      // Add to results history
      const result: TestResult = {
        id: resultId,
        testName: test.name,
        status: data.status,
        timestamp: startTime,
        message: data.message,
        error: data.error,
      };

      setTestResults((prevResults) => [result, ...prevResults]);
      
      // Switch to results tab to show the new result
      setActiveTab('results');
    } catch (error: any) {
      // Update status to error
      setTests((prevTests) =>
        prevTests.map((t) =>
          t.id === testId ? { ...t, status: 'error' as const } : t
        )
      );

      // Add error to results
      const result: TestResult = {
        id: resultId,
        testName: test.name,
        status: 'error',
        timestamp: startTime,
        message: 'Failed to run test',
        error: error.message,
      };

      setTestResults((prevResults) => [result, ...prevResults]);
      setActiveTab('results');
    }
  };

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">medEbridge Playwright</h1>
        
        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('tests')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tests'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              Tests
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'results'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              Results
              {testResults.length > 0 && (
                <span className="ml-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 py-0.5 px-2 rounded-full text-xs">
                  {testResults.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('environments')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'environments'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              Environments
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              Settings
            </button>
          </nav>
        </div>

        {/* Tests Tab */}
        {activeTab === 'tests' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Test Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {tests.map((test) => (
                  <tr key={test.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {test.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {test.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          test.status === 'passed'
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                            : test.status === 'failed' || test.status === 'error'
                            ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                            : test.status === 'running'
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                            : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                        }`}
                      >
                        {test.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => runTest(test.id)}
                        disabled={test.status === 'running'}
                        className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white ${
                          test.status === 'running'
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                        }`}
                      >
                        {test.status === 'running' ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-2 h-3 w-3 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Running...
                          </>
                        ) : (
                          'Run'
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            {testResults.length === 0 ? (
              <div className="p-12 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No test results</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Run a test from the Tests tab to see results here.
                </p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Test Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Message
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {testResults.map((result) => (
                    <tr key={result.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {result.testName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            result.status === 'passed'
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                              : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                          }`}
                        >
                          {result.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatTimestamp(result.timestamp)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="max-w-md">
                          {result.message && (
                            <div className="text-gray-900 dark:text-white">{result.message}</div>
                          )}
                          {result.error && (
                            <div className="mt-1 text-red-600 dark:text-red-400 text-xs font-mono">
                              {result.error}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Environments Tab */}
        {activeTab === 'environments' && (
          <div className="space-y-4">
            {/* Add Environment Form */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add Environment</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="env-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Environment Name
                  </label>
                  <input
                    type="text"
                    id="env-name"
                    value={newEnvName}
                    onChange={(e) => setNewEnvName(e.target.value)}
                    placeholder="e.g., Production, Staging"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') addEnvironment();
                    }}
                  />
                </div>
                <div>
                  <label htmlFor="env-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Environment URL
                  </label>
                  <input
                    type="text"
                    id="env-url"
                    value={newEnvUrl}
                    onChange={(e) => setNewEnvUrl(e.target.value)}
                    placeholder="e.g., https://api.example.com"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') addEnvironment();
                    }}
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={addEnvironment}
                    disabled={!newEnvName.trim() || !newEnvUrl.trim()}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed dark:focus:ring-offset-gray-800"
                  >
                    Add Environment
                  </button>
                </div>
              </div>
            </div>

            {/* Environments Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Environments</h2>
              </div>
              {environments.length === 0 ? (
                <div className="p-12 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No environments</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Add an environment above to get started.
                  </p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        URL
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {environments.map((env) => (
                      <tr key={env.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {env.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {env.url}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              env.enabled
                                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                            }`}
                          >
                            {env.enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-4">
                            <button
                              type="button"
                              onClick={() => toggleEnvironment(env.id)}
                              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                                env.enabled ? 'bg-blue-600' : 'bg-gray-200'
                              }`}
                              role="switch"
                              aria-checked={env.enabled}
                            >
                              <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                  env.enabled ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                            {env.id !== 'default' && (
                              <button
                                onClick={() => deleteEnvironment(env.id)}
                                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Settings</h2>
              
              <div className="space-y-6">
                {/* Dark Mode Toggle */}
                <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex-1">
                    <label htmlFor="dark-mode-toggle" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Dark Mode
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {darkMode ? 'Dark theme enabled' : 'Light theme enabled'}
                    </p>
                  </div>
                  <button
                    type="button"
                    id="dark-mode-toggle"
                    onClick={toggleDarkMode}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                      darkMode ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                    role="switch"
                    aria-checked={darkMode}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        darkMode ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Headless Mode Info */}
                <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700 opacity-60 cursor-not-allowed">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Headless Mode
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Disabled. Browser always opens for debugging.
                    </p>
                  </div>
                  <div className="relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent bg-gray-200 dark:bg-gray-700">
                    <span className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-0" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
    </div>
  );
}
