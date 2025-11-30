class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary:', error, errorInfo.componentStack);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <button onClick={() => window.location.reload()} className="btn-primary">
            Перезагрузить
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function LoginApp() {
  return (
    <div className="min-h-screen bg-[var(--bg-light)]">
      <LoginForm />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<ErrorBoundary><LoginApp /></ErrorBoundary>);