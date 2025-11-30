function RoleSelector() {
  try {
    return (
      <div className="px-4 py-8" data-name="role-selector" data-file="components/RoleSelector.js">
        <h2 className="text-2xl font-bold text-center mb-2">Добро пожаловать!</h2>
        <p className="text-base text-center text-[var(--text-secondary)] mb-8">
          Выберите роль для продолжения
        </p>
        
        <div className="space-y-4 max-w-md mx-auto">
          <a href="client.html" className="card active:shadow-lg transition-shadow block">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[var(--secondary-color)] rounded-xl flex items-center justify-center flex-shrink-0">
                <div className="icon-user text-2xl text-[var(--primary-color)]"></div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-1">Я Клиент</h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Получайте программы тренировок и следите за прогрессом
                </p>
              </div>
              <div className="icon-chevron-right text-xl text-[var(--text-secondary)]"></div>
            </div>
          </a>

          <a href="trainer.html" className="card active:shadow-lg transition-shadow block">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[var(--secondary-color)] rounded-xl flex items-center justify-center flex-shrink-0">
                <div className="icon-user-check text-2xl text-[var(--primary-color)]"></div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-1">Я Тренер</h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Управляйте программами и следите за клиентами
                </p>
              </div>
              <div className="icon-chevron-right text-xl text-[var(--text-secondary)]"></div>
            </div>
          </a>
        </div>
      </div>
    );
  } catch (error) {
    console.error('RoleSelector component error:', error);
    return null;
  }
}