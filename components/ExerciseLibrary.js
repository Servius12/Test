function ExerciseLibrary({ onSelectExercise, onClose, viewMode }) {
  try {
    const [exercises, setExercises] = React.useState([]);
    const [filteredExercises, setFilteredExercises] = React.useState([]);
    const [selectedGroup, setSelectedGroup] = React.useState('all');
    const [searchQuery, setSearchQuery] = React.useState('');
    const [showPreview, setShowPreview] = React.useState(null);

    React.useEffect(() => {
      loadExercises();
    }, []);

    React.useEffect(() => {
      filterExercises();
    }, [selectedGroup, searchQuery, exercises]);

    const loadExercises = async () => {
      try {
        const result = await trickleListObjects('exercise_library', 100);
        setExercises(result.items);
      } catch (error) {
        console.error('Error loading exercises:', error);
      }
    };

    const filterExercises = () => {
      let filtered = exercises;
      if (selectedGroup !== 'all') {
        filtered = filtered.filter(ex => ex.objectData.MuscleGroup === selectedGroup);
      }
      if (searchQuery) {
        filtered = filtered.filter(ex => 
          ex.objectData.Name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      setFilteredExercises(filtered);
    };

    const muscleGroups = ['all', 'Грудь', 'Спина', 'Ноги', 'Плечи', 'Руки', 'Пресс'];

    const handleExerciseClick = (exercise) => {
      if (viewMode) {
        setShowPreview(exercise);
      } else if (onSelectExercise) {
        onSelectExercise(exercise);
      }
    };

    const content = (
      <div>
        {!viewMode && (
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold">Библиотека упражнений</h2>
            <button onClick={onClose} className="text-2xl text-[var(--text-secondary)]">×</button>
          </div>
        )}

          <input 
            type="text"
            placeholder="Поиск упражнений..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg mb-4"
          />

          <div className="flex gap-2 mb-4 overflow-x-auto">
            {muscleGroups.map(group => (
              <button
                key={group}
                onClick={() => setSelectedGroup(group)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                  selectedGroup === group 
                    ? 'bg-[var(--primary-color)] text-white' 
                    : 'bg-gray-100'
                }`}>
                {group === 'all' ? 'Все' : group}
              </button>
            ))}
          </div>

        <div className="space-y-2">
          {filteredExercises.map((exercise) => (
            <div 
              key={exercise.objectId}
              onClick={() => handleExerciseClick(exercise.objectData)}
              className="p-2 border rounded-lg cursor-pointer active:bg-[var(--secondary-color)]">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-sm">{exercise.objectData.Name}</h3>
                  <span className="text-xs px-2 py-0.5 bg-[var(--secondary-color)] rounded whitespace-nowrap ml-2">
                    {exercise.objectData.MuscleGroup}
                  </span>
                </div>
              <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
                {exercise.objectData.Description}
              </p>
            </div>
          ))}
        </div>
      </div>
    );

    if (viewMode) {
      return (
        <div>
          {content}
          {showPreview && (
            <ExercisePreview
              exercise={showPreview}
              onClose={() => setShowPreview(null)}
            />
          )}
        </div>
      );
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
        <div className="card max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          {content}
        </div>
      </div>
    );
  } catch (error) {
    console.error('ExerciseLibrary error:', error);
    return null;
  }
}
