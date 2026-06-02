import React, { StrictMode, Component, ErrorInfo, ReactNode } from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '30px', color: '#ff003c', backgroundColor: '#050505', fontFamily: 'monospace', minHeight: '100vh', overflow: 'auto', border: '3px solid #ff003c', borderRadius: '8px' }}>
          <h1 style={{ fontSize: '20px', marginBottom: '10px' }}>⚠️ RETRO TERMINAL EXCEPTION</h1>
          <p style={{ color: '#aaa', marginBottom: '20px' }}>A runtime crash occurred in the 3D cartridge deck subsystem:</p>
          <pre style={{ whiteSpace: 'pre-wrap', backgroundColor: '#111', padding: '15px', borderRadius: '4px', border: '1px solid #333' }}>{this.state.error?.toString()}</pre>
          <pre style={{ whiteSpace: 'pre-wrap', marginTop: '20px', color: '#666' }}>{this.state.error?.stack}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
