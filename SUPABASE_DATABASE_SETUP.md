# Настройка Supabase Database для Фитнес Тренер

## 📋 Обзор

Это приложение использует **Supabase** для:
- ✅ Аутентификации пользователей
- ✅ Хранения всех данных (профили, тренировки, измерения)
- ✅ Восстановления пароля через email

## 🚀 Шаг 1: Создание проекта Supabase

1. Перейдите на [supabase.com](https://supabase.com)
2. Войдите через GitHub
3. Создайте новый проект
4. Сохраните **URL проекта** и **anon public ключ**

## 🗄️ Шаг 2: Создание таблиц в базе данных

### 2.1 Откройте SQL Editor

1. В Supabase Dashboard откройте **SQL Editor**
2. Нажмите **New query**
3. Вставьте SQL код ниже
4. Нажмите **Run**

### 2.2 SQL для создания всех таблиц

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Registration Table
CREATE TABLE user_registration (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  requested_role TEXT CHECK (requested_role IN ('client', 'trainer')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'blocked')),
  approved_role TEXT CHECK (approved_role IN ('client', 'trainer')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Client Profile Table
CREATE TABLE client_profile (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_registration(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER,
  gender TEXT CHECK (gender IN ('male', 'female')),
  weight NUMERIC,
  height INTEGER,
  target_weight NUMERIC,
  activity_level TEXT,
  goal TEXT,
  experience TEXT,
  training_days INTEGER,
  health_issues TEXT,
  medications TEXT,
  injuries TEXT,
  sleep_hours INTEGER,
  stress_level TEXT,
  nutrition TEXT,
  supplements TEXT,
  motivation TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Exercise Library Table
CREATE TABLE exercise_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  muscle_group TEXT,
  video_url TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Workout Program Table
CREATE TABLE workout_program (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  client_id UUID REFERENCES user_registration(id) ON DELETE CASCADE,
  weeks_count INTEGER,
  days_per_week INTEGER,
  schedule JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Measurement Table
CREATE TABLE measurement (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES user_registration(id) ON DELETE CASCADE,
  weight NUMERIC,
  body_fat NUMERIC,
  muscle_mass NUMERIC,
  chest NUMERIC,
  waist NUMERIC,
  hips NUMERIC,
  arms NUMERIC,
  legs NUMERIC,
  notes TEXT,
  date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Exercise Log Table
CREATE TABLE exercise_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES user_registration(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  sets JSONB,
  date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Completed Program Table
CREATE TABLE completed_program (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES user_registration(id) ON DELETE CASCADE,
  program_name TEXT NOT NULL,
  completed_date TIMESTAMP DEFAULT NOW(),
  total_workouts INTEGER,
  weeks_completed INTEGER,
  total_exercises INTEGER,
  achievements JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Workout Feedback Table
CREATE TABLE workout_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES user_registration(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  difficulty TEXT,
  date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Program Template Table
CREATE TABLE program_template (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  creator_id UUID REFERENCES user_registration(id) ON DELETE CASCADE,
  weeks_count INTEGER,
  days_per_week INTEGER,
  schedule JSONB,
  shared_with JSONB,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Trainer Notification Table
CREATE TABLE trainer_notification (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trainer_id UUID REFERENCES user_registration(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_user_registration_email ON user_registration(email);
CREATE INDEX idx_user_registration_status ON user_registration(status);
CREATE INDEX idx_client_profile_user_id ON client_profile(user_id);
CREATE INDEX idx_workout_program_client_id ON workout_program(client_id);
CREATE INDEX idx_measurement_client_id ON measurement(client_id);
CREATE INDEX idx_exercise_log_client_id ON exercise_log(client_id);
CREATE INDEX idx_trainer_notification_trainer_id ON trainer_notification(trainer_id);
```

## 🔐 Шаг 3: Настройка Row Level Security (RLS)

Для безопасности нужно настроить правила доступа к данным:

```sql
-- Enable RLS on all tables
ALTER TABLE user_registration ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_program ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurement ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE completed_program ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_template ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_notification ENABLE ROW LEVEL SECURITY;

-- User Registration: allow anyone to insert (for registration)
CREATE POLICY "Anyone can register" ON user_registration
  FOR INSERT WITH CHECK (true);

-- User Registration: users can read their own data
CREATE POLICY "Users can read own registration" ON user_registration
  FOR SELECT USING (auth.uid()::text = id::text);

-- Client Profile: users can manage their own profile
CREATE POLICY "Users can manage own profile" ON client_profile
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Exercise Library: everyone can read
CREATE POLICY "Everyone can read exercises" ON exercise_library
  FOR SELECT USING (true);

-- Exercise Library: trainers can insert
CREATE POLICY "Trainers can add exercises" ON exercise_library
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_registration 
      WHERE id::text = auth.uid()::text 
      AND approved_role = 'trainer'
    )
  );

-- Workout Program: clients can read their own programs
CREATE POLICY "Clients can read own programs" ON workout_program
  FOR SELECT USING (auth.uid()::text = client_id::text);

-- Workout Program: trainers can create programs
CREATE POLICY "Trainers can create programs" ON workout_program
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_registration 
      WHERE id::text = auth.uid()::text 
      AND approved_role = 'trainer'
    )
  );

-- Measurement: clients can manage their own measurements
CREATE POLICY "Clients can manage own measurements" ON measurement
  FOR ALL USING (auth.uid()::text = client_id::text);

-- Exercise Log: clients can manage their own logs
CREATE POLICY "Clients can manage own logs" ON exercise_log
  FOR ALL USING (auth.uid()::text = client_id::text);
```

## ⚙️ Шаг 4: Настройка приложения

✅ **Уже настроено!** Ваши данные Supabase уже добавлены в `utils/supabase.js`:

```javascript
const SUPABASE_URL = 'https://rrbwrlahxdkkywiswygh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

## 🌐 Шаг 5: Развертывание на Netlify

### 5.1 Подготовка проекта

1. Создайте файл `netlify.toml` в корне проекта:

```toml
[build]
  publish = "."
  command = "echo 'No build needed'"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

2. Создайте файл `.gitignore`:

```
node_modules/
.env
.DS_Store
```

### 5.2 Развертывание

**Вариант A: Через GitHub**

1. Загрузите код на GitHub
2. Зайдите на [netlify.com](https://netlify.com)
3. Нажмите "New site from Git"
4. Выберите ваш репозиторий
5. Нажмите "Deploy site"

**Вариант B: Drag & Drop**

1. Зайдите на [netlify.com](https://netlify.com)
2. Перетащите папку с проектом на страницу

### 5.3 Настройка переменных окружения

1. В Netlify Dashboard откройте ваш сайт
2. Перейдите в **Site settings** → **Build & deploy** → **Environment**
3. Добавьте переменные:
   - `SUPABASE_URL` = ваш URL Supabase
   - `SUPABASE_ANON_KEY` = ваш anon ключ

## ✅ Проверка

1. Откройте ваш сайт на Netlify
2. Зарегистрируйтесь через `register.html`
3. Проверьте, что данные появились в Supabase
4. Одобрите пользователя через админ-панель
5. Войдите и проверьте все функции

## 🔧 Устранение неполадок

### Ошибка: "Supabase not configured"
- Проверьте, что вы добавили URL и ключ в `utils/supabase.js`

### Ошибка при создании таблиц
- Убедитесь, что UUID extension включен
- Проверьте синтаксис SQL

### Данные не сохраняются
- Проверьте RLS политики в Supabase
- Убедитесь, что пользователь авторизован

## 📊 Мониторинг

В Supabase Dashboard вы можете:
- Просматривать все данные в таблицах
- Следить за запросами в реальном времени
- Настраивать бэкапы базы данных

## 💰 Стоимость

**Supabase Free Plan:**
- ✅ 500MB базы данных
- ✅ 50,000 активных пользователей
- ✅ 1GB хранилища
- ✅ 2GB трафика/месяц

**Netlify Free Plan:**
- ✅ 100GB трафика/месяц
- ✅ Автоматический SSL
- ✅ Неограниченные сайты

**Итого: БЕСПЛАТНО** для большинства проектов! 🎉

---

**Готово!** Теперь у вас полностью автономное приложение на Supabase + Netlify! 🚀