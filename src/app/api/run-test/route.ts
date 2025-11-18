import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import { NextResponse } from 'next/server';
import { platform } from 'os';

const execAsync = promisify(exec);

function successResponse() {
  return NextResponse.json({
    success: true,
    status: 'passed',
    message: 'Test passed successfully',
  });
}

function failureResponse(message: string, error?: string) {
  return NextResponse.json(
    {
      success: false,
      status: 'failed',
      message,
      error,
    },
    { status: 500 },
  );
}

export async function POST(request: Request) {
  try {
    const { testName, baseURL = 'http://localhost:3000' } = await request.json();
    const headless = false; // Always run headed so the browser opens

    // Run the specific test with JSON reporter
    // Playwright runs headless by default. 
    // When headless mode is off, run in headed mode and enable the Playwright Inspector (PWDEBUG)
    const headedArgs = headless ? [] : ['--headed'];
    
    console.log('=== TEST RUN REQUEST ===');
    console.log('Headless mode:', headless);
    console.log('Base URL:', baseURL);
    console.log('CLI args:', headedArgs);
    console.log('Test name:', testName);
    
    const isWindows = platform() === 'win32';
    const args = [
      'playwright',
      'test',
      'tests/example.spec.ts',
      '--project=chromium',
      '--reporter=list',
      ...headedArgs,
    ];

    // On Windows, when headless is false, we need to ensure GUI access
    // Use PowerShell with Start-Process to run in interactive desktop session
    if (isWindows && !headless) {
      // Escape the command properly for PowerShell
      const fullCommand = args.map(arg => `"${arg}"`).join(' ');
      const powershellCommand = `$process = Start-Process -FilePath "npx" -ArgumentList ${fullCommand} -WorkingDirectory "${process.cwd().replace(/\\/g, '/')}" -Environment @{"BASE_URL"="${baseURL}";"CI"="false"} -NoNewWindow -Wait -PassThru; exit $process.ExitCode`;
      
      // Use exec with shell: true to ensure process runs in interactive desktop session
      const command = `npx ${args.join(' ')}`;
      console.log('=== EXECUTING GUI COMMAND ===');
      console.log('Full command:', command);
      console.log('Working directory:', process.cwd());
      console.log('BASE_URL environment:', baseURL);
      console.log('Process platform:', process.platform);
      console.log('Process env USER:', process.env.USER || process.env.USERNAME);
      
      try {
        const { stdout, stderr } = await execAsync(command, {
          cwd: process.cwd(),
          maxBuffer: 1024 * 1024 * 10,
          shell: true,
          env: {
            ...process.env,
            CI: 'false',
            BASE_URL: baseURL,
          },
          windowsHide: false,
        } as any);

        console.log('Environment BASE_URL that was set:', baseURL);
        console.log('=== COMMAND COMPLETED ===');
        console.log('Stdout length:', stdout.length);
        console.log('Stderr length:', stderr.length);

        return successResponse();
      } catch (error: any) {
        if (error.code === 1) {
          const output = error.stdout || error.stderr || error.message || '';
          return failureResponse('Test failed', output.split('\n').slice(-10).join('\n'));
        }

        console.error('Error running test (exec path):', error);
        return failureResponse('Failed to run test', error.message);
      }
    } else {
      // Use spawn for headless mode or non-Windows
      return new Promise((resolve) => {
        const command = isWindows ? 'cmd.exe' : 'npx';
        const commandArgs = isWindows ? ['/c', 'npx', ...args] : args;
        
        console.log('Spawning command:', command, commandArgs.join(' '));

        console.log('Spawning command (headless path) with BASE_URL:', baseURL);
        
        const child = spawn(command, commandArgs, {
          cwd: process.cwd(),
          env: {
            ...process.env,
            CI: 'false',
            BASE_URL: baseURL, // Set base URL - Playwright config will read this
          },
          shell: false,
          detached: false,
          stdio: ['ignore', 'pipe', 'pipe'],
        });

        let stdout = '';
        let stderr = '';

        child.stdout?.on('data', (data) => {
          stdout += data.toString();
        });

        child.stderr?.on('data', (data) => {
          stderr += data.toString();
        });

        child.on('error', (error) => {
          console.error('Process error (spawn path):', error);
          resolve(failureResponse('Failed to run test', error.message));
        });

        child.on('close', (code) => {
          console.log('Process exited with code:', code);
          console.log('Stdout length:', stdout.length);
          console.log('Stderr length:', stderr.length);
          
          if (code === 0) {
            resolve(successResponse());
          } else {
            const output = stderr || stdout || '';
            resolve(failureResponse('Test failed', output.split('\n').slice(-10).join('\n')));
          }
        });
      });
    }
  } catch (error: any) {
    console.error('Error running test:', error);
    return failureResponse('Failed to run test', error.message);
  }
}
