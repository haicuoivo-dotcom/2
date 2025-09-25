/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error | null;
    errorInfo?: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error: _, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in React component:", error, errorInfo);
    this.setState({ error, errorInfo });
    }

    private handleReload = () => {
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div style={styles.container}>
                    <h1 style={styles.title}>Đã xảy ra lỗi!</h1>
                    <p style={styles.message}>
                        {this.state.error?.message || 'Không rõ lỗi.'}
                    </p>
                    {this.state.errorInfo && (
                        <details style={{ whiteSpace: 'pre-wrap', color: '#F5A623', marginBottom: '1rem', textAlign: 'left', maxWidth: 600, margin: '0 auto' }}>
                            {this.state.errorInfo.componentStack}
                        </details>
                    )}
                    <button onClick={this.handleReload} style={styles.button}>
                        Tải lại trang
                    </button>
                </div>
            );
        }

        // FIX: The prop 'props' does not exist on type 'ErrorBoundary'. It should be `this.props`.
        return this.props.children;
    }
}

// Basic inline styles to avoid CSS dependencies for this critical component
const styles: { [key: string]: React.CSSProperties } = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        textAlign: 'center',
        padding: '2rem',
        backgroundColor: '#0D0C1D',
        color: '#FFFFFF',
    },
    title: {
        fontSize: '2rem',
        color: '#D83C3C',
        marginBottom: '1rem',
    },
    message: {
        fontSize: '1.1rem',
        color: '#C7C7CC',
        marginBottom: '2rem',
        maxWidth: '500px',
        lineHeight: '1.6',
    },
    button: {
        padding: '0.75rem 1.5rem',
        fontSize: '1rem',
        color: '#FFFFFF',
        backgroundColor: '#6B61F5',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    }
};
