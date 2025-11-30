function CompletedPrograms() {
  try {
    const [completedPrograms, setCompletedPrograms] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
      loadCompletedPrograms();
    }, []);

    const loadCompletedPrograms = async () => {
      try {
        const result = await trickleListObjects('completed_program', 50, true);
        setCompletedPrograms(result.items || []);
      } catch (error) {
        console.error('Error loading completed programs:', error);
      } finally {
        setLoading(false);
      }
    };

    if (loading) {
      return <div className="text-center py-8">Загрузка...</div>;
    }

    return (
      <div data-name="completed-programs" data-file="components/CompletedPrograms.js">
        <h2 className="text-xl font-bold mb-4">Завершенные Программы</h2>

        {completedPrograms.length === 0 ? (
          <div className="card text-center py-8">
            <div className="icon-check-circle text-4xl text-[var(--text-secondary)] mb-3"></div>
            <p className="text-sm text-[var(--text-secondary)]">
              Пока нет завершенных программ
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-2">
              Завершите первую программу тренировок!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {completedPrograms.map((program) => (
              <div key={program.objectId} className="card">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <div className="icon-check-circle text-xl text-green-600"></div>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">{program.objectData.programName}</h3>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Завершено: {new Date(program.objectData.completedDate).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-[var(--bg-light)] rounded">
                    <div className="text-lg font-bold text-[var(--primary-color)]">
                      {program.objectData.totalWorkouts}
                    </div>
                    <div className="text-xs text-[var(--text-secondary)]">Тренировок</div>
                  </div>
                  <div className="p-2 bg-[var(--bg-light)] rounded">
                    <div className="text-lg font-bold text-[var(--primary-color)]">
                      {program.objectData.weeksCompleted}
                    </div>
                    <div className="text-xs text-[var(--text-secondary)]">Недель</div>
                  </div>
                  <div className="p-2 bg-[var(--bg-light)] rounded">
                    <div className="text-lg font-bold text-[var(--primary-color)]">
                      {program.objectData.totalExercises}
                    </div>
                    <div className="text-xs text-[var(--text-secondary)]">Упражнений</div>
                  </div>
                </div>

                {program.objectData.achievements && program.objectData.achievements.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="text-xs text-[var(--text-secondary)] mb-2">Достижения:</div>
                    <div className="flex flex-wrap gap-1">
                      {program.objectData.achievements.map((achievement, idx) => (
                        <span key={idx} className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">
                          🏆 {achievement}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('CompletedPrograms component error:', error);
    return null;
  }
}