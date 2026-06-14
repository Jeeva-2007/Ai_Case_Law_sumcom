import React, { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({ errorInfo })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI matching the app's premium dark theme
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white font-sans p-6">
          <div className="max-w-xl w-full p-8 bg-slate-900 border border-red-500/20 rounded-3xl shadow-2xl flex flex-col items-center text-center gap-6">
            {/* Visual Warning Icon */}
            <div className="relative w-16 h-16 flex items-center justify-center rounded-2xl bg-red-950/40 border border-red-500/30 text-4xl text-red-500 animate-pulse">
              ⚠️
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Something went wrong</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                An unexpected error occurred in the application view. You can attempt to reload the view below.
              </p>
            </div>

            {/* Try Again Button */}
            <button
              onClick={this.handleReset}
              className="py-3 px-6 font-semibold bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl shadow-lg shadow-indigo-500/20 transition-all duration-300 scale-[1.01] active:scale-[0.99]"
            >
              Try Again
            </button>

            {/* Collapsible Error details */}
            {this.state.error && (
              <details className="w-full text-left mt-4 border border-slate-800 rounded-xl bg-slate-950/60 p-4">
                <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-300 transition-colors font-semibold select-none outline-none">
                  Debug Details (Click to expand)
                </summary>
                <div className="mt-3 text-xs text-red-400/90 font-mono overflow-auto max-h-48 leading-relaxed whitespace-pre-wrap">
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </div>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
