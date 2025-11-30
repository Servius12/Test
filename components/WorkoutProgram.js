function WorkoutProgram({ onExerciseClick, onFeedbackClick }) {
  try {
    const [workouts, setWorkouts] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [selectedDay, setSelectedDay] = React.useState(null);
    const [showExercises, setShowExercises] = React.useState(false);
    const [showTemplates, setShowTemplates] = React.useState(false);

    React.useEffect(() => {
      loadWorkouts();
    }, []);

    const loadWorkouts = async () => {
      try {
        const result = await trickleListObjects('workout_program', 10);
        setWorkouts(result.items);
      } catch (error) {
        console.error('Error loading workouts:', error);
      } finally {
        setLoading(false);
      }
    };

    const handleDayClick = (day, workoutId) => {
      setSelectedDay({ day, workoutId, exercises: day.exercises || [] });
      setShowExercises(true);
    };

    const handleExerciseClick = (exercise, exerciseIndex) => {
      const exercises = selectedDay.exercises;
      const isLastExercise = exerciseIndex === exercises.length - 1;
      
      const exerciseData = {
        name: exercise.name,
        description: exercise.description || '',
        videoUrl: exercise.videoUrl || '',
        sets: exercise.sets,
        reps: exercise.reps,
        weight: exercise.weight || '',
        restTime: exercise.restTime || '60',
        muscleGroup: exercise.muscleGroup || ''
      };
      
      const nextHandler = !isLastExercise ? () => {
        const nextExercise = exercises[exerciseIndex + 1];
        handleExerciseClick(nextExercise, exerciseIndex + 1);
      } : null;
      
      onExerciseClick(exerciseData, nextHandler, isLastExercise);
    };

    const handleCompleteProgram = async (workout) => {
      if (!confirm('Завершить эту программу?')) return;
      
      try {
        const totalExercises = workout.objectData.schedule ? 
          workout.objectData.schedule.reduce((sum, day) => 
            sum + ((day && day.exercises) ? day.exercises.length : 0), 0) : 0;
        
        await trickleCreateObject('completed_program', {
          programName: workout.objectData.name,
          completedDate: new Date().toISOString(),
          totalWorkouts: workout.objectData.daysPerWeek * workout.objectData.weeksCount,
          weeksCompleted: workout.objectData.weeksCount,
          totalExercises: totalExercises,
          achievements: ['Завершил программу', 'Стабильность']
        });
        
        await trickleDeleteObject('workout_program', workout.objectId);
        alert('Поздравляем с завершением программы! 🎉');
        loadWorkouts();
      } catch (error) {
        console.error('Error completing program:', error);
        alert('Ошибка при завершении программы');
      }
    };

    const handleRestartProgram = async (template) => {
      try {
        await trickleCreateObject('workout_program', {
          name: template.name,
          clientId: 'self',
          weeksCount: template.weeksCount,
          daysPerWeek: template.daysPerWeek,
          schedule: template.schedule
        });
        alert('Программа добавлена!');
        setShowTemplates(false);
        loadWorkouts();
      } catch (error) {
        console.error('Error restarting program:', error);
        alert('Ошибка при добавлении программы');
      }
    };

    if (loading) {
      return <div className="text-center py-8">Загрузка...</div>;
    }

    return (
      <div data-name="workout-program" data-file="components/WorkoutProgram.js">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Моя Программа</h2>
          <div className="flex gap-2">
            <button onClick={() => setShowTemplates(true)} className="btn-secondary text-sm">
              Шаблоны
            </button>
            <button onClick={onFeedbackClick} className="btn-secondary text-sm">
              Отзыв
            </button>
          </div>
        </div>

        {showExercises && selectedDay ? (
          <div className="card mb-4">
            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={() => setShowExercises(false)}
                className="flex items-center gap-2 text-[var(--primary-color)] active:opacity-70">
                <div className="icon-arrow-left text-lg"></div>
                <span className="font-medium text-sm">Назад</span>
              </button>
              <h3 className="text-lg font-bold">День {selectedDay.day.dayNumber}</h3>
              <div className="w-16"></div>
            </div>
            <div className="space-y-3">
              {selectedDay.day.groups?.map((group, groupIdx) => (
                <div key={`group-${groupIdx}`} className="border-2 border-[var(--primary-color)] rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="icon-zap text-sm text-[var(--primary-color)]"></div>
                    <span className="font-bold text-sm text-[var(--primary-color)]">
                      {group.type === 'superset' ? 'Суперсет' :
                       group.type === 'dropset' ? 'Дропсет' :
                       group.type === 'circuit' ? `Круговая (${group.rounds || 3} кругов)` :
                       group.type === 'amrap' ? `AMRAP (${group.duration || 10} мин)` :
                       group.type === 'emom' ? `EMOM (${group.duration || 10} раундов)` :
                       group.type === 'wod' ? 'WOD' : 'Группа'}
                    </span>
                  </div>
                  {group.exercises?.map((exercise, exIdx) => (
                    <div 
                      key={`group-ex-${exIdx}`}
                      onClick={() => handleExerciseClick(exercise, exIdx)}
                      className="p-2 bg-[var(--bg-light)] rounded mb-2 active:bg-[var(--secondary-color)] cursor-pointer">
                      <div className="font-medium text-sm">{exercise.name}</div>
                      <div className="text-xs text-[var(--text-secondary)]">
                        {exercise.sets} подходов × {exercise.reps} повторений
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              {selectedDay.exercises.map((exercise, idx) => (
                <div 
                  key={idx}
                  onClick={() => handleExerciseClick(exercise, idx)}
                  className="p-3 bg-[var(--bg-light)] rounded-lg active:bg-[var(--secondary-color)] cursor-pointer">
                  <div className="font-medium">{exercise.name}</div>
                  <div className="text-sm text-[var(--text-secondary)]">
                    {exercise.sets} подходов × {exercise.reps} повторений
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {workouts.length === 0 ? (
              <div className="card text-center py-8">
                <div className="icon-clipboard text-4xl text-[var(--text-secondary)] mb-3"></div>
                <p className="text-sm text-[var(--text-secondary)]">
                  Пока нет назначенных программ
                </p>
              </div>
            ) : (
              workouts.map((workout) => {
                const schedule = workout.objectData.schedule || [];
                return (
                  <div key={workout.objectId} className="card">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold mb-1">{workout.objectData.name}</h3>
                        <p className="text-xs text-[var(--text-secondary)]">
                          {workout.objectData.weeksCount} нед • {workout.objectData.daysPerWeek} дней
                        </p>
                      </div>
                      <button 
                        onClick={() => handleCompleteProgram(workout)}
                        className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium active:bg-green-200 whitespace-nowrap ml-2">
                        Завершить
                      </button>
                    </div>
                    <div className="space-y-2 mt-2">
                      {schedule.map((day, dayIdx) => {
                        const totalExercises = (day.exercises?.length || 0) + 
                          (day.groups?.reduce((sum, g) => sum + (g.exercises?.length || 0), 0) || 0);
                        return (
                          <div 
                            key={dayIdx}
                            onClick={() => handleDayClick(day, workout.objectId)}
                            className="border-l-4 border-[var(--primary-color)] pl-2 p-2 bg-[var(--bg-light)] rounded-lg active:bg-[var(--secondary-color)] cursor-pointer touch-manipulation">
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-sm">День {day.dayNumber}</h4>
                                <p className="text-xs text-[var(--text-secondary)]">
                                  {totalExercises} упр.
                                  {day.groups && day.groups.length > 0 && ` • ${day.groups.length} гр.`}
                                </p>
                              </div>
                              <div className="icon-chevron-right text-base text-[var(--primary-color)]"></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {showTemplates && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowTemplates(false)}>
            <div className="card max-w-md w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Выбрать программу</h3>
                <button onClick={() => setShowTemplates(false)} className="text-3xl text-[var(--text-secondary)] leading-none">×</button>
              </div>
              <TemplateProgramsList onSelectTemplate={handleRestartProgram} />
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('WorkoutProgram component error:', error);
    return null;
  }
}