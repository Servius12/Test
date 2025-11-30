function ProgramAssignment({ onClose }) {
  try {
    const [clients, setClients] = React.useState([]);
    const [program, setProgram] = React.useState({
      name: '',
      clientId: '',
      weeksCount: 4,
      daysPerWeek: 3,
      schedule: []
    });
    const [showExerciseLibrary, setShowExerciseLibrary] = React.useState(false);
    const [showExercisePreview, setShowExercisePreview] = React.useState(null);
    const [currentDay, setCurrentDay] = React.useState(null);
    const [currentGroupIdx, setCurrentGroupIdx] = React.useState(null);
    const [selectedExercise, setSelectedExercise] = React.useState(null);
    const [exerciseParams, setExerciseParams] = React.useState({
      sets: '3',
      reps: '10',
      weight: '',
      restTime: '60'
    });

    React.useEffect(() => {
      loadClients();
    }, []);

    const loadClients = async () => {
      try {
        const result = await trickleListObjects('client_profile', 50);
        setClients(result.items);
      } catch (error) {
        console.error('Error loading clients:', error);
      }
    };

    const selectExercise = (exercise) => {
      setSelectedExercise(exercise);
      setShowExerciseLibrary(false);
      
      // Check if adding to dropset group
      if (currentGroupIdx !== null && program.schedule[currentDay]?.groups?.[currentGroupIdx]?.type === 'dropset') {
        setExerciseParams({
          sets: '3',
          reps: '10',
          weight: '',
          restTime: '60',
          dropsets: [{weight: '', reps: ''}, {weight: '', reps: ''}, {weight: '', reps: ''}]
        });
      } else {
        setExerciseParams({
          sets: '3',
          reps: '10',
          weight: '',
          restTime: '60'
        });
      }
    };

    const addExerciseToDay = () => {
      if (!selectedExercise) return;
      
      const newSchedule = [...program.schedule];
      if (!newSchedule[currentDay]) {
        newSchedule[currentDay] = { dayNumber: currentDay + 1, exercises: [], groups: [] };
      }
      
      const newExercise = {
        name: selectedExercise.Name,
        muscleGroup: selectedExercise.MuscleGroup,
        sets: exerciseParams.sets,
        reps: exerciseParams.reps,
        weight: exerciseParams.weight || '',
        restTime: exerciseParams.restTime || '60',
        description: selectedExercise.Description || '',
        videoUrl: selectedExercise.VideoUrl || ''
      };
      
      // Add dropset data if present
      if (exerciseParams.dropsets && exerciseParams.dropsets.length > 0) {
        newExercise.dropsets = exerciseParams.dropsets;
      }
      
      // Add to group or regular exercises
      if (currentGroupIdx !== null) {
        if (!newSchedule[currentDay].groups) newSchedule[currentDay].groups = [];
        newSchedule[currentDay].groups[currentGroupIdx].exercises.push(newExercise);
      } else {
        if (!newSchedule[currentDay].exercises) newSchedule[currentDay].exercises = [];
        newSchedule[currentDay].exercises.push(newExercise);
      }
      
      setProgram({...program, schedule: newSchedule});
      setSelectedExercise(null);
      setCurrentGroupIdx(null);
      setExerciseParams({ sets: '3', reps: '10', weight: '', restTime: '60' });
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        await trickleCreateObject('workout_program', program);
        alert('Программа назначена!');
        onClose();
      } catch (error) {
        console.error('Error creating program:', error);
        alert('Ошибка при создании программы');
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose} data-name="program-assignment" data-file="components/ProgramAssignment.js">
        <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold">Назначить программу</h2>
            <button onClick={onClose} className="text-2xl text-[var(--text-secondary)]">×</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Название программы</label>
              <input 
                type="text"
                value={program.name}
                onChange={(e) => setProgram({...program, name: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Выберите клиента</label>
              <select
                value={program.clientId}
                onChange={(e) => setProgram({...program, clientId: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg"
                required>
                <option value="">-- Выберите клиента --</option>
                {clients.map(client => (
                  <option key={client.objectId} value={client.objectId}>
                    {client.objectData.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Недель</label>
                <input 
                  type="number"
                  min="1"
                  max="52"
                  value={program.weeksCount}
                  onChange={(e) => setProgram({...program, weeksCount: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Дней в неделю</label>
                <input 
                  type="number"
                  min="1"
                  max="7"
                  value={program.daysPerWeek}
                  onChange={(e) => setProgram({...program, daysPerWeek: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-bold mb-3">Расписание тренировок</h3>
              <div className="space-y-3">
                {Array.from({length: program.daysPerWeek}).map((_, dayIdx) => {
                  return (
                    <div key={dayIdx} className="border rounded-lg p-3">
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">День {dayIdx + 1}</h4>
                        <select
                          onChange={(e) => {
                            const value = e.target.value;
                            if (!value) return;
                            
                            const newSchedule = [...program.schedule];
                            if (!newSchedule[dayIdx]) {
                              newSchedule[dayIdx] = { dayNumber: dayIdx + 1, exercises: [], groups: [] };
                            }
                            if (!newSchedule[dayIdx].groups) newSchedule[dayIdx].groups = [];
                            
                            if (value === 'exercise') {
                              setCurrentDay(dayIdx);
                              setCurrentSuperset(null);
                              setShowExerciseLibrary(true);
                            } else if (value === 'superset') {
                              newSchedule[dayIdx].groups.push({ type: 'superset', exercises: [] });
                              setProgram({...program, schedule: newSchedule});
                            } else if (value === 'dropset') {
                              newSchedule[dayIdx].groups.push({ type: 'dropset', exercises: [] });
                              setProgram({...program, schedule: newSchedule});
                            } else if (value === 'circuit') {
                              newSchedule[dayIdx].groups.push({ type: 'circuit', rounds: 3, exercises: [] });
                              setProgram({...program, schedule: newSchedule});
                            } else if (value === 'amrap') {
                              newSchedule[dayIdx].groups.push({ type: 'amrap', duration: 10, exercises: [] });
                              setProgram({...program, schedule: newSchedule});
                            } else if (value === 'emom') {
                              newSchedule[dayIdx].groups.push({ type: 'emom', duration: 10, exercises: [] });
                              setProgram({...program, schedule: newSchedule});
                            }
                            e.target.value = '';
                          }}
                          className="text-xs px-2 py-1 border rounded bg-white">
                          <option value="">+ Добавить...</option>
                          <option value="exercise">Обычное упражнение</option>
                          <option value="superset">Суперсет</option>
                          <option value="dropset">Дропсет</option>
                          <option value="circuit">Круговая</option>
                          <option value="amrap">AMRAP</option>
                          <option value="emom">EMOM</option>
                        </select>
                      </div>
                    </div>
                    
                    {program.schedule[dayIdx]?.groups?.map((group, groupIdx) => (
                      <ExerciseGroupEditor
                        key={`group-${groupIdx}`}
                        group={group}
                        dayIndex={dayIdx}
                        onUpdate={(updatedGroup) => {
                          const newSchedule = [...program.schedule];
                          newSchedule[dayIdx].groups[groupIdx] = updatedGroup;
                          setProgram({...program, schedule: newSchedule});
                        }}
                        onRemove={() => {
                          const newSchedule = [...program.schedule];
                          newSchedule[dayIdx].groups.splice(groupIdx, 1);
                          setProgram({...program, schedule: newSchedule});
                        }}
                        onAddExercise={() => {
                          setCurrentDay(dayIdx);
                          setCurrentGroupIdx(groupIdx);
                          setShowExerciseLibrary(true);
                        }}
                      />
                    ))}
                    
                    {program.schedule[dayIdx]?.exercises?.map((ex, exIdx) => (
                      <div key={exIdx} className="flex items-center gap-2 p-2 bg-[var(--bg-light)] rounded mb-2">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{ex.name}</div>
                          <div className="text-sm text-[var(--text-secondary)]">
                            {ex.sets} подходов × {ex.reps} повторений
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowExercisePreview(ex)}
                          className="text-[var(--primary-color)]">
                          <div className="icon-eye text-lg"></div>
                        </button>
                      </div>
                    ))}

                    </div>
                  );
                })}
              </div>
            </div>

            <button type="submit" className="btn-primary w-full">
              Назначить программу
            </button>
          </form>

          {showExerciseLibrary && (
            <ExerciseLibrary 
              onSelectExercise={selectExercise}
              onClose={() => setShowExerciseLibrary(false)}
            />
          )}

          {selectedExercise && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedExercise(null)}>
              <div className="card max-w-md w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold">{selectedExercise.Name}</h3>
                  <button onClick={() => setSelectedExercise(null)} className="text-2xl text-[var(--text-secondary)]">×</button>
                </div>

                <div className="space-y-3 mb-4">
                  {/* Show dropset fields if in dropset group */}
                  {currentGroupIdx !== null && program.schedule[currentDay]?.groups?.[currentGroupIdx]?.type === 'dropset' ? (
                    <div>
                      <p className="text-sm font-medium mb-2">Дропсет (снижение веса без отдыха):</p>
                      {(exerciseParams.dropsets || []).map((drop, idx) => (
                        <div key={idx} className="grid grid-cols-2 gap-2 mb-2">
                          <input 
                            type="number"
                            placeholder={`Вес ${idx + 1}`}
                            value={drop.weight}
                            onChange={(e) => {
                              const newDropsets = [...(exerciseParams.dropsets || [])];
                              newDropsets[idx].weight = e.target.value;
                              setExerciseParams({...exerciseParams, dropsets: newDropsets});
                            }}
                            className="px-2 py-1 border rounded text-sm"
                          />
                          <input 
                            type="number"
                            placeholder={`Повторы ${idx + 1}`}
                            value={drop.reps}
                            onChange={(e) => {
                              const newDropsets = [...(exerciseParams.dropsets || [])];
                              newDropsets[idx].reps = e.target.value;
                              setExerciseParams({...exerciseParams, dropsets: newDropsets});
                            }}
                            className="px-2 py-1 border rounded text-sm"
                          />
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const newDropsets = [...(exerciseParams.dropsets || []), {weight: '', reps: ''}];
                          setExerciseParams({...exerciseParams, dropsets: newDropsets});
                        }}
                        className="w-full text-xs px-2 py-1 border-2 border-dashed border-gray-300 rounded">
                        + Добавить снижение
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Подходы</label>
                          <input 
                            type="number"
                            min="1"
                            value={exerciseParams.sets}
                            onChange={(e) => setExerciseParams({...exerciseParams, sets: e.target.value})}
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Повторения</label>
                          <input 
                            type="number"
                            min="1"
                            value={exerciseParams.reps}
                            onChange={(e) => setExerciseParams({...exerciseParams, reps: e.target.value})}
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Вес (кг)</label>
                          <input 
                            type="number"
                            min="0"
                            step="0.5"
                            value={exerciseParams.weight}
                            onChange={(e) => setExerciseParams({...exerciseParams, weight: e.target.value})}
                            placeholder="Опционально"
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Отдых (сек)</label>
                          <input 
                            type="number"
                            min="0"
                            step="10"
                            value={exerciseParams.restTime}
                            onChange={(e) => setExerciseParams({...exerciseParams, restTime: e.target.value})}
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <button onClick={addExerciseToDay} className="btn-primary w-full">
                  Добавить упражнение
                </button>
              </div>
            </div>
          )}

          {showExercisePreview && (
            <ExercisePreview
              exercise={showExercisePreview}
              onClose={() => setShowExercisePreview(null)}
            />
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('ProgramAssignment component error:', error);
    return null;
  }
}
