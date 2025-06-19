import React, { Component, ErrorInfo, ReactNode } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className='min-h-screen flex items-center justify-center bg-gray-50'>
          <div className='max-w-md w-full p-6'>
            <div className='text-center'>
              <FiAlertTriangle className='h-12 w-12 text-red-500 mx-auto mb-4' />
              <h1 className='text-2xl font-bold text-gray-900 mb-2'>
                Oops! Something went wrong
              </h1>
              <p className='text-gray-600 mb-6'>
                We apologize for the inconvenience. Please try refreshing the
                page.
              </p>
              <div className='space-y-3'>
                <button
                  onClick={() => window.location.reload()}
                  className='btn btn-primary w-full'
                >
                  Refresh Page
                </button>
                <button
                  onClick={this.handleReset}
                  className='btn btn-outline w-full'
                >
                  Try Again
                </button>
              </div>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className='mt-6 text-left'>
                  <summary className='cursor-pointer text-sm text-gray-500'>
                    Error details
                  </summary>
                  <pre className='mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto'>
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
