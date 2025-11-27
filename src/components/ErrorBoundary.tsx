import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="alert alert-danger m-4">
          <h4>Something went wrong!</h4>
          <p>There was an error in the Book Issue System.</p>
          <button 
            className="btn btn-primary"
            onClick={() => this.setState({ hasError: false })}
          >
            Try Again
          </button>
          {this.state.error && (
            <details className="mt-3">
              <summary>Error Details</summary>
              <pre className="mt-2 text-small">{this.state.error.message}</pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;