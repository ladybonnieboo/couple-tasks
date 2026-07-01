import { Component, type ReactNode } from 'react'

interface State { error: Error | null }

export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="p-6 bg-red-50 min-h-screen">
          <h2 className="text-red-700 font-bold text-lg mb-2">שגיאה</h2>
          <pre className="text-xs text-red-600 whitespace-pre-wrap break-all bg-white p-3 rounded-lg">
            {this.state.error.message}
            {'\n\n'}
            {this.state.error.stack}
          </pre>
          <button
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg"
            onClick={() => this.setState({ error: null })}
          >
            נסה שוב
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
