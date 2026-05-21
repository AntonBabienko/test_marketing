# 🚀 LeadFlow — Розумна обробка заявок

MVP платформа для автоматичної обробки, класифікації та маршрутизації лідів з AI-powered аналітикою.

## 💡 Концепція

Вся бізнес-логіка (нормалізація, скоринг, AI summary) живе в API — незалежно від зовнішніх сервісів. n8n використаний виключно як шар інтеграцій: якщо Google Sheets або Telegram змінять API, достатньо оновити ноду в n8n без торкання основного коду. Скоринг винесений в конфіг — легко адаптується під будь-яку логіку пріоритизації лідів.

## ⚡ Архітектура

```
Landing Page (Next.js) → API Route (Vercel Serverless)
                              ↓
                    1. Validate → 2. Normalize → 3. AI Summary → 4. Classify
                              ↓
                    5. Webhook → n8n Cloud → Google Sheets + Telegram
```

| Компонент | Технологія | Деплой |
|-----------|-----------|--------|
| Landing Page | Next.js 16 (App Router) | Vercel |
| API | Serverless API Routes | Vercel |
| AI Summary | Llama 3.1 8B (Groq) | Cloud API |
| Інтеграції | n8n | n8n Cloud |
| Зберігання | Google Sheets (через n8n) | Google |
| Нотифікації | Telegram Bot (через n8n) | Telegram |

## 📁 Структура

```
├── app/
│   ├── layout.js              # Root layout + SEO metadata
│   ├── page.js                # Landing page з формою
│   ├── globals.css            # Premium dark theme
│   └── api/lead/
│       └── route.js           # POST /api/lead — обробка заявок
├── lib/
│   ├── normalize.js           # Нормалізація даних (телефон, бюджет)
│   ├── classify.js            # Scoring та класифікація (Hot/Warm/Cold)
│   └── ai-summary.js          # Llama 3.1 8B (Groq) summary
├── n8n/
│   └── workflow.json          # Готовий n8n workflow для імпорту
├── test-payload.json          # Тестовий payload для API
├── .env.example               # Шаблон змінних оточення
└── package.json
```

## 🏁 Швидкий старт

```bash
# 1. Встановити залежності
npm install

# 2. Створити .env.local
cp .env.example .env.local
# Додати свій GROQ_API_KEY та N8N_WEBHOOK_URL

# 3. Запустити dev server
npm run dev
```

Відкрити [http://localhost:3000](http://localhost:3000)

## 🔧 Змінні оточення

| Змінна | Опис | Обов'язкова |
|--------|------|-------------|
| `GROQ_API_KEY` | API ключ Groq для AI summary (llama-3.1-8b-instant) | Ні (є fallback) |
| `N8N_WEBHOOK_URL` | URL вебхука n8n Cloud | Ні (логується warning) |

> **Примітка:** Без `GROQ_API_KEY` використовується шаблонний summary. Без `N8N_WEBHOOK_URL` вебхук не відправляється, але API працює повністю.

## 📡 API Reference

### `GET /api/lead` — Health Check

```json
{
  "status": "ok",
  "service": "Lead Processing MVP",
  "version": "1.0.0"
}
```

### `POST /api/lead` — Submit Lead

**Request:**
```json
{
  "name": "Олександр Петренко",
  "email": "alex@company.ua",
  "phone": "+380 67 123 45 67",
  "company": "ТОВ Діджитал Солюшнс",
  "budget": "50000",
  "urgency": "this_month",
  "service": "smm",
  "message": "Потрібна SMM-стратегія для нового продукту..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Заявку успішно отримано та оброблено",
  "data": {
    "id": "lead_mpe1y3ou_i5ao",
    "summary": "Олександр Петренко з компанії \"ТОВ Діджитал Солюшнс\" ...",
    "classification": {
      "score": 85,
      "category": "hot",
      "label": "🔥 Hot Lead"
    },
    "submitted_at": "2026-05-20T12:42:45.660Z"
  }
}
```

**Обов'язкові поля:** `name`, `email`

## 📊 Lead Scoring

| Фактор | Макс. балів | Логіка |
|--------|------------|--------|
| Бюджет | 50 | Пропорційно до 100 000 грн (налаштовується в `classify.js`) |
| Терміновість | 30 | asap/this_week=30, this_month=22, this_quarter=15, next_quarter=8, no_rush=3 |
| Повнота даних | 12 | 2.4 бали за кожне заповнене поле з 5 |
| Якість повідомлення | 8 | >200 символів=8, >100=6, >50=4, >20=2 |

| Score | Категорія | Emoji |
|-------|----------|-------|
| 70-100 | Hot | 🔥 |
| 40-69 | Warm | 🌡️ |
| 0-39 | Cold | ❄️ |

## 🔌 n8n Cloud Setup

1. Зареєструватися на [n8n.io](https://app.n8n.cloud/register)
2. Імпортувати `n8n/workflow.json`
3. Налаштувати credentials:
   - **Google Sheets OAuth2** — підключити свій Google акаунт
   - **Telegram Bot** — вставити токен бота та chat ID
4. Активувати workflow → скопіювати webhook URL
5. Додати URL до `.env.local` як `N8N_WEBHOOK_URL`

## 🚀 Deploy на Vercel

```bash
npm i -g vercel
vercel --prod
```

Додати env vars в Vercel Dashboard:
- `GROQ_API_KEY`
- `N8N_WEBHOOK_URL`

## 🧪 Тестування API

```powershell
# PowerShell
$body = Get-Content -Path "test-payload.json" -Raw
Invoke-RestMethod -Uri "http://localhost:3000/api/lead" -Method POST -Body $body -ContentType "application/json" | ConvertTo-Json -Depth 5
```

```bash
# curl
curl -X POST http://localhost:3000/api/lead \
  -H "Content-Type: application/json" \
  -d @test-payload.json
```

## 📝 Ліцензія

MIT
