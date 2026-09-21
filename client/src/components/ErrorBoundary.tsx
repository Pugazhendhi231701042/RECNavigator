import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  title?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.warn('Failed to clear storage:', e);
    }
    if (this.props.onReset) {
      this.props.onReset();
    }
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen w-full bg-[#0F172A] text-white flex flex-col items-center justify-center p-6 text-center select-none font-sans">
          <div className="w-16 h-16 rounded-2xl bg-purple-900/60 border border-purple-500/40 text-amber-400 flex items-center justify-center mb-5 text-3xl shadow-xl animate-pulse">
            ⚠️
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white mb-2">
            {this.props.title || 'RECNavigator Viewport Recovery'}
          </h1>
          <p className="text-slate-400 text-xs max-w-md mb-6 leading-relaxed">
            {this.state.error?.message ||
              'A rendering issue was detected. Your cached browser state may have become desynchronized.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
              }}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 shadow-md transition-all active:scale-95"
            >
              Try Recovering Scene
            </button>
            <button
              onClick={this.handleReset}
              className="px-5 py-2.5 bg-gradient-to-r from-[#6A1B9A] to-[#4A148C] hover:brightness-110 text-white font-bold text-xs rounded-xl shadow-lg border border-purple-400/30 transition-all active:scale-95"
            >
              Reset Data & Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
