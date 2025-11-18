import { spawn } from 'child_process';
import { NextResponse } from 'next/server';

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

    console.log('=== TEST RUN REQUEST ===');
    console.log('Test name:', testName);
    console.log('Base URL:', baseURL);
    
    // Run C# test using dotnet test
    const command = 'dotnet';
    const args = ['test', 'dotnet-tests'];
    
    console.log('Running C# test:', command, args.join(' '));
    
    return new Promise((resolve) => {
      const child = spawn(command, args, {
        cwd: process.cwd(),
        env: {
          ...process.env,
          CI: 'false',
          BASE_URL: baseURL,
          HEADED: '1', // Run browser in headed mode (visible)
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
        console.error('Process error (dotnet test):', error);
        resolve(failureResponse('Failed to run C# test', error.message));
      });

      child.on('close', (code) => {
        console.log('Process exited with code:', code);
        console.log('Stdout length:', stdout.length);
        console.log('Stderr length:', stderr.length);
        
        if (code === 0) {
          resolve(successResponse());
        } else {
          const output = stderr || stdout || '';
          resolve(failureResponse('C# test failed', output.split('\n').slice(-10).join('\n')));
        }
      });
    });
  } catch (error: any) {
    console.error('Error running test:', error);
    return failureResponse('Failed to run test', error.message);
  }
}
