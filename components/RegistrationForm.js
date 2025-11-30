function RegistrationForm() {
  try {
    const [formData, setFormData] = React.useState({
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      requestedRole: 'client'
    });
    const [submitted, setSubmitted] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
      checkExistingRegistration();
    }, []);

    const checkExistingRegistration = async () => {
      try {
        const client = initSupabase();
        if (!client) return;

        if (window.Telegram?.WebApp) {
          const tg = window.Telegram.WebApp;
          tg.ready();
          const user = tg.initDataUnsafe?.user;
          
          if (user) {
            setFormData(prev => ({
              ...prev,
              username: user.username || '',
              firstName: user.first_name || '',
              lastName: user.last_name || ''
            }));

            const { data, error } = await client
              .from('user_registration')
              .select('*')
              .eq('username', user.username)
              .single();
            
            if (data && !error) {
              if (data.status === 'approved') {
                window.location.href = 'index.html';
              } else {
                setSubmitted(true);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error checking registration:', error);
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (formData.password !== formData.confirmPassword) {
        alert('Пароли не совпадают');
        return;
      }
      
      if (formData.password.length < 6) {
        alert('Пароль должен содержать минимум 6 символов');
        return;
      }
      
      setLoading(true);
      try {
        // Save registration directly to Supabase database
        const client = initSupabase();
        if (!client) {
          alert('Ошибка подключения к базе данных');
          setLoading(false);
          return;
        }

        const { data, error } = await client
          .from('user_registration')
          .insert([{
            email: formData.email,
            username: formData.username,
            password: formData.password,
            first_name: formData.firstName,
            last_name: formData.lastName,
            requested_role: formData.requestedRole,
            status: 'pending',
            approved_role: null
          }])
          .select()
          .single();
        
        if (error) {
          console.error('Registration error:', error);
          if (error.code === '23505') {
            alert('Пользователь с таким email уже существует');
          } else {
            alert('Ошибка при регистрации: ' + error.message);
          }
        } else {
          console.log('Registration successful:', data);
          setSubmitted(true);
        }
      } catch (error) {
        console.error('Error submitting registration:', error);
        alert('Ошибка при отправке заявки: ' + error.message);
      }
      setLoading(false);
    };

    if (submitted) {
      return (
        <div className="px-4 py-8" data-name="registration-form" data-file="components/RegistrationForm.js">
          <div className="card max-w-md mx-auto text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="icon-check text-3xl text-green-600"></div>
            </div>
            <h2 className="text-xl font-bold mb-2">Заявка отправлена!</h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Ваша заявка на рассмотрении. Администратор свяжется с вами после одобрения.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="px-4 py-8" data-name="registration-form" data-file="components/RegistrationForm.js">
        <div className="card max-w-md mx-auto">
          <h2 className="text-xl font-bold mb-4">Регистрация</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Имя *</label>
              <input 
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Фамилия *</label>
              <input 
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email *</label>
              <input 
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="your@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Логин *</label>
              <input 
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Придумайте логин для входа"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Пароль *</label>
              <input 
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Минимум 6 символов"
                minLength="6"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Подтверждение пароля *</label>
              <input 
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Повторите пароль"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Выберите роль *</label>
              <div className="space-y-2">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="client"
                    checked={formData.requestedRole === 'client'}
                    onChange={(e) => setFormData({...formData, requestedRole: e.target.value})}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">Клиент</div>
                    <div className="text-xs text-[var(--text-secondary)]">
                      Получать программы тренировок
                    </div>
                  </div>
                </label>
                <label className="flex items-center p-3 border rounded-lg cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="trainer"
                    checked={formData.requestedRole === 'trainer'}
                    onChange={(e) => setFormData({...formData, requestedRole: e.target.value})}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">Тренер</div>
                    <div className="text-xs text-[var(--text-secondary)]">
                      Создавать программы для клиентов
                    </div>
                  </div>
                </label>
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary w-full">
              {loading ? 'Отправка...' : 'Отправить заявку'}
            </button>
          </form>
        </div>
      </div>
    );
  } catch (error) {
    console.error('RegistrationForm component error:', error);
    return null;
  }
}