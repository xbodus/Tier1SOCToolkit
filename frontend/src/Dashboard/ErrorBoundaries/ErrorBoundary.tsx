import React, { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{
          padding: '20px',
          background: '#0a0a0a',
          color: '#ff0000',
          border: '2px solid #ff0000',
          fontFamily: 'Courier New, monospace'
        }}>
          <h2>[ ERROR DETECTED ]</h2>
          <p>Component crashed: {this.state.error?.message}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              background: '#0a0a0a',
              color: '#00ff00',
              border: '2px solid #00ff00',
              padding: '8px 12px',
              cursor: 'pointer'
            }}
          >
            RETRY
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;