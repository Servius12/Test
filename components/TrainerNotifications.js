function TrainerNotifications() {
  try {
    const [notifications, setNotifications] = React.useState([]);
    const [showNotifications, setShowNotifications] = React.useState(false);
    const [unreadCount, setUnreadCount] = React.useState(0);

    React.useEffect(() => {
      loadNotifications();
      const interval = setInterval(loadNotifications, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }, []);

    const loadNotifications = async () => {
      try {
        const result = await trickleListObjects('trainer_notification', 50, true);
        if (result && result.items && Array.isArray(result.items)) {
          setNotifications(result.items);
          const unread = result.items.filter(n => n && n.objectData && !n.objectData.read).length;
          setUnreadCount(unread);
        } else {
          setNotifications([]);
          setUnreadCount(0);
        }
      } catch (error) {
        // If table doesn't exist yet or is empty, just set empty state
        if (error.message && error.message.includes('not valid JSON')) {
          setNotifications([]);
          setUnreadCount(0);
        } else {
          console.error('Error loading notifications:', error);
          setNotifications([]);
          setUnreadCount(0);
        }
      }
    };

    const markAsRead = async (notificationId) => {
      try {
        await trickleUpdateObject('trainer_notification', notificationId, { read: true });
        loadNotifications();
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    };

    const markAllAsRead = async () => {
      try {
        const validNotifications = notifications.filter(n => n && n.objectData && !n.objectData.read);
        for (const notification of validNotifications) {
          await trickleUpdateObject('trainer_notification', notification.objectId, { read: true });
        }
        await loadNotifications();
      } catch (error) {
        console.error('Error marking all as read:', error);
      }
    };

    return (
      <div data-name="trainer-notifications" data-file="components/TrainerNotifications.js">
        <button 
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-2 active:opacity-70">
          <div className="icon-bell text-xl text-[var(--text-primary)]"></div>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        {showNotifications && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50" onClick={() => setShowNotifications(false)}>
            <div className="card w-full max-h-[80vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl sm:max-w-md" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Уведомления</h3>
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="text-sm text-[var(--primary-color)]">
                      Прочитать все
                    </button>
                  )}
                  <button onClick={() => setShowNotifications(false)} className="text-3xl text-[var(--text-secondary)] leading-none">×</button>
                </div>
              </div>

              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <div className="icon-bell-off text-4xl text-[var(--text-secondary)] mb-3"></div>
                  <p className="text-sm text-[var(--text-secondary)]">Нет уведомлений</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.filter(n => n && n.objectData).map((notification) => {
                    const isRead = notification.objectData.read || false;
                    return (
                      <div 
                        key={notification.objectId}
                        onClick={() => markAsRead(notification.objectId)}
                        className={`p-3 rounded-lg cursor-pointer ${isRead ? 'bg-gray-50' : 'bg-blue-50'}`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isRead ? 'bg-gray-200' : 'bg-blue-200'}`}>
                            <div className={`icon-check-circle text-lg ${isRead ? 'text-gray-600' : 'text-blue-600'}`}></div>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{notification.objectData.message || 'Уведомление'}</p>
                            <p className="text-xs text-[var(--text-secondary)] mt-1">
                              {notification.objectData.date ? new Date(notification.objectData.date).toLocaleString('ru-RU') : ''}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('TrainerNotifications component error:', error);
    return null;
  }
}