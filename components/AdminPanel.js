function AdminPanel() {
  try {
    const [registrations, setRegistrations] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [filter, setFilter] = React.useState('all');
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
      loadRegistrations();
    }, []);

    const loadRegistrations = async () => {
      setLoading(true);
      setError(null);
      try {
        const client = initSupabase();
        if (!client) {
          setError('Supabase не настроен');
          setRegistrations([]);
          setLoading(false);
          return;
        }

        const { data, error } = await client
          .from('user_registration')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error loading registrations:', error);
          setError('Ошибка загрузки данных');
          setRegistrations([]);
        } else {
          const items = (data || []).map(item => ({
            objectId: item.id,
            objectData: {
              Email: item.email,
              Username: item.username,
              FirstName: item.first_name,
              LastName: item.last_name,
              RequestedRole: item.requested_role,
              Status: item.status,
              ApprovedRole: item.approved_role
            }
          }));
          setRegistrations(items);
        }
      } catch (error) {
        console.error('Error loading registrations:', error);
        setError('Ошибка загрузки данных');
        setRegistrations([]);
      } finally {
        setLoading(false);
      }
    };

    const handleApprove = async (registration, role) => {
      if (!registration || !registration.objectId) {
        alert('Ошибка: неверные данные регистрации');
        return;
      }
      
      try {
        const client = initSupabase();
        const { error } = await client
          .from('user_registration')
          .update({
            status: 'approved',
            approved_role: role
          })
          .eq('id', registration.objectId);
        
        if (error) throw error;
        alert(`Пользователь одобрен как ${role === 'client' ? 'клиент' : 'тренер'}.\nЛогин: ${registration.objectData.Username}`);
        await loadRegistrations();
      } catch (error) {
        console.error('Error approving registration:', error);
        alert('Ошибка при одобрении заявки. Попробуйте еще раз.');
      }
    };

    const handleReject = async (registration) => {
      if (!registration || !registration.objectId) {
        alert('Ошибка: неверные данные регистрации');
        return;
      }
      
      try {
        const client = initSupabase();
        const { error } = await client
          .from('user_registration')
          .update({ status: 'rejected' })
          .eq('id', registration.objectId);
        
        if (error) throw error;
        alert('Заявка отклонена');
        await loadRegistrations();
      } catch (error) {
        console.error('Error rejecting registration:', error);
        alert('Ошибка при отклонении заявки. Попробуйте еще раз.');
      }
    };

    const handleBlock = async (registration) => {
      if (!registration || !registration.objectId) {
        alert('Ошибка: неверные данные регистрации');
        return;
      }
      
      try {
        const client = initSupabase();
        const { error } = await client
          .from('user_registration')
          .update({ status: 'blocked' })
          .eq('id', registration.objectId);
        
        if (error) throw error;
        alert('Пользователь заблокирован');
        await loadRegistrations();
      } catch (error) {
        console.error('Error blocking user:', error);
        alert('Ошибка при блокировке пользователя');
      }
    };

    const handleUnblock = async (registration) => {
      if (!registration || !registration.objectId) {
        alert('Ошибка: неверные данные регистрации');
        return;
      }
      
      try {
        const client = initSupabase();
        const { error } = await client
          .from('user_registration')
          .update({ status: 'approved' })
          .eq('id', registration.objectId);
        
        if (error) throw error;
        alert('Пользователь разблокирован');
        await loadRegistrations();
      } catch (error) {
        console.error('Error unblocking user:', error);
        alert('Ошибка при разблокировке пользователя');
      }
    };

    const filteredRegs = filter === 'all' ? registrations : registrations.filter(r => r.objectData.Status?.toLowerCase() === filter);
    const pendingCount = registrations.filter(r => r.objectData.Status?.toLowerCase() === 'pending').length;

    return (
      <div data-name="admin-panel" data-file="components/AdminPanel.js">
        <h1 className="text-xl font-bold mb-4">Управление пользователями</h1>

        <div className="flex gap-2 mb-4 overflow-x-auto">
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap ${filter === 'all' ? 'bg-[var(--primary-color)] text-white' : 'bg-white'}`}>
            Все заявки
          </button>
          <button 
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap relative ${filter === 'pending' ? 'bg-[var(--primary-color)] text-white' : 'bg-white'}`}>
            На рассмотрении
            {pendingCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
          <button 
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap ${filter === 'approved' ? 'bg-[var(--primary-color)] text-white' : 'bg-white'}`}>
            Одобренные
          </button>
          <button 
            onClick={() => setFilter('rejected')}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap ${filter === 'rejected' ? 'bg-[var(--primary-color)] text-white' : 'bg-white'}`}>
            Отклоненные
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">Загрузка...</div>
        ) : error ? (
          <div className="card text-center py-8">
            <div className="icon-alert-circle text-4xl text-red-500 mb-3"></div>
            <p className="text-sm text-[var(--text-secondary)] mb-3">{error}</p>
            <button onClick={loadRegistrations} className="btn-primary text-sm">
              Повторить
            </button>
          </div>
        ) : filteredRegs.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-sm text-[var(--text-secondary)]">Нет заявок</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRegs.map((reg) => (
              <div key={reg.objectId} className="card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-sm">
                      {reg.objectData.FirstName} {reg.objectData.LastName}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)]">
                      @{reg.objectData.Username}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded ${
                    reg.objectData.Status?.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    reg.objectData.Status?.toLowerCase() === 'approved' ? 'bg-green-100 text-green-700' :
                    reg.objectData.Status?.toLowerCase() === 'blocked' ? 'bg-gray-100 text-gray-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {reg.objectData.Status?.toLowerCase() === 'pending' ? 'Ожидание' :
                     reg.objectData.Status?.toLowerCase() === 'approved' ? 'Одобрено' : 
                     reg.objectData.Status?.toLowerCase() === 'blocked' ? 'Заблокирован' : 'Отклонено'}
                  </span>
                </div>
                <p className="text-sm mb-3">
                  Запрошена роль: <strong>{reg.objectData.RequestedRole === 'client' ? 'Клиент' : 'Тренер'}</strong>
                </p>
                <div className="space-y-2">
                  {reg.objectData.Status?.toLowerCase() === 'pending' && (
                    <div className="grid grid-cols-3 gap-2">
                      <button 
                        onClick={() => handleApprove(reg, 'client')}
                        className="px-3 py-2 bg-blue-500 text-white rounded-lg text-xs">
                        Клиент
                      </button>
                      <button 
                        onClick={() => handleApprove(reg, 'trainer')}
                        className="px-3 py-2 bg-green-500 text-white rounded-lg text-xs">
                        Тренер
                      </button>
                      <button 
                        onClick={() => handleReject(reg)}
                        className="px-3 py-2 bg-red-500 text-white rounded-lg text-xs">
                        Отклонить
                      </button>
                    </div>
                  )}
                  
                  {reg.objectData.Status?.toLowerCase() === 'approved' && reg.objectData.ApprovedRole && (
                    <div className="text-xs text-center py-1 bg-blue-50 text-blue-700 rounded">
                      Роль: {reg.objectData.ApprovedRole === 'client' ? 'Клиент' : 'Тренер'}
                    </div>
                  )}
                  
                  {reg.objectData.Status?.toLowerCase() === 'approved' && (
                    <button 
                      onClick={() => handleBlock(reg)}
                      className="w-full px-3 py-2 bg-gray-500 text-white rounded-lg text-xs">
                      Заблокировать
                    </button>
                  )}
                  
                  {reg.objectData.Status?.toLowerCase() === 'blocked' && (
                    <button 
                      onClick={() => handleUnblock(reg)}
                      className="w-full px-3 py-2 bg-green-500 text-white rounded-lg text-xs">
                      Разблокировать
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('AdminPanel component error:', error);
    return null;
  }
}