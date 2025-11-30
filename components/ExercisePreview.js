function ExercisePreview({ exercise, onClose }) {
  try {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
        <div className="card max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold">{exercise.Name}</h2>
            <button onClick={onClose} className="text-2xl text-[var(--text-secondary)]">×</button>
          </div>

          <div className="mb-4">
            <span className="px-3 py-1 bg-[var(--secondary-color)] text-[var(--primary-color)] rounded-full text-sm">
              {exercise.MuscleGroup}
            </span>
          </div>

          {exercise.VideoUrl ? (
            <div className="mb-6 rounded-lg overflow-hidden" style={{position: 'relative', paddingBottom: '56.25%', height: 0}}>
              <iframe
                src={exercise.VideoUrl}
                style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Exercise Video"
              />
            </div>
          ) : (
            <div className="mb-6 bg-gray-200 rounded-lg h-64 flex items-center justify-center">
              <div className="text-center">
                <div className="icon-play text-6xl text-[var(--primary-color)] mb-3"></div>
                <p className="text-sm text-[var(--text-secondary)]">Видео не добавлено</p>
              </div>
            </div>
          )}

          <div>
            <h3 className="font-bold mb-2">Описание техники:</h3>
            <p className="text-[var(--text-secondary)]">{exercise.Description}</p>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('ExercisePreview error:', error);
    return null;
  }
}