function ProgramEditor({ program, onClose, onSave }) {
  try {
    const [editedProgram, setEditedProgram] = React.useState({
      name: program.name || '',
      weeksCount: program.weeksCount || 4,
      daysPerWeek: program.daysPerWeek || 3,
      schedule: program.schedule || []
    });
    const [showExerciseLibrary, setShowExerciseLibrary] = React.useState(false);
    const [currentDayIndex, setCurrentDayIndex] = React.useState(null);
    const [selectedExercise, setSelectedExercise] = React.useState(null);
    const [exerciseParams, setExerciseParams] = React.useState({
      sets: '3', reps: '10', weight: '', restTime: '60'
    });
    const [currentWorkoutType, setCurrentWorkoutType] = React.useState('standard');

    const addExerciseToDay = () => {
      if (!selectedExercise || currentDayIndex === null) return;
      
      const newSchedule = [...editedProgram.schedule];
      if (!newSchedule[currentDayIndex]) {
        newSchedule[currentDayIndex] = { dayNumber: currentDayIndex + 1, exercises: [] };
      }
      newSchedule[currentDayIndex].exercises.push({
        name: selectedExercise.Name,
        muscleGroup: selectedExercise.MuscleGroup,
        sets: exerciseParams.sets,
        reps: exerciseParams.reps,
        weight: exerciseParams.weight,
        restTime: exerciseParams.restTime,
        description: selectedExercise.Description,
        videoUrl: selectedExercise.VideoUrl
      });
      setEditedProgram({...editedProgram, schedule: newSchedule});
      setSelectedExercise(null);
      setExerciseParams({ sets: '3', reps: '10', weight: '', restTime: '60' });
    };

    const removeExercise = (dayIndex, exerciseIndex) => {
      const newSchedule = [...editedProgram.schedule];
      newSchedule[dayIndex].exercises.splice(exerciseIndex, 1);
      setEditedProgram({...editedProgram, schedule: newSchedule});
    };

    const handleSave = async () => {
      try {
        await onSave(editedProgram);
      } catch (error) {
        console.error('Error saving program:', error);
        alert('Ошибка при сохранении');
      }
    };

    return (
      <div className="space-y-4 max-h-[70vh] overflow-y-auto" data-name="program-editor" data-file="components/ProgramEditor.js">
        <div>
          <label className="block text-sm font-medium mb-2">Название</label>
          <input 
            type="text"
            value={editedProgram.name}
            onChange={(e) => setEditedProgram({...editedProgram, name: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-2">Недель</label>
            <input 
              type="number"
              min="1"
              value={editedProgram.weeksCount}
              onChange={(e) => setEditedProgram({...editedProgram, weeksCount: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Дней</label>
            <input 
              type="number"
              min="1"
              max="7"
              value={editedProgram.daysPerWeek}
              onChange={(e) => setEditedProgram({...editedProgram, daysPerWeek: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
        </div>

        <div className="border-t pt-3">
          <h4 className="font-bold text-sm mb-3">Расписание тренировок</h4>
          <div className="mb-3">
            <WorkoutTypeSelector value={currentWorkoutType} onChange={setCurrentWorkoutType} />
          </div>
          <div className="space-y-3">
            {Array.from({length: editedProgram.daysPerWeek}).map((_, dayIdx) => (
              <div key={dayIdx} className="border rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <h5 className="font-medium text-sm">День {dayIdx + 1}</h5>
                  <select
                    onChange={(e) => {
                      const value = e.target.value;
                      if (!value) return;
                      
                      if (value === 'exercise') {
                        setCurrentDayIndex(dayIdx);
                        setShowExerciseLibrary(true);
                      } else if (value === 'superset') {
                        const newSchedule = [...editedProgram.schedule];
                        if (!newSchedule[dayIdx]) {
                          newSchedule[dayIdx] = { dayNumber: dayIdx + 1, exercises: [], supersets: [] };
                        }
                        if (!newSchedule[dayIdx].supersets) newSchedule[dayIdx].supersets = [];
                        newSchedule[dayIdx].supersets.push({ exercises: [] });
                        setEditedProgram({...editedProgram, schedule: newSchedule});
                      }
                      e.target.value = '';
                    }}
                    className="text-xs px-2 py-1 border rounded bg-white">
                    <option value="">+ Добавить...</option>
                    <option value="exercise">Обычное упражнение</option>
                    <option value="superset">Суперсет (группа)</option>
                  </select>
                </div>
                {editedProgram.schedule[dayIdx]?.groups?.map((group, groupIdx) => (
                  <ExerciseGroupEditor
                    key={`group-${groupIdx}`}
                    group={group}
                    dayIndex={dayIdx}
                    onUpdate={(updatedGroup) => {
                      const newSchedule = [...editedProgram.schedule];
                      newSchedule[dayIdx].groups[groupIdx] = updatedGroup;
                      setEditedProgram({...editedProgram, schedule: newSchedule});
                    }}
                    onRemove={() => {
                      const newSchedule = [...editedProgram.schedule];
                      newSchedule[dayIdx].groups.splice(groupIdx, 1);
                      setEditedProgram({...editedProgram, schedule: newSchedule});
                    }}
                  />
                ))}
                {editedProgram.schedule[dayIdx]?.exercises?.map((ex, exIdx) => (
                  <div key={exIdx} className="flex items-center justify-between p-2 bg-[var(--bg-light)] rounded mb-2">
                    <div className="flex-1">
                      <div className="font-medium text-xs">{ex.name}</div>
                      <div className="text-xs text-[var(--text-secondary)]">
                        {ex.sets} × {ex.reps} {ex.weight && `• ${ex.weight} кг`}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeExercise(dayIdx, exIdx)}
                      className="text-red-500 ml-2">
                      <div className="icon-trash-2 text-base"></div>
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <button onClick={handleSave} className="btn-primary w-full">
          Сохранить изменения
        </button>

        {showExerciseLibrary && (
          <ExerciseLibrary 
            onSelectExercise={(exercise) => {
              setSelectedExercise(exercise);
              setShowExerciseLibrary(false);
            }}
            onClose={() => setShowExerciseLibrary(false)}
          />
        )}

        {selectedExercise && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedExercise(null)}>
            <div className="card max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <h4 className="font-bold mb-3 text-sm">{selectedExercise.Name}</h4>
              <div className="space-y-2 mb-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium mb-1">Подходы</label>
                    <input type="number" min="1" value={exerciseParams.sets} onChange={(e) => setExerciseParams({...exerciseParams, sets: e.target.value})} className="w-full px-2 py-1 border rounded text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Повторения</label>
                    <input type="number" min="1" value={exerciseParams.reps} onChange={(e) => setExerciseParams({...exerciseParams, reps: e.target.value})} className="w-full px-2 py-1 border rounded text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium mb-1">Вес (кг)</label>
                    <input type="number" min="0" step="0.5" value={exerciseParams.weight} onChange={(e) => setExerciseParams({...exerciseParams, weight: e.target.value})} placeholder="Опционально" className="w-full px-2 py-1 border rounded text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Отдых (сек)</label>
                    <input type="number" min="0" step="10" value={exerciseParams.restTime} onChange={(e) => setExerciseParams({...exerciseParams, restTime: e.target.value})} className="w-full px-2 py-1 border rounded text-sm" />
                  </div>
                </div>
              </div>
              <button onClick={addExerciseToDay} className="btn-primary w-full text-sm">
                Добавить
              </button>
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('ProgramEditor error:', error);
    return null;
  }
}
