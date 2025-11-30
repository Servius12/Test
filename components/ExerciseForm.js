function ExerciseForm({ onClose, exercise }) {
  try {
    const [formData, setFormData] = React.useState({
      Name: exercise?.Name || '',
      MuscleGroup: exercise?.MuscleGroup || 'Грудь',
      Description: exercise?.Description || '',
      VideoUrl: exercise?.VideoUrl || ''
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        await trickleCreateObject('exercise_library', formData);
        alert('Упражнение добавлено!');
        onClose();
      } catch (error) {
        console.error('Error creating exercise:', error);
        alert('Ошибка при добавлении упражнения');
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
        <div className="card max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold">Добавить упражнение</h2>
            <button onClick={onClose} className="text-2xl text-[var(--text-secondary)]">×</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Название упражнения</label>
              <input 
                type="text"
                value={formData.Name}
                onChange={(e) => setFormData({...formData, Name: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Группа мышц</label>
              <select
                value={formData.MuscleGroup}
                onChange={(e) => setFormData({...formData, MuscleGroup: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg"
                required>
                <option value="Грудь">Грудь</option>
                <option value="Спина">Спина</option>
                <option value="Ноги">Ноги</option>
                <option value="Плечи">Плечи</option>
                <option value="Руки">Руки</option>
                <option value="Пресс">Пресс</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Описание техники</label>
              <textarea 
                value={formData.Description}
                onChange={(e) => setFormData({...formData, Description: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg"
                rows="4"
                placeholder="Опишите технику выполнения упражнения..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Ссылка на видео YouTube</label>
              <input 
                type="url"
                value={formData.VideoUrl}
                onChange={(e) => setFormData({...formData, VideoUrl: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="https://www.youtube.com/embed/VIDEO_ID"
              />
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Формат: https://www.youtube.com/embed/VIDEO_ID
              </p>
            </div>

            <button type="submit" className="btn-primary w-full">
              Добавить упражнение
            </button>
          </form>
        </div>
      </div>
    );
  } catch (error) {
    console.error('ExerciseForm error:', error);
    return null;
  }
}