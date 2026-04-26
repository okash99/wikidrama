import { Component, type ReactNode, type ErrorInfo } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  isOffline: boolean
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, isOffline: false }

  static getDerivedStateFromError(): State {
    const isOffline = typeof navigator !== 'undefined' && !navigator.onLine
    return { hasError: true, isOffline }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[WikiDrama] Uncaught error:', error, info.componentStack)
  }

  handleRetry = () => {
    this.setState({ hasError: false, isOffline: false })
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <main className="flex flex-col flex-1 items-center justify-center gap-5 px-6 text-center">
        <span className="text-5xl">{this.state.isOffline ? '📡' : '💥'}</span>
        <div className="flex flex-col gap-1">
          <p className="text-white font-bold text-base">
            {this.state.isOffline ? 'Pas de connexion' : 'Quelque chose a planté'}
          </p>
          <p className="text-slate-400 text-sm">
            {this.state.isOffline
              ? 'Vérifie ta connexion puis réessaie.'
              : 'Une erreur inattendue s\'est produite.'}
          </p>
        </div>
        <button
          onClick={this.handleRetry}
          className="py-2.5 px-6 rounded-xl bg-red-500 hover:bg-red-600 active:scale-95 transition-all font-bold text-sm"
        >
          🔄 Réessayer
        </button>
      </main>
    )
  }
}
