import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white dark:bg-[#0a0a0a] min-h-[60vh] flex flex-col items-center justify-center p-10 text-center">
          <span className="bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 mb-4">Error</span>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3">Something went wrong</h2>
          <p className="text-gray-500 mb-2 text-sm max-w-md">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <Link
            to="/"
            className="mt-4 px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black uppercase tracking-widest transition-colors"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Back to Home
          </Link>
        </div>
      );
    }
    return this.props.children;
  }
}
