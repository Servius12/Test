function TemplateManager({ onClose }) {
  try {
    const [templates, setTemplates] = React.useState([]);
    const [trainers, setTrainers] = React.useState([]);
    const [showCreateForm, setShowCreateForm] = React.useState(false);
    const [loading, setLoading] = React.useState(true);
    const [currentTrainerId, setCurrentTrainerId] = React.useState(null);

    React.useEffect(() => {
      loadData();
    }, []);

    const loadData = async () => {
      try {
        const authUser = sessionStorage.getItem('authenticated_user');
        if (authUser) {
          const user = JSON.parse(authUser);
          setCurrentTrainerId(user.userId);
        }

        const [templatesResult, usersResult] = await Promise.all([
          trickleListObjects('program_template', 100, true),
          trickleListObjects('user_registration', 100)
        ]);

        const trainersList = usersResult.items.filter(u => 
          u.objectData.Status === 'approved' && u.objectData.ApprovedRole === 'trainer'
        );
        setTrainers(trainersList);

        const myTemplates = templatesResult.items.filter(t => 
          t.objectData.CreatorId === currentTrainerId ||
          t.objectData.IsPublic ||
          t.objectData.SharedWith?.includes(currentTrainerId)
        );
        setTemplates(myTemplates);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    const handleDeleteTemplate = async (templateId) => {
      if (!confirm('Удалить шаблон?')) return;
      try {
        await trickleDeleteObject('program_template', templateId);
        loadData();
      } catch (error) {
        console.error('Error deleting template:', error);
        alert('Ошибка при удалении шаблона');
      }
    };

    if (loading) {
      return <div className="text-center py-8">Загрузка...</div>;
    }

    return (
      <div data-name="template-manager" data-file="components/TemplateManager.js">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Мои Шаблоны</h2>
          <button onClick={() => setShowCreateForm(true)} className="btn-primary text-sm">
            <div className="icon-plus text-base inline-block mr-1"></div>
            Создать
          </button>
        </div>

        {templates.length === 0 ? (
          <div className="card text-center py-8">
            <div className="icon-folder text-4xl text-[var(--text-secondary)] mb-3"></div>
            <p className="text-sm text-[var(--text-secondary)]">Нет шаблонов</p>
          </div>
        ) : (
          <div className="space-y-3">
            {templates.map((template) => (
              <div key={template.objectId} className="card">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-sm">{template.objectData.Name}</h3>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {template.objectData.WeeksCount} недель • {template.objectData.DaysPerWeek} дней
                    </p>
                  </div>
                  {template.objectData.CreatorId === currentTrainerId && (
                    <button 
                      onClick={() => handleDeleteTemplate(template.objectId)}
                      className="text-red-500 ml-2">
                      <div className="icon-trash-2 text-base"></div>
                    </button>
                  )}
                </div>
                <div className="flex gap-2 mt-2">
                  {template.objectData.IsPublic && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                      Публичный
                    </span>
                  )}
                  {template.objectData.CreatorId === currentTrainerId && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                      Мой шаблон
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {showCreateForm && (
          <TemplateCreateForm 
            onClose={() => {
              setShowCreateForm(false);
              loadData();
            }}
            trainers={trainers}
            currentTrainerId={currentTrainerId}
          />
        )}
      </div>
    );
  } catch (error) {
    console.error('TemplateManager error:', error);
    return null;
  }
}