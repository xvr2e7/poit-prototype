import React from "react";
import { IconHome, IconRetry } from "./icons";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onGoHome) {
      this.props.onGoHome();
    } else {
      window.location.href = "/";
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8">
          <div
            className="bg-surface backdrop-blur-sm border border-ink/10
            shadow-leaf dark:shadow-leaf-dark
            rounded-xl p-8 max-w-md w-full text-center"
          >
            <div className="w-12 h-12 rounded-full bg-seal/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-seal">!</span>
            </div>
            <h2 className="font-serif text-lg font-medium text-ink mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-ink/55 mb-6">
              {this.props.fallbackMessage ||
                "An unexpected error occurred. Your progress has been saved."}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="flex items-center gap-2 px-4 py-2 rounded-lg
                  border border-seal/25 text-seal hover:bg-seal/5
                  transition-colors font-mono text-xs tracking-wide"
              >
                <IconRetry className="w-4 h-4" />
                Try again
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex items-center gap-2 px-4 py-2 rounded-lg
                  bg-seal text-paper hover:bg-seal/90
                  transition-colors font-mono text-xs tracking-wide"
              >
                <IconHome className="w-4 h-4" />
                Go home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
