# 🧠 QuizMind AI — Smart Adaptive Quiz Application

An AI-powered quiz app that adapts difficulty in real-time based on your performance. Built with React, Node.js, MongoDB, and Groq (LLaMA3).

---

## 🚀 Features

- **AI Question Generation** — Unique questions every time via Groq LLaMA3
- **Adaptive Difficulty** — Gets harder on 2+ correct streak, easier after wrong answers
- **Any Topic** — Type anything: React, World War II, Biology, Finance...
- **Detailed Reports** — Accuracy, difficulty breakdown, AI-generated study tips
- **Authentication** — JWT-based login/register
- **Quiz History** — Review past quizzes and reports

---

## 📁 Project Structure

```
smart-quiz-app/
├── backend/           # Node.js + Express API
│   ├── controllers/   # Groq AI logic
│   ├── middleware/    # JWT auth middleware
│   ├── models/        # MongoDB schemas
│   ├── routes/        # API routes
│   └── server.js
├── frontend/          # React + Vite + Tailwind
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       └── utils/
└── README.md
```

---

## ⚙️ Prerequisites

- Node.js v18+
- MongoDB (local) or MongoDB Atlas URI
- Groq API Key → https://console.groq.com

---

## 🛠️ Setup Instructions

### 1. Clone / Extract
```bash
cd smart-quiz-app
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart-quiz
JWT_SECRET=your_super_secret_key_change_this
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxx
```

Start the backend:
```bash
npm run dev     # Development (with nodemon)
# OR
npm start       # Production
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

Visit: **http://localhost:3000**

---

## 🔑 Getting a Groq API Key

1. Go to https://console.groq.com
2. Sign up / Log in
3. Navigate to **API Keys**
4. Click **Create API Key**
5. Copy the key starting with `gsk_...`
6. Paste into `backend/.env`

---

## 🎮 How the Adaptive Algorithm Works

| Condition | Action |
|-----------|--------|
| 2+ correct in a row | Increase difficulty |
| 1 wrong answer | Decrease difficulty |
| Difficulty at max (hard) | Stay at hard |
| Difficulty at min (easy) | Stay at easy |

Difficulty levels: `easy → medium → hard`

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| POST | /api/quiz/start | Start new quiz |
| POST | /api/quiz/answer | Submit answer + get next Q |
| GET | /api/quiz/history | Get quiz history |
| GET | /api/report/:sessionId | Get full quiz report |

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| AI | Groq SDK (LLaMA3 8B) |
| Auth | JWT + bcryptjs |

---

## 📦 Production Build

```bash
# Build frontend
cd frontend && npm run build

# Serve with backend (optional - serve dist as static)
cd backend && npm start
```
