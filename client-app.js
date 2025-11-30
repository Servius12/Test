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

function ClientApp() {
  try {
    const [loading, setLoading] = React.useState(true);
    const [activeTab, setActiveTab] = React.useState('workouts');
    const [selectedExercise, setSelectedExercise] = React.useState(null);
    const [onNextExercise, setOnNextExercise] = React.useState(null);
    const [showFeedback, setShowFeedback] = React.useState(false);
    const [isLastExercise, setIsLastExercise] = React.useState(false);
    const [exerciseLogs, setExerciseLogs] = React.useState([]);

    React.useEffect(() => {
      verifyAccess();
    }, []);

    const verifyAccess = async () => {
      const status = await checkUserRegistration();
      if (!status.approved || status.role !== 'client') {
        window.location.href = 'index.html';
      } else {
        setLoading(false);
      }
    };

    const handleExerciseClick = (exercise, onNext, isLast) => {
      setSelectedExercise(exercise);
      setOnNextExercise(() => onNext);
      setIsLastExercise(isLast || false);
    };

    const handleExerciseLog = (exerciseName, sets) => {
      setExerciseLogs(prev => [...prev, { exerciseName, sets }]);
    };

    const handleSaveAllLogs = async () => {
      try {
        for (const log of exerciseLogs) {
          await trickleCreateObject('exercise_log', {
            exerciseName: log.exerciseName,
            sets: log.sets,
            date: new Date().toISOString()
          });
        }
        setExerciseLogs([]);
        setSelectedExercise(null);
        alert('Все результаты сохранены!');
      } catch (error) {
        console.error('Error saving logs:', error);
        alert('Ошибка при сохранении результатов');
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
      <div className="min-h-screen pb-12" data-name="client-app" data-file="client-app.js">
        <Header isClient={true} />
        <div className="px-3 py-3">
          <div className="flex gap-2 mb-3 overflow-x-auto">
            <button 
              onClick={() => setActiveTab('workouts')}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap ${activeTab === 'workouts' ? 'bg-[var(--primary-color)] text-white' : 'bg-white text-[var(--text-primary)]'}`}>
              Тренировки
            </button>
            <button 
              onClick={() => setActiveTab('statistics')}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap ${activeTab === 'statistics' ? 'bg-[var(--primary-color)] text-white' : 'bg-white text-[var(--text-primary)]'}`}>
              Статистика
            </button>
            <button 
              onClick={() => setActiveTab('completed')}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap ${activeTab === 'completed' ? 'bg-[var(--primary-color)] text-white' : 'bg-white text-[var(--text-primary)]'}`}>
              Завершенные
            </button>
            <button 
              onClick={() => setActiveTab('measurements')}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap ${activeTab === 'measurements' ? 'bg-[var(--primary-color)] text-white' : 'bg-white text-[var(--text-primary)]'}`}>
              Измерения
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap ${activeTab === 'profile' ? 'bg-[var(--primary-color)] text-white' : 'bg-white text-[var(--text-primary)]'}`}>
              Профиль
            </button>
          </div>
          
          {activeTab === 'workouts' && (
            <WorkoutProgram 
              onExerciseClick={handleExerciseClick}
              onFeedbackClick={() => setShowFeedback(true)}
            />
          )}
          {activeTab === 'statistics' && <Statistics />}
          {activeTab === 'completed' && <CompletedPrograms />}
          {activeTab === 'measurements' && <MeasurementHistory />}
          {activeTab === 'profile' && <ClientProfile />}
        </div>

        {selectedExercise && (
          <ExerciseModal 
            exercise={selectedExercise}
            onClose={() => {
              setSelectedExercise(null);
              setExerciseLogs([]);
            }}
            onNext={onNextExercise}
            isLastExercise={isLastExercise}
            onLog={handleExerciseLog}
            onSaveAll={handleSaveAllLogs}
          />
        )}

        {showFeedback && (
          <FeedbackForm onClose={() => setShowFeedback(false)} />
        )}
      </div>
    );
  } catch (error) {
    console.error('ClientApp component error:', error);
    return null;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <ClientApp />
  </ErrorBoundary>
);