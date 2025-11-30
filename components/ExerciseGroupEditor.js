function ExerciseGroupEditor({ group, dayIndex, onUpdate, onRemove, onAddExercise }) {
  try {
    const [showExerciseLibrary, setShowExerciseLibrary] = React.useState(false);

    const handleAddExercise = () => {
      if (onAddExercise) {
        onAddExercise();
      } else {
        setShowExerciseLibrary(true);
      }
    };

    const addExerciseToGroup = (exercise) => {
      const newExercise = {
        name: exercise.Name,
        muscleGroup: exercise.MuscleGroup,
        sets: '3',
        reps: '10',
        weight: '',
        restTime: '60',
        description: exercise.Description,
        videoUrl: exercise.VideoUrl
      };
      
      if (group.type === 'dropset') {
        newExercise.dropsets = [{weight: '', reps: ''}, {weight: '', reps: ''}, {weight: '', reps: ''}];
      }
      
      const newExercises = [...(group.exercises || []), newExercise];
      onUpdate({ ...group, exercises: newExercises });
      setShowExerciseLibrary(false);
    };

    const removeExercise = (index) => {
      const newExercises = [...group.exercises];
      newExercises.splice(index, 1);
      onUpdate({ ...group, exercises: newExercises });
    };

    const updateDropset = (exIdx, dropIdx, field, value) => {
      const newExercises = [...group.exercises];
      if (!newExercises[exIdx].dropsets) newExercises[exIdx].dropsets = [];
      newExercises[exIdx].dropsets[dropIdx][field] = value;
      onUpdate({ ...group, exercises: newExercises });
    };

    const typeLabels = {
      'superset': 'Суперсет',
      'dropset': 'Дропсет',
      'circuit': 'Круговая',
      'amrap': 'AMRAP',
      'emom': 'EMOM',
      'wod': 'WOD',
      'standard': 'Стандарт'
    };

    return (
      <div className="border-2 border-purple-500 rounded-lg p-3 mb-3" data-name="exercise-group-editor" data-file="components/ExerciseGroupEditor.js">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <div className="icon-zap text-sm text-purple-600"></div>
            <span className="font-bold text-sm text-purple-600">
              {typeLabels[group.type] || 'Группа'}
              {group.type === 'circuit' && ` (${group.rounds || 3} кругов)`}
              {group.type === 'amrap' && ` (${group.duration || 10} мин)`}
              {group.type === 'emom' && ` (${group.duration || 10} раундов)`}
            </span>
          </div>
          <button type="button" onClick={onRemove} className="text-red-500">
            <div className="icon-x text-base"></div>
          </button>
        </div>

        {group.type === 'circuit' && (
          <div className="mb-3">
            <label className="block text-xs font-medium mb-1">Количество кругов</label>
            <input 
              type="number"
              min="1"
              value={group.rounds || 3}
              onChange={(e) => onUpdate({...group, rounds: parseInt(e.target.value)})}
              className="w-full px-2 py-1 border rounded text-sm"
            />
          </div>
        )}

        {(group.type === 'amrap' || group.type === 'emom') && (
          <div className="mb-3">
            <label className="block text-xs font-medium mb-1">
              {group.type === 'amrap' ? 'Длительность (минуты)' : 'Количество раундов'}
            </label>
            <input 
              type="number"
              min="1"
              value={group.duration || 10}
              onChange={(e) => onUpdate({...group, duration: parseInt(e.target.value)})}
              className="w-full px-2 py-1 border rounded text-sm"
            />
          </div>
        )}

        <div className="space-y-2 mb-3">
          {(group.exercises || []).map((ex, idx) => (
            <div key={idx} className="p-2 bg-white rounded border">
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium text-xs">{ex.name}</span>
                <button type="button" onClick={() => removeExercise(idx)} className="text-red-500">
                  <div className="icon-trash-2 text-sm"></div>
                </button>
              </div>
              
              {group.type === 'dropset' ? (
                <div className="space-y-1">
                  <p className="text-xs text-[var(--text-secondary)] mb-1">Дропсеты (снижение веса):</p>
                  {(ex.dropsets || []).map((drop, dropIdx) => (
                    <div key={dropIdx} className="grid grid-cols-2 gap-1">
                      <input 
                        type="number"
                        placeholder={`Вес ${dropIdx + 1}`}
                        value={drop.weight}
                        onChange={(e) => updateDropset(idx, dropIdx, 'weight', e.target.value)}
                        className="px-2 py-1 border rounded text-xs"
                      />
                      <input 
                        type="number"
                        placeholder={`Повторы ${dropIdx + 1}`}
                        value={drop.reps}
                        onChange={(e) => updateDropset(idx, dropIdx, 'reps', e.target.value)}
                        className="px-2 py-1 border rounded text-xs"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-[var(--text-secondary)]">
                  {ex.sets} × {ex.reps} {ex.weight && `• ${ex.weight} кг`}
                </div>
              )}
            </div>
          ))}
        </div>

        <button 
          type="button"
          onClick={handleAddExercise}
          className="w-full px-3 py-2 border-2 border-dashed border-purple-500 text-purple-600 text-xs rounded">
          + Добавить упражнение
        </button>

        {showExerciseLibrary && !onAddExercise && (
          <ExerciseLibrary 
            onSelectExercise={addExerciseToGroup}
            onClose={() => setShowExerciseLibrary(false)}
          />
        )}
      </div>
    );
  } catch (error) {
    console.error('ExerciseGroupEditor error:', error);
    return null;
  }
}