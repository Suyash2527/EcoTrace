<div align="center">
  <img src="./client/public/vite.svg" alt="EcoTrace Logo" width="80" height="80">
  <h1 align="center">EcoTrace</h1>
  <p align="center">
    <strong>AI-Powered Carbon Footprint Tracking & Sustainability Coach</strong>
  </p>
</div>

---

**EcoTrace** is a modern, high-performance web application designed to help users track, understand, and reduce their personal carbon footprint. By integrating advanced generative AI (Google Gemini 2.5 Flash), EcoTrace acts as a personalized sustainability coach, offering predictive analysis and actionable insights tailored to your specific lifestyle.

## ✨ Features

- **🤖 AI Sustainability Coach**: Powered by Google's Gemini 2.5 Flash, get intelligent, context-aware advice, actionable tips, and lifestyle-specific carbon reduction strategies.
- **📊 Real-Time Impact Tracking**: A beautifully designed, glassmorphic dashboard showcasing daily trends, emission breakdowns, and rolling averages.
- **🌍 Demographic Benchmarking**: Instantly visualize how your footprint compares to both your country's national average and the global average.
- **📅 AI Annual Reports**: Generate comprehensive end-of-year sustainability audits. The AI analyzes your entire year of logged activities and compiles an in-depth markdown report.
- **📄 PDF Export with Charts**: Seamlessly export your Annual Report to PDF, complete with server-side generated impact comparison bar charts (via PDFKit).
- **🔮 Predictive Analytics**: Smart algorithms that predict the carbon cost of future activities before you log them, empowering proactive decision-making.
- **☁️ Cloud-Native Deployment**: Fully automated CI/CD pipeline integrated with Google Cloud Build and deployed securely on Google Cloud Run.

## 🛠️ Technology Stack

**Frontend**
- **Framework:** React 18 with Vite
- **Styling:** Tailwind CSS (featuring custom glassmorphism & vibrant aesthetics)
- **Routing:** React Router v6
- **Data Visualization:** Recharts, Custom CSS/Flexbox Charts

**Backend & AI**
- **Runtime:** Node.js (Express)
- **AI Integration:** Google Generative AI SDK (`gemini-2.5-flash`)
- **PDF Generation:** PDFKit
- **Validation:** Zod

**Infrastructure & Database**
- **Authentication:** Firebase Authentication (Email/Password)
- **Database:** Cloud Firestore (NoSQL)
- **Hosting:** Google Cloud Run (Serverless Docker Containers)
- **CI/CD:** Google Cloud Build

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js (v20+)
- Firebase Project with Authentication & Firestore enabled
- Google Gemini API Key

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/ecotrace.git
cd ecotrace
```

### 2. Environment Setup
Create a `.env` file in both the `/client` and `/server` directories.

**Client (`client/.env`)**
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**Server (`server/.env`)**
```env
PORT=8080
GEMINI_API_KEY=your_gemini_api_key
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY="your_private_key"
```

### 3. Install Dependencies & Run

Start the Backend Server:
```bash
cd server
npm install
npm run dev
```

Start the Frontend Application:
```bash
cd client
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

## 🚢 Deployment

EcoTrace uses Google Cloud Build for CI/CD. The `cloudbuild.yaml` at the root of the project defines a multi-stage Docker build that packages the Vite frontend into the Express server's static directory, and deploys the unified container to Cloud Run.

To deploy manually via gcloud:
```bash
gcloud builds submit --config cloudbuild.yaml --project your-gcp-project-id
```

## 🤝 Contributing
Contributions are welcome! Please open an issue or submit a pull request if you have any ideas, bug fixes, or enhancements.

## 📄 License
This project is licensed under the MIT License.
