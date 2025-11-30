function TemplateCreateForm({ onClose, trainers, currentTrainerId }) {
  try {
    const [template, setTemplate] = React.useState({
      name: '',
      weeksCount: 4,
      daysPerWeek: 3,
      schedule: [],
      isPublic: false,
      sharedWith: []
    });
    const [currentWorkoutType, setCurrentWorkoutType] = React.useState('standard');
    const [showExerciseLibrary, setShowExerciseLibrary] = React.useState(false);
    const [currentDay, setCurrentDay] = React.useState(null);
    const [selectedExercise, setSelectedExercise] = React.useState(null);
    const [exerciseParams, setExerciseParams] = React.useState({
      sets: '3', reps: '10', weight: '', restTime: '60'
    });

    const addExerciseToDay = () => {
      if (!selectedExercise) return;
      const newSchedule = [...template.schedule];
      if (!newSchedule[currentDay]) {
        newSchedule[currentDay] = { dayNumber: currentDay + 1, exercises: [] };
      }
      newSchedule[currentDay].exercises.push({
        name: selectedExercise.Name,
        muscleGroup: selectedExercise.MuscleGroup,
        sets: exerciseParams.sets,
        reps: exerciseParams.reps,
        weight: exerciseParams.weight,
        restTime: exerciseParams.restTime,
        description: selectedExercise.Description,
        videoUrl: selectedExercise.VideoUrl
      });
      setTemplate({...template, schedule: newSchedule});
      setSelectedExercise(null);
      setExerciseParams({ sets: '3', reps: '10', weight: '', restTime: '60' });
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        await trickleCreateObject('program_template', {
          Name: template.name,
          CreatorId: currentTrainerId,
          WeeksCount: template.weeksCount,
          DaysPerWeek: template.daysPerWeek,
          Schedule: template.schedule,
          IsPublic: template.isPublic,
          SharedWith: template.sharedWith,
          CreatedAt: new Date().toISOString()
        });
        alert('Шаблон создан!');
        onClose();
      } catch (error) {
        console.error('Error creating template:', error);
        alert('Ошибка при создании шаблона');
      }
    };

    const toggleTrainer = (trainerId) => {
      const newShared = template.sharedWith.includes(trainerId)
        ? template.sharedWith.filter(id => id !== trainerId)
        : [...template.sharedWith, trainerId];
      setTemplate({...template, sharedWith: newShared});
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
        <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold">Создать шаблон</h3>
            <button onClick={onClose} className="text-3xl text-[var(--text-secondary)] leading-none">×</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Название *</label>
              <input 
                type="text"
                value={template.name}
                onChange={(e) => setTemplate({...template, name: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-2">Недель *</label>
                <input 
                  type="number"
                  min="1"
                  value={template.weeksCount}
                  onChange={(e) => setTemplate({...template, weeksCount: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Дней *</label>
                <input 
                  type="number"
                  min="1"
                  max="7"
                  value={template.daysPerWeek}
                  onChange={(e) => setTemplate({...template, daysPerWeek: parseInt(e.target.value)})}
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
                {Array.from({length: template.daysPerWeek}).map((_, dayIdx) => (
                  <div key={dayIdx} className="border rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="font-medium text-sm">День {dayIdx + 1}</h5>
                      <select
                        onChange={(e) => {
                          const value = e.target.value;
                          if (!value) return;
                          
                          if (value === 'exercise') {
                            setCurrentDay(dayIdx);
                            setShowExerciseLibrary(true);
                          } else if (value === 'superset') {
                            const newSchedule = [...template.schedule];
                            if (!newSchedule[dayIdx]) {
                              newSchedule[dayIdx] = { dayNumber: dayIdx + 1, exercises: [], supersets: [] };
                            }
                            if (!newSchedule[dayIdx].supersets) newSchedule[dayIdx].supersets = [];
                            newSchedule[dayIdx].supersets.push({ exercises: [] });
                            setTemplate({...template, schedule: newSchedule});
                          }
                          e.target.value = '';
                        }}
                        className="text-xs px-2 py-1 border rounded bg-white">
                        <option value="">+ Добавить...</option>
                        <option value="exercise">Обычное упражнение</option>
                        <option value="superset">Суперсет (группа)</option>
                      </select>
                    </div>
                    {template.schedule[dayIdx]?.groups?.map((group, groupIdx) => (
                      <ExerciseGroupEditor
                        key={`group-${groupIdx}`}
                        group={group}
                        onUpdate={(updatedGroup) => {
                          const newSchedule = [...template.schedule];
                          newSchedule[dayIdx].groups[groupIdx] = updatedGroup;
                          setTemplate({...template, schedule: newSchedule});
                        }}
                        onRemove={() => {
                          const newSchedule = [...template.schedule];
                          newSchedule[dayIdx].groups.splice(groupIdx, 1);
                          setTemplate({...template, schedule: newSchedule});
                        }}
                      />
                    ))}
                    {template.schedule[dayIdx]?.exercises?.map((ex, exIdx) => (
                      <div key={exIdx} className="flex items-center justify-between p-2 bg-[var(--bg-light)] rounded mb-2">
                        <div className="flex-1">
                          <div className="font-medium text-xs">{ex.name}</div>
                          <div className="text-xs text-[var(--text-secondary)]">
                            {ex.sets} × {ex.reps} {ex.weight && `• ${ex.weight} кг`} • Отдых: {ex.restTime}с
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newSchedule = [...template.schedule];
                            newSchedule[dayIdx].exercises.splice(exIdx, 1);
                            setTemplate({...template, schedule: newSchedule});
                          }}
                          className="text-red-500 ml-2">
                          <div className="icon-trash-2 text-base"></div>
                        </button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-3">
              <h4 className="font-bold text-sm mb-3">Доступ к шаблону</h4>
              <label className="flex items-center gap-2 mb-3">
                <input 
                  type="checkbox"
                  checked={template.isPublic}
                  onChange={(e) => setTemplate({...template, isPublic: e.target.checked})}
                />
                <span className="text-sm">Публичный (видят все тренеры)</span>
              </label>

              {!template.isPublic && (
                <div>
                  <p className="text-sm text-[var(--text-secondary)] mb-2">Выберите тренеров:</p>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {trainers.filter(t => t.objectId !== currentTrainerId).map((trainer) => (
                      <label key={trainer.objectId} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                        <input 
                          type="checkbox"
                          checked={template.sharedWith.includes(trainer.objectId)}
                          onChange={() => toggleTrainer(trainer.objectId)}
                        />
                        <span className="text-sm">{trainer.objectData.FirstName} {trainer.objectData.LastName}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button type="submit" className="btn-primary w-full">
              Создать шаблон
            </button>
          </form>

          {showExerciseLibrary && (
            <ExerciseLibrary 
              onSelectExercise={(ex) => {
                setSelectedExercise(ex);
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
                      <input 
                        type="number" 
                        min="1" 
                        value={exerciseParams.sets} 
                        onChange={(e) => setExerciseParams({...exerciseParams, sets: e.target.value})} 
                        className="w-full px-2 py-1 border rounded text-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Повторения</label>
                      <input 
                        type="number" 
                        min="1" 
                        value={exerciseParams.reps} 
                        onChange={(e) => setExerciseParams({...exerciseParams, reps: e.target.value})} 
                        className="w-full px-2 py-1 border rounded text-sm" 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium mb-1">Вес (кг)</label>
                      <input 
                        type="number" 
                        min="0" 
                        step="0.5" 
                        value={exerciseParams.weight} 
                        onChange={(e) => setExerciseParams({...exerciseParams, weight: e.target.value})} 
                        placeholder="Опционально" 
                        className="w-full px-2 py-1 border rounded text-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Отдых (сек)</label>
                      <input 
                        type="number" 
                        min="0" 
                        step="10" 
                        value={exerciseParams.restTime} 
                        onChange={(e) => setExerciseParams({...exerciseParams, restTime: e.target.value})} 
                        className="w-full px-2 py-1 border rounded text-sm" 
                      />
                    </div>
                  </div>
                </div>
                <button onClick={addExerciseToDay} className="btn-primary w-full text-sm">
                  Добавить упражнение
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('TemplateCreateForm error:', error);
    return null;
  }
}