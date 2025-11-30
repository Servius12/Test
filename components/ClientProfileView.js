function ClientProfileView({ client, onClose }) {
  try {
    const [measurements, setMeasurements] = React.useState([]);
    const [exerciseLogs, setExerciseLogs] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [activeTab, setActiveTab] = React.useState('profile');
    const [programs, setPrograms] = React.useState([]);
    const [completedPrograms, setCompletedPrograms] = React.useState([]);
    const [showAssignProgram, setShowAssignProgram] = React.useState(false);
    const [editingProgram, setEditingProgram] = React.useState(null);

    React.useEffect(() => {
      loadData();
    }, []);

    const handleEditProgram = (program) => {
      setEditingProgram(program);
    };

    const handleSaveProgram = async (updatedData) => {
      try {
        await trickleUpdateObject('workout_program', editingProgram.objectId, updatedData);
        alert('Программа обновлена!');
        setEditingProgram(null);
        loadData();
      } catch (error) {
        console.error('Error updating program:', error);
        alert('Ошибка при обновлении программы');
      }
    };

    const loadData = async () => {
      try {
        const [measurementsResult, logsResult, programsResult, completedResult] = await Promise.all([
          trickleListObjects(`measurement:${client.objectId}`, 20, true),
          trickleListObjects('exercise_log', 100, true),
          trickleListObjects('workout_program', 100, true),
          trickleListObjects('completed_program', 50, true)
        ]);
        setMeasurements(measurementsResult.items);
        setExerciseLogs(logsResult.items);
        
        const clientPrograms = programsResult.items.filter(p => p.objectData.clientId === client.objectId);
        setPrograms(clientPrograms);
        setCompletedPrograms(completedResult.items);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    const profile = client.objectData;

    const totalWorkouts = exerciseLogs.length;
    const thisWeekWorkouts = exerciseLogs.filter(log => {
      const logDate = new Date(log.objectData.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return logDate >= weekAgo;
    }).length;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 overflow-y-auto" onClick={onClose}>
        <div className="card w-full max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl sm:max-w-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg font-bold">{profile.name}</h2>
            <button onClick={onClose} className="text-3xl text-[var(--text-secondary)] leading-none">×</button>
          </div>

          <div className="flex gap-2 mb-4 overflow-x-auto">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap ${activeTab === 'profile' ? 'bg-[var(--primary-color)] text-white' : 'bg-gray-100'}`}>
              Профиль
            </button>
            <button 
              onClick={() => setActiveTab('programs')}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap ${activeTab === 'programs' ? 'bg-[var(--primary-color)] text-white' : 'bg-gray-100'}`}>
              Программы
            </button>
            <button 
              onClick={() => setActiveTab('statistics')}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap ${activeTab === 'statistics' ? 'bg-[var(--primary-color)] text-white' : 'bg-gray-100'}`}>
              Статистика
            </button>
          </div>

          {activeTab === 'programs' ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm">Текущие программы</h3>
              <button 
                onClick={() => setShowAssignProgram(true)}
                className="px-3 py-1 bg-[var(--primary-color)] text-white rounded-lg text-xs">
                + Назначить
              </button>
            </div>
            
            {programs.length === 0 ? (
              <div className="text-center py-6 text-sm text-[var(--text-secondary)]">
                Нет активных программ
              </div>
            ) : (
              <div className="space-y-3">
                {programs.map((program) => (
                  <div key={program.objectId} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-sm">{program.objectData.name}</h4>
                        <p className="text-xs text-[var(--text-secondary)]">
                          {program.objectData.weeksCount} недель • {program.objectData.daysPerWeek} дней
                        </p>
                      </div>
                      <button 
                        onClick={() => handleEditProgram(program)}
                        className="text-[var(--primary-color)] text-xs active:opacity-70">
                        Редактировать
                      </button>
                    </div>
                    <div className="text-xs text-[var(--text-secondary)]">
                      Упражнений: {program.objectData.schedule ? program.objectData.schedule.reduce((sum, day) => sum + ((day && day.exercises) ? day.exercises.length : 0), 0) : 0}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t pt-4">
              <h3 className="font-bold text-sm mb-3">Завершенные программы</h3>
              {completedPrograms.length === 0 ? (
                <div className="text-center py-4 text-sm text-[var(--text-secondary)]">
                  Нет завершенных программ
                </div>
              ) : (
                <div className="space-y-2">
                  {completedPrograms.map((program) => (
                    <div key={program.objectId} className="p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="icon-check-circle text-sm text-green-600"></div>
                        <h4 className="font-medium text-sm">{program.objectData.programName}</h4>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Завершено: {new Date(program.objectData.completedDate).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          ) : activeTab === 'profile' ? (
          <div className="space-y-4">
            <div className="p-3 bg-[var(--bg-light)] rounded-lg">
              <h3 className="font-bold text-sm mb-2 text-[var(--primary-color)]">Основная информация</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-[var(--text-secondary)]">Возраст:</span> {profile.age} лет</div>
                <div><span className="text-[var(--text-secondary)]">Пол:</span> {profile.gender === 'male' ? 'М' : 'Ж'}</div>
                <div><span className="text-[var(--text-secondary)]">Вес:</span> {profile.weight} кг</div>
                <div><span className="text-[var(--text-secondary)]">Рост:</span> {profile.height} см</div>
                {profile.targetWeight && <div><span className="text-[var(--text-secondary)]">Цель:</span> {profile.targetWeight} кг</div>}
              </div>
            </div>

            <div className="p-3 bg-[var(--bg-light)] rounded-lg">
              <h3 className="font-bold text-sm mb-2 text-[var(--primary-color)]">Фитнес цели</h3>
              <div className="space-y-1 text-sm">
                <div><span className="text-[var(--text-secondary)]">Цель:</span> {profile.goal}</div>
                <div><span className="text-[var(--text-secondary)]">Опыт:</span> {profile.experience}</div>
                <div><span className="text-[var(--text-secondary)]">Дней в неделю:</span> {profile.trainingDays}</div>
                <div><span className="text-[var(--text-secondary)]">Активность:</span> {profile.activityLevel}</div>
              </div>
            </div>

            {(profile.healthIssues || profile.injuries || profile.medications) && (
              <div className="p-3 bg-red-50 rounded-lg">
                <h3 className="font-bold text-sm mb-2 text-red-600">⚠️ Здоровье</h3>
                <div className="space-y-1 text-sm">
                  {profile.healthIssues && <div><span className="text-[var(--text-secondary)]">Заболевания:</span> {profile.healthIssues}</div>}
                  {profile.injuries && <div><span className="text-[var(--text-secondary)]">Травмы:</span> {profile.injuries}</div>}
                  {profile.medications && <div><span className="text-[var(--text-secondary)]">Лекарства:</span> {profile.medications}</div>}
                </div>
              </div>
            )}

            <div className="p-3 bg-[var(--bg-light)] rounded-lg">
              <h3 className="font-bold text-sm mb-2 text-[var(--primary-color)]">Образ жизни</h3>
              <div className="space-y-1 text-sm">
                <div><span className="text-[var(--text-secondary)]">Сон:</span> {profile.sleepHours} часов</div>
                <div><span className="text-[var(--text-secondary)]">Стресс:</span> {profile.stressLevel}</div>
                <div><span className="text-[var(--text-secondary)]">Питание:</span> {profile.nutrition}</div>
                {profile.supplements && <div><span className="text-[var(--text-secondary)]">Добавки:</span> {profile.supplements}</div>}
              </div>
            </div>

            {profile.motivation && (
              <div className="p-3 bg-[var(--bg-light)] rounded-lg">
                <h3 className="font-bold text-sm mb-2 text-[var(--primary-color)]">Мотивация</h3>
                <p className="text-sm text-[var(--text-secondary)]">{profile.motivation}</p>
              </div>
            )}

            <div>
              <h3 className="font-bold text-sm mb-2">История измерений</h3>
              {loading ? (
                <p className="text-sm text-center py-4">Загрузка...</p>
              ) : measurements.length === 0 ? (
                <p className="text-sm text-center py-4 text-[var(--text-secondary)]">Пока нет измерений</p>
              ) : (
                <div className="space-y-2">
                  {measurements.map((m) => (
                    <div key={m.objectId} className="p-3 border rounded-lg">
                      <div className="text-xs text-[var(--text-secondary)] mb-1">
                        {new Date(m.objectData.date).toLocaleDateString('ru-RU')}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Вес: {m.objectData.weight} кг</div>
                        {m.objectData.bodyFat && <div>Жир: {m.objectData.bodyFat}%</div>}
                        {m.objectData.muscleMass && <div>Мышцы: {m.objectData.muscleMass} кг</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          ) : (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">Загрузка...</div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <div className="icon-activity text-lg text-blue-600"></div>
                      </div>
                      <div className="text-xs text-[var(--text-secondary)]">Всего<br/>тренировок</div>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">{totalWorkouts}</div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <div className="icon-calendar text-lg text-green-600"></div>
                      </div>
                      <div className="text-xs text-[var(--text-secondary)]">За последние<br/>7 дней</div>
                    </div>
                    <div className="text-2xl font-bold text-green-600">{thisWeekWorkouts}</div>
                  </div>
                </div>

                <div className="p-4 bg-[var(--bg-light)] rounded-lg">
                  <h3 className="font-bold text-sm mb-3">Последние измерения</h3>
                  {measurements.length === 0 ? (
                    <p className="text-sm text-center py-4 text-[var(--text-secondary)]">Нет данных</p>
                  ) : (
                    <div className="space-y-2">
                      {measurements.slice(0, 5).map((m) => (
                        <div key={m.objectId} className="flex justify-between items-center p-2 bg-white rounded">
                          <div className="text-xs text-[var(--text-secondary)]">
                            {new Date(m.objectData.date).toLocaleDateString('ru-RU')}
                          </div>
                          <div className="font-medium text-sm">{m.objectData.weight} кг</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-4 bg-[var(--bg-light)] rounded-lg">
                  <h3 className="font-bold text-sm mb-3">Последние тренировки</h3>
                  {exerciseLogs.length === 0 ? (
                    <p className="text-sm text-center py-4 text-[var(--text-secondary)]">Нет данных</p>
                  ) : (
                    <div className="space-y-2">
                      {exerciseLogs.slice(0, 5).map((log) => (
                        <div key={log.objectId} className="p-2 bg-white rounded">
                          <div className="font-medium text-sm">{log.objectData.exerciseName}</div>
                          <div className="text-xs text-[var(--text-secondary)]">
                            {new Date(log.objectData.date).toLocaleDateString('ru-RU')}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          )}
        </div>
        
        {showAssignProgram && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowAssignProgram(false)}>
            <div className="card max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Назначить программу</h3>
                <button onClick={() => setShowAssignProgram(false)} className="text-3xl text-[var(--text-secondary)] leading-none">×</button>
              </div>
              <ProgramAssignment 
                clientId={client.objectId}
                onClose={() => {
                  setShowAssignProgram(false);
                  loadData();
                }}
              />
            </div>
          </div>
        )}

        {editingProgram && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setEditingProgram(null)}>
            <div className="card max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Редактировать программу</h3>
                <button onClick={() => setEditingProgram(null)} className="text-3xl text-[var(--text-secondary)] leading-none">×</button>
              </div>
              <ProgramEditor
                program={editingProgram.objectData}
                onClose={() => setEditingProgram(null)}
                onSave={handleSaveProgram}
              />
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('ClientProfileView error:', error);
    return null;
  }
}