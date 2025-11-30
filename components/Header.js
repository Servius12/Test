function Header({ isClient, isTrainer, isAdmin }) {
  try {
    const handleLogoClick = () => {
      const authUser = sessionStorage.getItem('authenticated_user');
      const isAdminAuth = sessionStorage.getItem('admin_authenticated');
      if (authUser) {
        window.location.href = 'index.html';
      } else if (isAdminAuth) {
        window.location.href = 'admin.html';
      } else {
        window.location.href = 'login.html';
      }
    };

    const handleLogout = () => {
      if (isAdmin) {
        sessionStorage.removeItem('admin_authenticated');
      } else {
        sessionStorage.removeItem('authenticated_user');
      }
      window.location.href = 'login.html';
    };

    return (
      <header className="bg-white shadow-sm sticky top-0 z-40" data-name="header" data-file="components/Header.js">
        <div className="px-3 py-2 flex justify-between items-center">
          <div 
            className="flex items-center gap-2 cursor-pointer active:opacity-70 transition-opacity" 
            onClick={handleLogoClick}>
            <div className="w-7 h-7 bg-[var(--primary-color)] rounded-lg flex items-center justify-center">
              <div className="icon-dumbbell text-base text-white"></div>
            </div>
            <h1 className="text-base font-bold text-[var(--text-primary)]">Фитнес Тренер</h1>
          </div>
          
          <nav className="flex gap-2 items-center">
            {isTrainer && <TrainerNotifications />}
            {(isClient || isTrainer || isAdmin) && (
              <button onClick={handleLogout} className="text-[var(--text-secondary)] active:text-[var(--primary-color)] text-xs">
                Выход
              </button>
            )}
          </nav>
        </div>
      </header>
    );
  } catch (error) {
    console.error('Header component error:', error);
    return null;
  }
}