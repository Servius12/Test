function ResetPasswordForm() {
  try {
    const [password, setPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (password !== confirmPassword) {
        setError('Пароли не совпадают');
        return;
      }
      
      if (password.length < 6) {
        setError('Пароль должен содержать минимум 6 символов');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const result = await updatePassword(password);
        if (result.success) {
          setSuccess(true);
          setTimeout(() => {
            window.location.href = 'login.html';
          }, 2000);
        } else {
          setError(result.error || 'Ошибка при обновлении пароля');
        }
      } catch (err) {
        console.error('Reset password error:', err);
        setError('Ошибка при обновлении пароля');
      }
      setLoading(false);
    };

    if (success) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="card max-w-md w-full text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="icon-check text-3xl text-green-600"></div>
            </div>
            <h2 className="text-xl font-bold mb-2">Пароль обновлен!</h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Перенаправляем на страницу входа...
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-[var(--primary-color)] rounded-xl flex items-center justify-center mx-auto mb-3">
              <div className="icon-lock text-3xl text-white"></div>
            </div>
            <h1 className="text-2xl font-bold">Новый пароль</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Введите новый пароль</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Новый пароль</label>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg"
                placeholder="Минимум 6 символов"
                minLength="6"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Подтвердите пароль</label>
              <input 
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg"
                placeholder="Повторите пароль"
                required
              />
            </div>
            {error && <div className="text-sm text-red-600">{error}</div>}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Обновление...' : 'Обновить пароль'}
            </button>
          </form>
        </div>
      </div>
    );
  } catch (error) {
    console.error('ResetPasswordForm error:', error);
    return null;
  }
}