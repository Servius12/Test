function ExerciseImport({ onClose, onImportComplete }) {
  try {
    const [file, setFile] = React.useState(null);
    const [importing, setImporting] = React.useState(false);
    const [preview, setPreview] = React.useState([]);
    const [showInstructions, setShowInstructions] = React.useState(false);

    const handleFileChange = (e) => {
      const selectedFile = e.target.files[0];
      if (selectedFile) {
        setFile(selectedFile);
        parseExcel(selectedFile);
      }
    };

    const parseExcel = (file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const rows = text.split('\n').map(row => row.split('\t'));
        const exercises = rows.slice(1).filter(row => row[0]).map(row => ({
          name: row[0]?.trim() || '',
          muscleGroup: row[1]?.trim() || '',
          videoUrl: row[2]?.trim() || '',
          description: row[3]?.trim() || ''
        }));
        setPreview(exercises.slice(0, 5));
      };
      reader.readAsText(file);
    };

    const handleImport = async () => {
      if (!file) return;
      setImporting(true);
      try {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const text = e.target.result;
          const rows = text.split('\n').map(row => row.split('\t'));
          const exercises = rows.slice(1).filter(row => row[0]).map(row => ({
            Name: row[0]?.trim() || '',
            MuscleGroup: row[1]?.trim() || '',
            VideoUrl: row[2]?.trim() || '',
            Description: row[3]?.trim() || ''
          }));

          for (const exercise of exercises) {
            if (exercise.Name) {
              await trickleCreateObject('exercise_library', exercise);
            }
          }
          alert(`Импортировано ${exercises.length} упражнений!`);
          if (onImportComplete) onImportComplete();
          onClose();
        };
        reader.readAsText(file);
      } catch (error) {
        console.error('Import error:', error);
        alert('Ошибка импорта');
      } finally {
        setImporting(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
        <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold">Импорт упражнений</h3>
            <button onClick={onClose} className="text-3xl text-[var(--text-secondary)] leading-none">×</button>
          </div>

          <div className="space-y-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <button onClick={() => setShowInstructions(!showInstructions)} className="flex items-center gap-2 text-sm text-blue-700 font-medium w-full">
                <div className={`icon-${showInstructions ? 'chevron-down' : 'chevron-right'} text-base`}></div>
                Как подготовить файл Excel
              </button>
              {showInstructions && (
                <div className="mt-3 text-sm text-blue-900 space-y-2">
                  <p><strong>1. Создайте таблицу с колонками:</strong></p>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>Название упражнения</li>
                    <li>Группа мышц (Грудь, Спина, Ноги, Плечи, Руки, Пресс)</li>
                    <li>Ссылка на видео YouTube</li>
                    <li>Описание техники</li>
                  </ul>
                  <p><strong>2. Сохраните как .txt или .csv (разделитель TAB)</strong></p>
                  <p><strong>3. Загрузите файл ниже</strong></p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Выберите файл</label>
              <input 
                type="file"
                accept=".txt,.csv"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            {preview.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2">Предпросмотр (первые 5):</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {preview.map((ex, idx) => (
                    <div key={idx} className="p-2 bg-gray-50 rounded text-xs">
                      <div className="font-medium">{ex.name}</div>
                      <div className="text-gray-600">{ex.muscleGroup}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button 
              onClick={handleImport}
              disabled={!file || importing}
              className="btn-primary w-full">
              {importing ? 'Импортируем...' : 'Импортировать упражнения'}
            </button>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('ExerciseImport error:', error);
    return null;
  }
}