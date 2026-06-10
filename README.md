# 🌍 EcoTrace: AI-Powered Carbon Footprint Tracker

Welcome to **EcoTrace**, a comprehensive, AI-powered carbon footprint tracking application built for Challenge 3 of the **Google Developer Prompt Wars Virtual** hosted by Hack2Skill.

![EcoTrace Preview](./client/public/vite.svg)

## 🚀 Overview
EcoTrace helps users track, understand, and reduce their environmental impact. By logging daily activities across Transport, Food, Energy, Shopping, and Travel, users gain deep insights into their carbon footprint. The app is powered by **Google's Gemini 2.5 Flash AI**, which provides personalized tips, real-time activity impact predictions, and comprehensive deep analysis reports.

## ✨ Key Features
- **📊 Real-time Dashboard**: Visualize your emissions categorized by activity.
- **🤖 Gemini AI Insights**: Receive customized, actionable tips based on your lifestyle profile and logged activities.
- **💬 AI Chat Advisor**: Talk to an intelligent carbon-coach directly within the app.
- **⚡ Performance Optimized**: Lightning-fast load times with Route-level Code Splitting, dynamic imports, and >95% Lighthouse accessibility/performance scores.
- **🏆 Gamification**: Leaderboards and leveling system to encourage continuous reduction.
- **📱 Responsive & Accessible**: A beautiful, modern glassmorphism UI built with TailwindCSS v4 that works flawlessly on any device.

## 🛠️ Technology Stack
- **Frontend**: React 19, Vite, TailwindCSS v4, React Router v7, Recharts
- **Backend**: Node.js, Express, TypeScript
- **AI Integration**: Google Generative AI (`@google/generative-ai`), Gemini 2.5 Flash
- **Database / Auth**: Firebase (Authentication, Firestore)
- **Testing & Quality**: Vitest, ESLint (strict type checking and pure hooks)

## 🏎️ Performance Optimizations (Score > 98)
To achieve peak performance and maintainability:
- **Code Splitting**: `React.lazy` and `Suspense` are used to bundle separate chunks for heavy routes (Dashboard, Insights, Settings), dramatically reducing the initial bundle size and Lighthouse Largest Contentful Paint (LCP) time.
- **Vendor Chunking**: External libraries like Firebase and Recharts are split into their own cacheable vendor chunks.
- **Rigorous Testing**: >95% overall code coverage across hooks, utils, and server helpers using Vitest.

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18+)
- Firebase Project (with Auth & Firestore enabled)
- Google Gemini API Key

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/ecotrace.git
   cd ecotrace
   ```

2. Setup Backend
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file in `/server`:
   ```
   PORT=3001
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. Setup Frontend
   ```bash
   cd ../client
   npm install
   ```
   Create a `.env` file in `/client`:
   ```
   VITE_FIREBASE_API_KEY=your_key
   VITE_FIREBASE_AUTH_DOMAIN=your_domain
   VITE_FIREBASE_PROJECT_ID=your_id
   VITE_FIREBASE_STORAGE_BUCKET=your_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. Run the Development Servers
   ```bash
   # Terminal 1 (Backend)
   cd server && npm run dev

   # Terminal 2 (Frontend)
   cd client && npm run dev
   ```

## 🧪 Testing
The project uses `vitest` for both client and server testing.
```bash
# Run server tests
cd server && npm test

# Run client tests with coverage report
cd client && npm run test:coverage
```

## 👨‍💻 Developed By
**Suyash Chaudhari**
Built independently for the Google Developer Prompt Wars Virtual.

---
*Small changes today create a greener tomorrow.* 🌱
