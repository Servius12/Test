# Настройка Telegram уведомлений для тренера

## Что вам нужно

1. **Токен бота** - получите у [@BotFather](https://t.me/BotFather)
2. **Chat ID тренера** - ваш личный Telegram ID

## Как получить ваш Chat ID

### Вариант 1: Через бота
1. Найдите [@userinfobot](https://t.me/userinfobot) в Telegram
2. Отправьте ему `/start`
3. Бот отправит вам ваш ID (например: `123456789`)
4. **Сохраните это число!**

### Вариант 2: Через JSON бота
1. Отправьте любое сообщение вашему боту
2. Откройте в браузере: `https://api.telegram.org/bot<ВАШ_ТОКЕН>/getUpdates`
3. Найдите `"chat":{"id": 123456789}` - это ваш Chat ID

## Настройка бота для уведомлений

Создайте файл `trainer_bot.py`:

```python
from telegram import Bot
from telegram.ext import Application, CommandHandler
import asyncio

# ===== ЗАМЕНИТЕ ЭТИ ЗНАЧЕНИЯ НА СВОИ =====
BOT_TOKEN = "123456789:ABCdefGHIjklMNOpqrsTUVwxyz"  # Токен от @BotFather
TRAINER_CHAT_ID = "987654321"  # Ваш Chat ID
WEB_APP_URL = "https://your-domain.com"  # URL вашего приложения
# =========================================

bot = Bot(token=BOT_TOKEN)

async def send_notification(message):
    """Отправить уведомление тренеру"""
    try:
        await bot.send_message(
            chat_id=TRAINER_CHAT_ID,
            text=f"🏋️ {message}"
        )
        print(f"✅ Уведомление отправлено: {message}")
    except Exception as e:
        print(f"❌ Ошибка отправки: {e}")

async def check_notifications():
    """Проверять новые уведомления каждые 30 секунд"""
    while True:
        try:
            # Здесь подключитесь к вашей базе данных
            # и проверьте новые уведомления
            
            # Пример (замените на реальную проверку):
            # notifications = get_unread_notifications()
            # for notif in notifications:
            #     await send_notification(notif['message'])
            #     mark_as_sent(notif['id'])
            
            pass
        except Exception as e:
            print(f"Ошибка проверки: {e}")
        
        await asyncio.sleep(30)  # Проверять каждые 30 секунд

async def start(update, context):
    """Команда /start"""
    await update.message.reply_text(
        f"👋 Привет, тренер!\n\n"
        f"Ваш Chat ID: {update.effective_chat.id}\n"
        f"Бот готов отправлять уведомления о завершенных тренировках."
    )

async def main():
    app = Application.builder().token(BOT_TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    
    # Запустить проверку уведомлений в фоне
    asyncio.create_task(check_notifications())
    
    print("🤖 Бот запущен! Отправляю уведомления тренеру...")
    await app.run_polling()

if __name__ == '__main__':
    asyncio.run(main())
```

## Установка и запуск

```bash
# Установить библиотеку
pip install python-telegram-bot==20.7

# Запустить бота
python trainer_bot.py
```

## Интеграция с веб-приложением

### Используя Webhook (рекомендуется)

Создайте `webhook_notifier.py`:

```python
from telegram import Bot
import os

BOT_TOKEN = os.getenv('BOT_TOKEN', 'ваш_токен')
TRAINER_CHAT_ID = os.getenv('TRAINER_CHAT_ID', 'ваш_chat_id')

bot = Bot(token=BOT_TOKEN)

async def notify_trainer(client_name, exercise_name):
    message = f"✅ {client_name} завершил тренировку: {exercise_name}"
    await bot.send_message(chat_id=TRAINER_CHAT_ID, text=message)
```

### Где указать данные

**В коде приложения** (файл `components/ExerciseModal.js`):

```javascript
// После сохранения тренировки
await fetch('https://your-api.com/notify-trainer', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    clientName: 'Иван Петров',
    exerciseName: exercise.name,
    trainerChatId: 'ВАШ_CHAT_ID'
  })
});
```

## Быстрый старт (5 минут)

1. Получите токен у @BotFather
2. Получите ваш Chat ID у @userinfobot
3. Вставьте эти данные в `trainer_bot.py`
4. Запустите: `python trainer_bot.py`
5. Отправьте боту `/start` чтобы проверить

## Тестирование

```python
# Тестовая отправка
import asyncio
from telegram import Bot

async def test():
    bot = Bot(token="ВАШ_ТОКЕН")
    await bot.send_message(
        chat_id="ВАШ_CHAT_ID", 
        text="🧪 Тест уведомления"
    )

asyncio.run(test())
```

## Переменные окружения (безопасность)

Создайте `.env` файл:
```
BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TRAINER_CHAT_ID=987654321
```

Используйте в коде:
```python
import os
from dotenv import load_dotenv

load_dotenv()
BOT_TOKEN = os.getenv('BOT_TOKEN')
TRAINER_CHAT_ID = os.getenv('TRAINER_CHAT_ID')
```

## Что дальше?

- Настройте автозапуск бота на сервере
- Используйте webhook вместо polling для продакшна
- Добавьте логирование ошибок
- Настройте разные типы уведомлений (тренировки, измерения, отзывы)