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

function TrainerApp() {
  try {
    const [loading, setLoading] = React.useState(true);
    const [activeTab, setActiveTab] = React.useState('clients');
    const [selectedClient, setSelectedClient] = React.useState(null);
    const [showAssignment, setShowAssignment] = React.useState(false);
    const [showExerciseForm, setShowExerciseForm] = React.useState(false);
    const [showImport, setShowImport] = React.useState(false);

    React.useEffect(() => {
      verifyAccess();
    }, []);

    const verifyAccess = async () => {
      const status = await checkUserRegistration();
      if (!status.approved || status.role !== 'trainer') {
        window.location.href = 'index.html';
      } else {
        setLoading(false);
      }
    };

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg">Проверка доступа...</div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen" data-name="trainer-app" data-file="trainer-app.js">
        <Header isTrainer={true} />
        <div className="px-3 py-3">
          <div className="flex gap-2 mb-3 overflow-x-auto">
            <button 
              onClick={() => setActiveTab('clients')}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap ${activeTab === 'clients' ? 'bg-[var(--primary-color)] text-white' : 'bg-white text-[var(--text-primary)]'}`}>
              Клиенты
            </button>
            <button 
              onClick={() => setActiveTab('templates')}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap ${activeTab === 'templates' ? 'bg-[var(--primary-color)] text-white' : 'bg-white text-[var(--text-primary)]'}`}>
              Шаблоны
            </button>
            <button 
              onClick={() => setActiveTab('exercises')}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap ${activeTab === 'exercises' ? 'bg-[var(--primary-color)] text-white' : 'bg-white text-[var(--text-primary)]'}`}>
              Упражнения
            </button>
          </div>

          {activeTab === 'clients' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-bold">Мои Клиенты</h1>
                <button 
                  onClick={() => setShowAssignment(true)}
                  className="btn-primary text-sm">
                  <div className="icon-plus text-base inline-block mr-1"></div>
                  Программа
                </button>
              </div>
              <ClientList onClientSelect={setSelectedClient} />
            </div>
          )}

          {activeTab === 'templates' && <TemplateManager />}

          {activeTab === 'exercises' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-bold">Библиотека</h1>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowImport(true)}
                    className="btn-secondary text-sm">
                    <div className="icon-upload text-base inline-block mr-1"></div>
                    Импорт
                  </button>
                  <button 
                    onClick={() => setShowExerciseForm(true)}
                    className="btn-primary text-sm">
                    <div className="icon-plus text-base inline-block mr-1"></div>
                    Добавить
                  </button>
                </div>
              </div>
              <ExerciseLibrary viewMode={true} />
            </div>
          )}

          {selectedClient && (
            <ClientProfileView 
              client={selectedClient}
              onClose={() => setSelectedClient(null)}
            />
          )}

          {showAssignment && (
            <ProgramAssignment onClose={() => setShowAssignment(false)} />
          )}

          {showExerciseForm && (
            <ExerciseForm onClose={() => setShowExerciseForm(false)} />
          )}

          {showImport && (
            <ExerciseImport 
              onClose={() => setShowImport(false)}
              onImportComplete={() => window.location.reload()}
            />
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('TrainerApp component error:', error);
    return null;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <TrainerApp />
  </ErrorBoundary>
);