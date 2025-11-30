function WorkoutTypeSelector({ value, onChange }) {
  try {
    const workoutTypes = [
      { id: 'standard', name: 'Обычная', icon: 'list', description: 'Отдых после каждого упражнения' },
      { id: 'circuit', name: 'Круговая', icon: 'repeat', description: 'Отдых только после круга упражнений' }
    ];

    return (
      <div data-name="workout-type-selector" data-file="components/WorkoutTypeSelector.js">
        <label className="block text-sm font-medium mb-2">Тип тренировки дня</label>
        <div className="grid grid-cols-2 gap-2">
          {workoutTypes.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => onChange(type.id)}
              className={`p-3 border rounded-lg text-left ${
                value === type.id ? 'border-[var(--primary-color)] bg-[var(--secondary-color)]' : ''
              }`}>
              <div className="flex items-center gap-2 mb-1">
                <div className={`icon-${type.icon} text-base ${value === type.id ? 'text-[var(--primary-color)]' : ''}`}></div>
                <span className="font-medium text-sm">{type.name}</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">{type.description}</p>
            </button>
          ))}
        </div>
      </div>
    );
  } catch (error) {
    console.error('WorkoutTypeSelector error:', error);
    return null;
  }
}