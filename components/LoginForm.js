function LoginForm() {
  try {
      const [credentials, setCredentials] = React.useState({ email: '', password: '' });
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [showForgotPassword, setShowForgotPassword] = React.useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError('');

      try {
        // Admin login check
        if (credentials.email === 'admin@admin.com' && credentials.password === 'admin123') {
          sessionStorage.setItem('admin_authenticated', 'true');
          window.location.href = 'admin.html';
          return;
        }

        const client = initSupabase();
        const { data, error } = await client
          .from('user_registration')
          .select('*')
          .eq('email', credentials.email)
          .eq('password', credentials.password)
          .single();
        
        if (error || !data) {
          setError('Неверный email или пароль');
        } else if (data.status?.toLowerCase() !== 'approved') {
          setError('Ваша заявка еще не одобрена администратором');
        } else {
          sessionStorage.setItem('authenticated_user', JSON.stringify({
            userId: data.id,
            email: data.email,
            username: data.username,
            role: data.approved_role
          }));
          window.location.href = 'index.html';
        }
      } catch (err) {
        console.error('Login error:', err);
        setError('Ошибка входа');
      }
      setLoading(false);
    };

    const handleForgotPassword = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError('');

      try {
        const result = await resetPassword(credentials.email);
        if (result.success) {
          alert('Письмо с инструкциями для восстановления пароля отправлено на ваш email');
          setShowForgotPassword(false);
        } else {
          setError(result.error || 'Ошибка при отправке письма');
        }
      } catch (err) {
        console.error('Reset password error:', err);
        setError('Ошибка при восстановлении пароля');
      }
      setLoading(false);
    };

    return (
      <div className="min-h-screen flex items-center justify-center px-4" data-file="components/LoginForm.js">
        <div className="card max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-[var(--primary-color)] rounded-xl flex items-center justify-center mx-auto mb-3">
              <div className="icon-dumbbell text-3xl text-white"></div>
            </div>
            <h1 className="text-2xl font-bold">Вход в систему</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Для пользователей и администраторов</p>
          </div>

          {showForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input 
                  type="email"
                  value={credentials.email}
                  onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                  className="w-full px-4 py-3 border rounded-lg"
                  placeholder="your@email.com"
                  required
                />
              </div>
              {error && <div className="text-sm text-red-600">{error}</div>}
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Отправка...' : 'Отправить инструкции'}
              </button>
              <button 
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="w-full text-sm text-[var(--primary-color)]">
                Назад к входу
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input 
                  type="email"
                  value={credentials.email}
                  onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                  className="w-full px-4 py-3 border rounded-lg"
                  placeholder="your@email.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Пароль</label>
                <input 
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                  className="w-full px-4 py-3 border rounded-lg"
                  required
                />
              </div>
              {error && <div className="text-sm text-red-600">{error}</div>}
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Вход...' : 'Войти'}
              </button>
              <div className="text-center">
                <button 
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-[var(--primary-color)]">
                  Забыли пароль?
                </button>
              </div>
              <p className="text-center text-sm text-[var(--text-secondary)] mt-4">
                Нет аккаунта? <a href="register.html" className="text-[var(--primary-color)] font-medium">Регистрация</a>
              </p>
            </form>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('LoginForm error:', error);
    return null;
  }
}
