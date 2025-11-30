function FeedbackForm({ onClose }) {
  try {
    const [feedback, setFeedback] = React.useState({
      rating: 5,
      comment: '',
      difficulty: 'medium'
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        await trickleCreateObject('workout_feedback', {
          ...feedback,
          date: new Date().toISOString()
        });
        alert('Спасибо за отзыв!');
        onClose();
      } catch (error) {
        console.error('Error saving feedback:', error);
        alert('Ошибка при отправке отзыва');
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose} data-name="feedback-form" data-file="components/FeedbackForm.js">
        <div className="card max-w-md w-full" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold">Обратная связь</h2>
            <button onClick={onClose} className="text-2xl text-[var(--text-secondary)]">×</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Оценка тренировки</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFeedback({...feedback, rating: star})}
                    className={`text-3xl ${star <= feedback.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Сложность</label>
              <select 
                value={feedback.difficulty}
                onChange={(e) => setFeedback({...feedback, difficulty: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg">
                <option value="easy">Легко</option>
                <option value="medium">Средне</option>
                <option value="hard">Сложно</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Комментарий</label>
              <textarea 
                value={feedback.comment}
                onChange={(e) => setFeedback({...feedback, comment: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg"
                rows="4"
                placeholder="Ваши впечатления о тренировке..."
              />
            </div>

            <button type="submit" className="btn-primary w-full">
              Отправить отзыв
            </button>
          </form>
        </div>
      </div>
    );
  } catch (error) {
    console.error('FeedbackForm component error:', error);
    return null;
  }
}
