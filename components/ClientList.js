function ClientList({ onClientSelect }) {
  try {
    const [clients, setClients] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
      loadClients();
    }, []);

    const loadClients = async () => {
      try {
        const result = await trickleListObjects('client_profile', 20);
        setClients(result.items);
      } catch (error) {
        console.error('Error loading clients:', error);
      } finally {
        setLoading(false);
      }
    };

    if (loading) {
      return <div className="text-center py-8">Загрузка...</div>;
    }

    return (
      <div className="space-y-3" data-name="client-list" data-file="components/ClientList.js">
        {clients.length === 0 ? (
          <div className="card text-center py-8">
            <div className="icon-users text-4xl text-[var(--text-secondary)] mb-3"></div>
            <p className="text-sm text-[var(--text-secondary)]">Пока нет клиентов</p>
          </div>
        ) : (
          clients.map((client) => (
            <div key={client.objectId} className="card active:shadow-lg transition-shadow touch-manipulation" onClick={() => onClientSelect(client)}>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-[var(--secondary-color)] rounded-full flex items-center justify-center flex-shrink-0">
                  <div className="icon-user text-base text-[var(--primary-color)]"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm truncate">{client.objectData.name}</h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {client.objectData.age} лет • {client.objectData.weight} кг
                  </p>
                </div>
                <div className="icon-chevron-right text-base text-[var(--text-secondary)]"></div>
              </div>
            </div>
          ))
        )}
      </div>
    );
  } catch (error) {
    console.error('ClientList component error:', error);
    return null;
  }
}