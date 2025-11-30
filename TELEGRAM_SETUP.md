# Быстрый Старт: Подключение к Telegram

## 🚀 За 5 Минут

### 1. Создайте бота
- Откройте [@BotFather](https://t.me/BotFather) в Telegram
- Отправьте `/newbot`
- Следуйте инструкциям
- **Сохраните токен!**

### 2. Настройте Web App
```
/setmenubutton → Выберите бота → Edit Menu Button
Текст: "Открыть приложение"
URL: https://your-domain.com/register.html
```

### 3. Добавьте команды
```
/setcommands → Вставьте:

start - Начать работу
help - Помощь
profile - Мой профиль
workouts - Тренировки
admin - Админ-панель
```

### 4. Разверните приложение
- Нажмите "Deploy" в Trickle
- Скопируйте URL
- Обновите URL в BotFather

### 5. Создайте бота (Python)

Создайте `bot.py`:
```python
from telegram import Update, WebAppInfo
from telegram.ext import Application, CommandHandler

BOT_TOKEN = "ваш_токен"
WEB_APP_URL = "https://ваш-домен.com"

async def start(update, context):
    await update.message.reply_text(
        "👋 Добро пожаловать!",
        reply_markup={
            "inline_keyboard": [[
                {"text": "🏋️ Открыть", 
                 "web_app": {"url": f"{WEB_APP_URL}/register.html"}}
            ]]
        }
    )

app = Application.builder().token(BOT_TOKEN).build()
app.add_handler(CommandHandler("start", start))
app.run_polling()
```

### 6. Запустите
```bash
pip install python-telegram-bot==20.7
python bot.py
```

## ✅ Готово!

Теперь найдите вашего бота в Telegram и нажмите `/start`

---

📚 **Полная инструкция:** См. `trickle/notes/telegram-bot-setup-guide.md`