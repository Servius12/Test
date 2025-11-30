function ExerciseModal({ exercise, onClose, onNext, isLastExercise, onLog, onSaveAll }) {
  try {
    const initialSets = exercise.sets ? 
      Array.from({ length: parseInt(exercise.sets) }, () => ({ 
        weight: exercise.weight || '', 
        reps: exercise.reps || '' 
      })) : 
      [{ weight: '', reps: '' }];
    
    const [sets, setSets] = React.useState(initialSets);
    const [logged, setLogged] = React.useState(false);

    const addSet = () => {
      setSets([...sets, { weight: exercise.weight || '', reps: exercise.reps || '' }]);
    };

    const removeSet = (index) => {
      if (sets.length > 1) {
        setSets(sets.filter((_, idx) => idx !== index));
      }
    };

    const handleLogAndNext = () => {
      onLog(exercise.name, sets);
      setLogged(true);
      if (onNext) {
        setTimeout(() => onNext(), 300);
      }
    };

    const handleSaveAll = async () => {
      if (!logged) {
        onLog(exercise.name, sets);
      }
      await onSaveAll();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50" onClick={onClose} data-name="exercise-modal" data-file="components/ExerciseModal.js">
        <div className="card w-full max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl sm:max-w-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-start mb-3">
            <h2 className="text-base font-bold pr-2">{exercise.name}</h2>
            <button onClick={onClose} className="text-2xl text-[var(--text-secondary)] leading-none flex-shrink-0">×</button>
          </div>

          {exercise.videoUrl && (
            <div className="mb-3 rounded-lg overflow-hidden" style={{position: 'relative', paddingBottom: '56.25%', height: 0}}>
              <iframe
                src={exercise.videoUrl}
                style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Exercise Video"
              />
            </div>
          )}

          <div className="mb-3">
            <h3 className="font-bold text-xs mb-1">Техника выполнения:</h3>
            <p className="text-xs text-[var(--text-secondary)] line-clamp-3">{exercise.description || 'Следуйте инструкциям тренера'}</p>
          </div>

          <div className="mb-3 p-2 bg-[var(--bg-light)] rounded-lg">
            <h3 className="font-bold text-xs mb-2">План тренировки:</h3>
            <div className="space-y-1 text-xs">
              <p><span className="text-[var(--text-secondary)]">Подходы:</span> {exercise.sets}</p>
              <p><span className="text-[var(--text-secondary)]">Повторения:</span> {exercise.reps}</p>
              {exercise.weight && <p><span className="text-[var(--text-secondary)]">Вес:</span> {exercise.weight} кг</p>}
              {exercise.restTime && <p><span className="text-[var(--text-secondary)]">Отдых:</span> {exercise.restTime} сек</p>}
            </div>
          </div>

          <div className="mb-3">
            <h3 className="font-bold text-xs mb-2">Записать результаты:</h3>
            {sets.map((set, idx) => (
              <div key={idx} className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-[var(--text-secondary)] w-12">№{idx + 1}</span>
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <input 
                    type="number"
                    placeholder="Вес"
                    value={set.weight}
                    onChange={(e) => {
                      const newSets = [...sets];
                      newSets[idx].weight = e.target.value;
                      setSets(newSets);
                    }}
                    className="px-2 py-1.5 border rounded-lg text-sm"
                  />
                  <input 
                    type="number"
                    placeholder="Повторы"
                    value={set.reps}
                    onChange={(e) => {
                      const newSets = [...sets];
                      newSets[idx].reps = e.target.value;
                      setSets(newSets);
                    }}
                    className="px-2 py-1.5 border rounded-lg text-sm"
                  />
                </div>
                {sets.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSet(idx)}
                    className="text-red-500 hover:text-red-700">
                    <div className="icon-trash-2 text-lg"></div>
                  </button>
                )}
              </div>
            ))}
            <button 
              type="button"
              onClick={addSet} 
              className="w-full px-2 py-1.5 border-2 border-dashed border-[var(--primary-color)] text-[var(--primary-color)] text-xs rounded-lg active:bg-[var(--secondary-color)] transition-all touch-manipulation">
              <div className="icon-plus text-sm inline-block mr-1"></div>
              Добавить подход
            </button>
          </div>

          {logged && (
            <div className="text-center py-1.5 bg-green-50 text-green-600 rounded-lg text-xs mb-2">
              ✓ Результаты записаны
            </div>
          )}
          
          {isLastExercise ? (
            <div className="space-y-2">
              <button onClick={handleSaveAll} className="btn-primary w-full">
                Сохранить результаты дня
              </button>
              <button onClick={onClose} className="btn-secondary w-full">
                Закрыть
              </button>
            </div>
          ) : (
            <button onClick={handleLogAndNext} disabled={logged} className="btn-primary w-full">
              {logged ? 'Переход к следующему...' : 'Следующее упражнение →'}
            </button>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('ExerciseModal component error:', error);
    return null;
  }
}