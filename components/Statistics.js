const ChartJS = window.Chart;

function Statistics() {
  try {
    const [logs, setLogs] = React.useState([]);
    const [measurements, setMeasurements] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const weightChartRef = React.useRef(null);
    const workoutChartRef = React.useRef(null);
    const [weightChart, setWeightChart] = React.useState(null);
    const [workoutChart, setWorkoutChart] = React.useState(null);

    React.useEffect(() => {
      loadData();
      return () => {
        if (weightChart) weightChart.destroy();
        if (workoutChart) workoutChart.destroy();
      };
    }, []);

    React.useEffect(() => {
      if (measurements.length > 0 && weightChartRef.current) {
        createWeightChart();
      }
      if (logs.length > 0 && workoutChartRef.current) {
        createWorkoutChart();
      }
    }, [measurements, logs]);

    const loadData = async () => {
      try {
        const [logsResult, measurementsResult] = await Promise.all([
          trickleListObjects('exercise_log', 100, true),
          trickleListObjects('measurement:client', 50, true)
        ]);
        setLogs(logsResult.items || []);
        setMeasurements(measurementsResult.items || []);
      } catch (error) {
        console.error('Error loading statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    const createWeightChart = () => {
      if (weightChart) weightChart.destroy();
      const ctx = weightChartRef.current.getContext('2d');
      const sortedData = [...measurements].reverse().slice(0, 10);
      
      const chart = new ChartJS(ctx, {
        type: 'line',
        data: {
          labels: sortedData.map(m => new Date(m.objectData.date).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' })),
          datasets: [{
            label: 'Вес (кг)',
            data: sortedData.map(m => parseFloat(m.objectData.weight)),
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: false }
          }
        }
      });
      setWeightChart(chart);
    };

    const createWorkoutChart = () => {
      if (workoutChart) workoutChart.destroy();
      const ctx = workoutChartRef.current.getContext('2d');
      
      const last7Days = Array.from({length: 7}, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
      });
      
      const workoutCounts = last7Days.map(day => 
        logs.filter(log => log.objectData.date.startsWith(day)).length
      );

      const chart = new ChartJS(ctx, {
        type: 'bar',
        data: {
          labels: last7Days.map(day => new Date(day).toLocaleDateString('ru-RU', { weekday: 'short' })),
          datasets: [{
            label: 'Упражнений',
            data: workoutCounts,
            backgroundColor: '#6366f1'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1 } }
          }
        }
      });
      setWorkoutChart(chart);
    };

    const totalWorkouts = logs.length;
    const thisWeekWorkouts = logs.filter(log => {
      const logDate = new Date(log.objectData.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return logDate >= weekAgo;
    }).length;

    const latestWeight = measurements[0]?.objectData.weight;
    const previousWeight = measurements[1]?.objectData.weight;
    const weightChange = latestWeight && previousWeight ? (latestWeight - previousWeight).toFixed(1) : null;

    if (loading) {
      return <div className="text-center py-8">Загрузка...</div>;
    }

    return (
      <div data-name="statistics" data-file="components/Statistics.js">
        <h2 className="text-xl font-bold mb-4">Моя Статистика</h2>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="card">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <div className="icon-activity text-lg text-blue-600"></div>
              </div>
              <div className="text-xs text-[var(--text-secondary)]">Всего<br/>тренировок</div>
            </div>
            <div className="text-2xl font-bold">{totalWorkouts}</div>
          </div>

          <div className="card">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <div className="icon-calendar text-lg text-green-600"></div>
              </div>
              <div className="text-xs text-[var(--text-secondary)]">За последние<br/>7 дней</div>
            </div>
            <div className="text-2xl font-bold">{thisWeekWorkouts}</div>
          </div>
        </div>

        {measurements.length > 0 && (
          <div className="card mb-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold">Динамика веса</h3>
              {weightChange && (
                <span className={`text-sm ${parseFloat(weightChange) < 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {parseFloat(weightChange) > 0 ? '+' : ''}{weightChange} кг
                </span>
              )}
            </div>
            <div style={{height: '200px'}}>
              <canvas ref={weightChartRef}></canvas>
            </div>
          </div>
        )}

        {logs.length > 0 && (
          <div className="card mb-4">
            <h3 className="font-bold mb-3">Активность за неделю</h3>
            <div style={{height: '200px'}}>
              <canvas ref={workoutChartRef}></canvas>
            </div>
          </div>
        )}

        {logs.length === 0 && measurements.length === 0 && (
          <div className="card text-center py-8">
            <div className="icon-chart-bar text-4xl text-[var(--text-secondary)] mb-3"></div>
            <p className="text-sm text-[var(--text-secondary)]">
              Начните тренироваться, чтобы увидеть статистику
            </p>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('Statistics component error:', error);
    return null;
  }
}