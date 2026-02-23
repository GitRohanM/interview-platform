# 🧠 InterviewAI — AI-Powered Interview Preparation Platform

> MCA Final Year Major Project | 550 Marks | Full-Stack + AI/ML

[![CI/CD](https://img.shields.io/github/actions/workflow/status/yourusername/interviewai/ci-cd.yml?label=CI/CD)](https://github.com)
[![Node](https://img.shields.io/badge/Node.js-20-green)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://mongodb.com)
[![AI](https://img.shields.io/badge/AI-Claude%20API-purple)](https://anthropic.com)

---

## 📋 Table of Contents

1. [Project Overview](#overview)
2. [System Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Features](#features)
5. [Getting Started](#getting-started)
6. [API Documentation](#api-docs)
7. [Deployment Guide](#deployment)
8. [Security Implementation](#security)
9. [AI/ML Integration](#ai-ml)
10. [Project Structure](#structure)

---

## 🎯 Project Overview <a name="overview"></a>

InterviewAI is a production-grade, full-stack web application that helps students and professionals prepare for technical job interviews using real AI. The platform integrates Anthropic's Claude API for intelligent answer evaluation, NLP-powered resume analysis, and a conversational AI coach.

**Live Demo:** https://interviewai.vercel.app  
**API Base:** https://interviewai-backend.railway.app/api

---

## 🏗 System Architecture <a name="architecture"></a>

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (React)                        │
│  Auth → Dashboard → Interview → Resume → Coach → Analytics  │
└─────────────────┬───────────────────────────────────────────┘
                  │ HTTPS + JWT Bearer Token
┌─────────────────▼───────────────────────────────────────────┐
│              BACKEND (Node.js + Express)                     │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Auth   │  │Interview │  │  Resume  │  │Analytics │   │
│  │  Routes  │  │  Routes  │  │  Routes  │  │  Routes  │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       │              │              │              │          │
│  ┌────▼──────────────▼──────────────▼──────────────▼─────┐  │
│  │              Middleware Layer                           │  │
│  │   Auth (JWT) │ Rate Limiter │ Validation │ Error       │  │
│  └────┬──────────────────────────────────────────────────┘  │
│       │                                                      │
│  ┌────▼─────────────────────┐  ┌────────────────────────┐   │
│  │      AI Service          │  │     Database Layer     │   │
│  │  ┌─────────────────────┐ │  │  ┌──────────────────┐  │   │
│  │  │ Anthropic Claude API│ │  │  │  MongoDB Atlas   │  │   │
│  │  │ - Answer Evaluation │ │  │  │  - Users         │  │   │
│  │  │ - Resume NLP        │ │  │  │  - Sessions      │  │   │
│  │  │ - AI Coach Chat     │ │  │  │  - Questions     │  │   │
│  │  │ - Follow-up Gen     │ │  │  │  - Resumes       │  │   │
│  │  └─────────────────────┘ │  │  └──────────────────┘  │   │
│  └──────────────────────────┘  └────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠 Tech Stack <a name="tech-stack"></a>

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 | UI framework |
| Backend | Node.js + Express | REST API server |
| Database | MongoDB Atlas + Mongoose | Data persistence |
| AI/ML | Anthropic Claude API | Answer evaluation, NLP, coaching |
| Auth | JWT + bcrypt | Secure authentication |
| File Upload | Multer + pdf-parse | Resume PDF processing |
| Security | Helmet + CORS + Rate Limiting | Production hardening |
| Logging | Winston | Structured logs |
| Testing | Jest + Supertest | API testing |
| CI/CD | GitHub Actions | Automated pipeline |
| Deployment | Vercel + Railway | Frontend + Backend hosting |
| Containers | Docker + Docker Compose | Local dev environment |

---

## ✨ Features <a name="features"></a>

### 🔐 Authentication & Security
- JWT with access (15min) + refresh (7d) token rotation
- HTTP-only cookies for refresh token (XSS prevention)
- bcrypt password hashing (salt rounds: 12)
- Rate limiting (100 req/15min global, 10 auth attempts)
- Helmet.js security headers
- Input validation & sanitization

### 🎤 AI Mock Interview
- Role-configurable sessions (10 roles, 30+ questions)
- Real-time Claude AI answer evaluation
- Multi-dimensional scoring: Clarity, Depth, Relevance
- AI-generated follow-up questions
- Session persistence in MongoDB
- Time-limited questions with auto-submit
- Detailed per-question feedback

### 📄 Resume Analyzer (NLP)
- PDF upload + text extraction (pdf-parse)
- Claude AI deep analysis: skill extraction, ATS scoring
- Role-specific skill gap analysis
- 4-dimensional scoring: ATS, Skills, Format, Content
- 8+ actionable AI recommendations
- Analysis history stored in DB

### 💬 AI Interview Coach
- Conversational Claude-powered coach
- Context-aware multi-turn conversations
- Expertise: STAR method, salary negotiation, system design, behavioral Q&A
- Maintains conversation history

### 📊 Real Analytics
- All data aggregated from MongoDB (no fake numbers)
- Score trends, role performance, category breakdown
- Session history with full details

---

## 🚀 Getting Started <a name="getting-started"></a>

### Prerequisites
- Node.js 20+
- MongoDB Atlas account (free tier works)
- Anthropic API key

### Option A: Manual Setup (Recommended for understanding)

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/interviewai.git
cd interviewai

# 2. Setup backend
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI + Anthropic API key
npm install

# 3. Seed the question database
npm run seed

# 4. Start backend
npm run dev
# → Running on http://localhost:5000

# 5. Setup frontend (new terminal)
cd ../frontend
cp .env.example .env
npm install
npm start
# → Running on http://localhost:3000
```

### Option B: Docker (One command)

```bash
# Copy and fill environment variables
cp backend/.env.example backend/.env
# Edit backend/.env

# Start everything
docker-compose up --build
# → Frontend: http://localhost:3000
# → Backend:  http://localhost:5000
# → MongoDB:  localhost:27017
```

---

## 📡 API Documentation <a name="api-docs"></a>

### Authentication
```
POST /api/auth/register     → Register new user
POST /api/auth/login        → Login, returns access + sets refresh cookie
POST /api/auth/refresh      → Get new access token using refresh cookie
POST /api/auth/logout       → Clear refresh cookie
GET  /api/auth/me           → Get current user (protected)
```

### Interviews
```
POST /api/interviews/start                  → Create session, get questions
POST /api/interviews/:id/answer             → Submit + AI-evaluate answer
POST /api/interviews/:id/complete           → Finalize session, compute summary
POST /api/interviews/followup               → Generate AI follow-up question
GET  /api/interviews/sessions               → List user's sessions
GET  /api/interviews/sessions/:id          → Get full session with answers
```

### Resume
```
POST /api/resume/analyze     → Upload PDF / paste text → AI analysis
GET  /api/resume/history     → User's analysis history
```

### Analytics
```
GET /api/analytics/overview  → Stats, trends, role/category performance
GET /api/analytics/sessions  → Paginated session history
```

### Questions
```
GET /api/questions           → List questions (filter: role, difficulty, search)
GET /api/questions/roles     → Available roles
```

### Users
```
PUT  /api/users/profile      → Update profile
PUT  /api/users/password     → Change password
POST /api/users/coach        → Ask AI Coach (multi-turn)
```

---

## 🌐 Deployment <a name="deployment"></a>

### Backend → Railway

1. Push code to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Select the `backend` folder
4. Add Environment Variables in Railway dashboard:
   ```
   NODE_ENV=production
   MONGODB_URI=your_atlas_uri
   JWT_ACCESS_SECRET=your_secret
   JWT_REFRESH_SECRET=your_secret
   ANTHROPIC_API_KEY=your_key
   CLIENT_URL=https://your-app.vercel.app
   ```
5. Railway auto-deploys on every push to main ✅

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
2. Set root directory to `frontend`
3. Add Environment Variable:
   ```
   REACT_APP_API_URL=https://your-backend.railway.app/api
   ```
4. Deploy ✅

---

## 🔒 Security Implementation <a name="security"></a>

| Threat | Mitigation |
|--------|-----------|
| Password theft | bcrypt hashing, salt rounds 12 |
| XSS attacks | HTTP-only refresh token cookie |
| CSRF attacks | SameSite=strict cookie policy |
| Brute force | Rate limiter (10 auth attempts/15min) |
| Injection | express-validator, Mongoose type safety |
| Info disclosure | Helmet.js headers, errors sanitized in prod |
| Token theft | Short-lived access tokens (15min), rotation |
| File attacks | Multer type + size validation |

---

## 🤖 AI/ML Integration <a name="ai-ml"></a>

### Answer Evaluation (Claude Haiku)
Each answer is sent to Claude with a structured prompt that includes:
- The question asked
- The candidate's answer  
- Key concepts expected for that topic
- Role context

Claude returns a JSON object with 6 dimensions: overall score, clarity, depth, relevance, keywords matched/missed, and actionable feedback.

### Resume NLP (Claude Sonnet)
Resume text is parsed and sent to Claude Sonnet (more capable) with:
- The full resume text
- Target role
- Required skills list

Claude extracts structured data (skills, experience, education) and returns ATS score, skill gaps, and specific recommendations.

### AI Coach (Claude Haiku with conversation history)
Multi-turn conversation where the last 8 messages are sent as context on each request, allowing the coach to maintain awareness of the conversation flow.

---

## 📁 Project Structure <a name="structure"></a>

```
InterviewAI/
├── backend/
│   ├── config/          # DB connection, logger
│   ├── controllers/     # Business logic for each route
│   ├── middleware/       # Auth, rate limiter, error handler
│   ├── models/          # Mongoose schemas (User, Session, Question, Resume)
│   ├── routes/          # Express route definitions
│   ├── services/        # AI service (Claude), Token service
│   ├── utils/           # DB seeder
│   ├── tests/           # Jest + Supertest API tests
│   ├── uploads/         # Temp file storage (gitignored)
│   ├── .env.example
│   ├── Dockerfile
│   ├── railway.toml
│   └── server.js        # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── context/     # AuthContext (global auth state)
│   │   ├── utils/       # API client with auto-refresh
│   │   └── [components] # Your React UI components
│   ├── .env.example
│   └── package.json
│
├── .github/
│   └── workflows/
│       └── ci-cd.yml    # GitHub Actions CI/CD
│
├── docker-compose.yml
├── package.json
└── README.md
```

---

## 👥 Team & Acknowledgements

- **Developer:** [Your Name]
- **Guide:** [Prof. Name]
- **Institution:** [Your College], MCA Final Year
- **Session:** 2022–2024

**Powered by:** Anthropic Claude API | MongoDB Atlas | Railway | Vercel

---

*InterviewAI — Helping MCA students land their dream jobs, one interview at a time.*
