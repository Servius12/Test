function ClientProfile() {
  try {
    const [profile, setProfile] = React.useState({
      name: '',
      age: '',
      gender: 'male',
      weight: '',
      height: '',
      targetWeight: '',
      activityLevel: 'moderate',
      goal: 'muscle_gain',
      experience: 'beginner',
      trainingDays: '3',
      healthIssues: '',
      medications: '',
      injuries: '',
      sleepHours: '7',
      stressLevel: 'medium',
      nutrition: 'mixed',
      supplements: '',
      motivation: ''
    });

    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
      loadProfile();
    }, []);

    const loadProfile = async () => {
      try {
        const result = await trickleListObjects('client_profile', 10, true);
        if (result.items.length > 0) {
          setProfile(result.items[0].objectData);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
        const result = await trickleListObjects('client_profile', 10, true);
        if (result.items.length > 0) {
          await trickleUpdateObject('client_profile', result.items[0].objectId, profile);
          alert('Профиль успешно обновлен!');
        } else {
          await trickleCreateObject('client_profile', profile);
          alert('Профиль успешно сохранен!');
        }
        loadProfile();
      } catch (error) {
        console.error('Error saving profile:', error);
        alert('Ошибка при сохранении профиля');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="pb-6" data-name="client-profile" data-file="components/ClientProfile.js">
        <div className="card mb-4">
          <h2 className="text-xl font-bold mb-4">Моя Анкета</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-[var(--primary-color)]">Основная информация</h3>
              
              <div>
                <label className="block text-sm font-medium mb-1">Имя *</label>
                <input 
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Возраст *</label>
                  <input 
                    type="number"
                    value={profile.age}
                    onChange={(e) => setProfile({...profile, age: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Пол *</label>
                  <select
                    value={profile.gender}
                    onChange={(e) => setProfile({...profile, gender: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option value="male">Мужской</option>
                    <option value="female">Женский</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Вес (кг) *</label>
                  <input 
                    type="number"
                    step="0.1"
                    value={profile.weight}
                    onChange={(e) => setProfile({...profile, weight: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Рост (см) *</label>
                  <input 
                    type="number"
                    value={profile.height}
                    onChange={(e) => setProfile({...profile, height: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Цель (кг)</label>
                  <input 
                    type="number"
                    step="0.1"
                    value={profile.targetWeight}
                    onChange={(e) => setProfile({...profile, targetWeight: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4 space-y-3">
              <h3 className="font-bold text-sm text-[var(--primary-color)]">Фитнес цели</h3>
              
              <div>
                <label className="block text-sm font-medium mb-1">Основная цель *</label>
                <select
                  value={profile.goal}
                  onChange={(e) => setProfile({...profile, goal: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg text-sm">
                  <option value="weight_loss">Снижение веса</option>
                  <option value="muscle_gain">Набор мышечной массы</option>
                  <option value="strength">Увеличение силы</option>
                  <option value="endurance">Выносливость</option>
                  <option value="health">Общее здоровье</option>
                  <option value="sport">Подготовка к спорту</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Опыт тренировок *</label>
                  <select
                    value={profile.experience}
                    onChange={(e) => setProfile({...profile, experience: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option value="beginner">Новичок</option>
                    <option value="intermediate">Средний</option>
                    <option value="advanced">Продвинутый</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Дней в неделю *</label>
                  <select
                    value={profile.trainingDays}
                    onChange={(e) => setProfile({...profile, trainingDays: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option value="2">2 дня</option>
                    <option value="3">3 дня</option>
                    <option value="4">4 дня</option>
                    <option value="5">5 дней</option>
                    <option value="6">6 дней</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Уровень активности *</label>
                <select
                  value={profile.activityLevel}
                  onChange={(e) => setProfile({...profile, activityLevel: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg text-sm">
                  <option value="sedentary">Малоподвижный</option>
                  <option value="light">Легкая активность</option>
                  <option value="moderate">Умеренная активность</option>
                  <option value="active">Высокая активность</option>
                  <option value="very_active">Очень высокая</option>
                </select>
              </div>
            </div>

            <div className="border-t pt-4 space-y-3">
              <h3 className="font-bold text-sm text-[var(--primary-color)]">Здоровье</h3>
              
              <div>
                <label className="block text-sm font-medium mb-1">Хронические заболевания</label>
                <textarea 
                  value={profile.healthIssues}
                  onChange={(e) => setProfile({...profile, healthIssues: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  rows="2"
                  placeholder="Диабет, гипертония и т.д."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Травмы или ограничения</label>
                <textarea 
                  value={profile.injuries}
                  onChange={(e) => setProfile({...profile, injuries: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  rows="2"
                  placeholder="Проблемы с суставами, спиной и т.д."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Принимаемые лекарства</label>
                <input 
                  type="text"
                  value={profile.medications}
                  onChange={(e) => setProfile({...profile, medications: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="Перечислите через запятую"
                />
              </div>
            </div>

            <div className="border-t pt-4 space-y-3">
              <h3 className="font-bold text-sm text-[var(--primary-color)]">Образ жизни</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Сон (часов) *</label>
                  <input 
                    type="number"
                    min="4"
                    max="12"
                    value={profile.sleepHours}
                    onChange={(e) => setProfile({...profile, sleepHours: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Уровень стресса *</label>
                  <select
                    value={profile.stressLevel}
                    onChange={(e) => setProfile({...profile, stressLevel: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option value="low">Низкий</option>
                    <option value="medium">Средний</option>
                    <option value="high">Высокий</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Тип питания *</label>
                <select
                  value={profile.nutrition}
                  onChange={(e) => setProfile({...profile, nutrition: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg text-sm">
                  <option value="mixed">Смешанное</option>
                  <option value="vegetarian">Вегетарианское</option>
                  <option value="vegan">Веганское</option>
                  <option value="keto">Кето</option>
                  <option value="paleo">Палео</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Спортивное питание</label>
                <input 
                  type="text"
                  value={profile.supplements}
                  onChange={(e) => setProfile({...profile, supplements: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="Протеин, креатин и т.д."
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <label className="block text-sm font-medium mb-1">Что вас мотивирует?</label>
              <textarea 
                value={profile.motivation}
                onChange={(e) => setProfile({...profile, motivation: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                rows="3"
                placeholder="Расскажите о своих целях и мотивации..."
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary w-full">
              {loading ? 'Сохранение...' : 'Сохранить профиль'}
            </button>
          </form>
        </div>
      </div>
    );
  } catch (error) {
    console.error('ClientProfile component error:', error);
    return null;
  }
}