class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Что-то пошло не так</h1>
            <button onClick={() => window.location.reload()} className="btn-primary">
              Перезагрузить
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function AdminApp() {
  try {
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
      const isAdmin = sessionStorage.getItem('admin_authenticated');
      if (!isAdmin) {
        window.location.href = 'login.html';
      } else {
        setLoading(false);
      }
    }, []);

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg">Проверка доступа...</div>
        </div>
      );
    }

    return (
      <div className="min-h-screen" data-name="admin-app" data-file="admin-app.js">
        <Header isAdmin={true} />
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold mb-4">Административная панель</h1>
          <AdminPanel />
        </div>
      </div>
    );
  } catch (error) {
    console.error('AdminApp component error:', error);
    return null;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <AdminApp />
  </ErrorBoundary>
);