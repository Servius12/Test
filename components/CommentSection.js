function CommentSection({ client, onClose }) {
  try {
    const [comments, setComments] = React.useState([]);
    const [newComment, setNewComment] = React.useState('');

    React.useEffect(() => {
      loadComments();
    }, [client]);

    const loadComments = async () => {
      try {
        const result = await trickleListObjects(`comment:${client.objectId}`, 20);
        setComments(result.items);
      } catch (error) {
        console.error('Error loading comments:', error);
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        await trickleCreateObject(`comment:${client.objectId}`, {
          text: newComment,
          date: new Date().toISOString()
        });
        setNewComment('');
        loadComments();
      } catch (error) {
        console.error('Error saving comment:', error);
        alert('Ошибка при сохранении комментария');
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose} data-name="comment-section" data-file="components/CommentSection.js">
        <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold">{client.objectData.name}</h2>
              <p className="text-[var(--text-secondary)]">Комментарии и рекомендации</p>
            </div>
            <button onClick={onClose} className="text-2xl text-[var(--text-secondary)]">×</button>
          </div>

          <div className="space-y-4 mb-6">
            {comments.length === 0 ? (
              <div className="text-center py-8 text-[var(--text-secondary)]">
                Пока нет комментариев
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.objectId} className="p-4 bg-[var(--bg-light)] rounded-lg">
                  <p className="text-sm mb-2">{comment.objectData.text}</p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {new Date(comment.objectData.date).toLocaleDateString('ru-RU')}
                  </p>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <textarea 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Добавить комментарий или рекомендацию..."
              className="w-full px-4 py-2 border rounded-lg"
              rows="3"
              required
            />
            <button type="submit" className="btn-primary w-full">
              Отправить комментарий
            </button>
          </form>
        </div>
      </div>
    );
  } catch (error) {
    console.error('CommentSection component error:', error);
    return null;
  }
}