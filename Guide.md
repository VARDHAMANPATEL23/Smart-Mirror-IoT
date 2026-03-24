# Smart Mirror IoT Platform — Implementation Guide

This guide describes how to set up and deploy the Smart Mirror system. The AI modules and local Python backend have been removed to prioritize a lightweight, cloud-managed dashboard for Raspberry Pi displays.

---

## 🏗️ Architecture
- **Frontend (Next.js 15)**: Hosted on Vercel. Manages the Mirror UI, Layout Builder, and API routes.
- **Database (MongoDB Atlas)**: Stores mirror configurations, user layouts, and task lists.
- **Mirror (Raspberry Pi)**: Runs a full-screen browser pointing to the Mirror ID URL.

---

## 🛠️ Step 1: Environment Setup
Copy the following keys into your \`/frontend/.env.local\` and your Vercel Environment Variables:

| Key | Description |
| :--- | :--- |
| \`MONGODB_URI\` | Connection string for your MongoDB Atlas cluster. |
| \`NEXTAUTH_URL\` | Your production URL (e.g., \`https://mirror.vercel.app\`). |
| \`NEXTAUTH_SECRET\` | A strong random string for session encryption. |

---

## 🖥️ Step 2: Running Locally
Navigate to the frontend directory and install dependencies:
\`\`\`bash
cd frontend
bun install     # or npm install
npm run dev
\`\`\`

---

## 🧩 Step 3: Mirror Configuration
1. **Register Mirror**: Use the **Display Builder** page to register a new \`Mirror ID\` and \`PIN\`.
2. **Build Layout**: Drag and drop widgets (Clock, Weather, News, Tasks) into the 560x1080 simulator.
3. **Publish**: Click "Publish Layout" to sync changes to the database.

---

## 📺 Step 4: Raspberry Pi Setup
To turn your RPi into a dedicated mirror display:

1. **Auto-Login**:
   - Navigate to \`/rpi-login\` on your Pi.
   - Enter your \`Mirror ID\` and \`PIN\`. This will store the session in LocalStorage.
2. **Kiosk Mode**:
   Set Chromium to launch on boot in fullscreen:
   \`\`\`bash
   chromium-browser --kiosk --incognito https://your-app.vercel.app/mirror/[YOUR_MIRROR_ID]
   \`\`\`

---

## 📦 Step 5: Features & Widgets
- **Clock**: Synchronized local time.
- **Weather**: Real-time forecast updates.
- **News**: Global headlines via BBC RSS integration.
- **Tasks**: Interactive to-do list managed from the builder.
- **Project Title**: Customizable header for your mirror.

---

## 🧹 Maintenance & Cleanup
Since the AI backend and face visualizers were removed:
- **Ollama**: No longer required.
- **Python Backend**: Redundant and removed.
- **IP Discovery**: The mirror now discovers its layout directly via the Mirror ID slug.
