function MeasurementHistory() {
  try {
    const [measurements, setMeasurements] = React.useState([]);
    const [showForm, setShowForm] = React.useState(false);
    const [loading, setLoading] = React.useState(true);
    const [formData, setFormData] = React.useState({
      weight: '',
      bodyFat: '',
      muscleMass: '',
      chest: '',
      waist: '',
      hips: '',
      arms: '',
      legs: '',
      notes: ''
    });

    React.useEffect(() => {
      loadMeasurements();
    }, []);

    const loadMeasurements = async () => {
      try {
        const result = await trickleListObjects('measurement:client', 50, true);
        setMeasurements(result.items);
      } catch (error) {
        console.error('Error loading measurements:', error);
      } finally {
        setLoading(false);
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        await trickleCreateObject('measurement:client', {
          ...formData,
          date: new Date().toISOString()
        });
        setFormData({
          weight: '', bodyFat: '', muscleMass: '',
          chest: '', waist: '', hips: '', arms: '', legs: '', notes: ''
        });
        setShowForm(false);
        loadMeasurements();
      } catch (error) {
        console.error('Error saving measurement:', error);
        alert('Ошибка при сохранении измерения');
      }
    };

    return (
      <div data-name="measurement-history" data-file="components/MeasurementHistory.js">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Мои Измерения</h2>
          <button onClick={() => setShowForm(true)} className="btn-primary text-sm">
            <div className="icon-plus text-base inline-block mr-1"></div>
            Добавить
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">Загрузка...</div>
        ) : measurements.length === 0 ? (
          <div className="card text-center py-8">
            <div className="icon-activity text-4xl text-[var(--text-secondary)] mb-3"></div>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Начните отслеживать свой прогресс
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {measurements.map((m) => (
              <div key={m.objectId} className="card">
                <div className="flex justify-between items-start mb-3">
                  <div className="text-sm font-bold">
                    {new Date(m.objectData.date).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-2 bg-[var(--bg-light)] rounded">
                    <div className="text-xs text-[var(--text-secondary)]">Вес</div>
                    <div className="font-bold">{m.objectData.weight} кг</div>
                  </div>
                  {m.objectData.bodyFat && (
                    <div className="p-2 bg-[var(--bg-light)] rounded">
                      <div className="text-xs text-[var(--text-secondary)]">% жира</div>
                      <div className="font-bold">{m.objectData.bodyFat}%</div>
                    </div>
                  )}
                  {m.objectData.muscleMass && (
                    <div className="p-2 bg-[var(--bg-light)] rounded">
                      <div className="text-xs text-[var(--text-secondary)]">Мышцы</div>
                      <div className="font-bold">{m.objectData.muscleMass} кг</div>
                    </div>
                  )}
                </div>
                {(m.objectData.chest || m.objectData.waist || m.objectData.hips) && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="text-xs text-[var(--text-secondary)] mb-2">Объемы (см)</div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {m.objectData.chest && <div>Грудь: {m.objectData.chest}</div>}
                      {m.objectData.waist && <div>Талия: {m.objectData.waist}</div>}
                      {m.objectData.hips && <div>Бедра: {m.objectData.hips}</div>}
                      {m.objectData.arms && <div>Руки: {m.objectData.arms}</div>}
                      {m.objectData.legs && <div>Ноги: {m.objectData.legs}</div>}
                    </div>
                  </div>
                )}
                {m.objectData.notes && (
                  <div className="mt-3 text-xs text-[var(--text-secondary)]">
                    {m.objectData.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50" onClick={() => setShowForm(false)}>
            <div className="card w-full max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl sm:max-w-md" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold">Новое измерение</h3>
                <button onClick={() => setShowForm(false)} className="text-3xl text-[var(--text-secondary)] leading-none">×</button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Вес (кг) *</label>
                  <input 
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">% жира</label>
                    <input 
                      type="number"
                      step="0.1"
                      value={formData.bodyFat}
                      onChange={(e) => setFormData({...formData, bodyFat: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Мышцы (кг)</label>
                    <input 
                      type="number"
                      step="0.1"
                      value={formData.muscleMass}
                      onChange={(e) => setFormData({...formData, muscleMass: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                </div>
                <div className="border-t pt-3">
                  <h4 className="text-sm font-medium mb-2">Объемы (см)</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" placeholder="Грудь" value={formData.chest} onChange={(e) => setFormData({...formData, chest: e.target.value})} className="px-3 py-2 border rounded-lg text-sm" />
                    <input type="number" placeholder="Талия" value={formData.waist} onChange={(e) => setFormData({...formData, waist: e.target.value})} className="px-3 py-2 border rounded-lg text-sm" />
                    <input type="number" placeholder="Бедра" value={formData.hips} onChange={(e) => setFormData({...formData, hips: e.target.value})} className="px-3 py-2 border rounded-lg text-sm" />
                    <input type="number" placeholder="Руки" value={formData.arms} onChange={(e) => setFormData({...formData, arms: e.target.value})} className="px-3 py-2 border rounded-lg text-sm" />
                    <input type="number" placeholder="Ноги" value={formData.legs} onChange={(e) => setFormData({...formData, legs: e.target.value})} className="px-3 py-2 border rounded-lg text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Заметки</label>
                  <textarea 
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    rows="2"
                    placeholder="Самочувствие, заметки..."
                  />
                </div>
                <button type="submit" className="btn-primary w-full">Сохранить</button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('MeasurementHistory error:', error);
    return null;
  }
}