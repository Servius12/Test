function TemplateProgramsList({ onSelectTemplate }) {
  try {
    const [templates, setTemplates] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
      loadTemplates();
    }, []);

    const loadTemplates = async () => {
      try {
        const authUser = sessionStorage.getItem('authenticated_user');
        let currentUserId = null;
        if (authUser) {
          const user = JSON.parse(authUser);
          currentUserId = user.userId;
        }

        const result = await trickleListObjects('program_template', 50);
        const availableTemplates = result.items.filter(t => 
          t.objectData.IsPublic || 
          t.objectData.CreatorId === currentUserId ||
          t.objectData.SharedWith?.includes(currentUserId)
        );
        setTemplates(availableTemplates || []);
      } catch (error) {
        console.error('Error loading templates:', error);
      } finally {
        setLoading(false);
      }
    };

    if (loading) {
      return <div className="text-center py-4">Загрузка шаблонов...</div>;
    }

    return (
      <div data-name="templates-list" data-file="components/TemplateProgramsList.js">
        <h3 className="font-bold text-sm mb-3">Шаблоны программ</h3>
        {templates.length === 0 ? (
          <p className="text-sm text-center py-4 text-[var(--text-secondary)]">
            Нет доступных шаблонов
          </p>
        ) : (
          <div className="space-y-2">
            {templates.map((template) => (
              <div 
                key={template.objectId}
                onClick={() => onSelectTemplate(template.objectData)}
                className="p-3 border rounded-lg cursor-pointer hover:bg-[var(--secondary-color)] active:bg-[var(--secondary-color)]">
                <h4 className="font-medium text-sm mb-1">{template.objectData.name}</h4>
                <p className="text-xs text-[var(--text-secondary)]">
                  {template.objectData.weeksCount} недель • {template.objectData.daysPerWeek} дней
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('TemplateProgramsList error:', error);
    return null;
  }
}