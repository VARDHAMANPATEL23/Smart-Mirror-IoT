# Vercel Deployment Guide — Smart Mirror Frontend

This guide describes how to deploy your Next.js Smart Mirror frontend to Vercel while keeping your AI Backend and Ollama local for maximum speed and privacy.

## **Architecture Overview**
- **Vercel**: Hosts the Global UI (Builder & Registry).
- **Home/Uni Server**: Hosts the local `backend/main.py` and `Ollama`.
- **Mirror**: Discovers the Local Server automatically via MongoDB.

---

## **1. Environment Variables**
Copy your local `.env.local` variables into the Vercel Dashboard (**Settings > Environment Variables**):

| Key | Value | Notes |
| :--- | :--- | :--- |
| `MONGODB_URI` | `mongodb+srv://...` | Same as your local cluster |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | **CRITICAL**: Use your production URL |
| `NEXTAUTH_SECRET` | `your_secret_string` | Generate a strong value |
| `MONGODB_DB` | `test` | Or your preferred name |

---

## **2. Deployment Steps (CLI)**
If you have the Vercel CLI installed:
```bash
# From the project root
cd frontend
vercel login
vercel link
vercel env pull
vercel --prod
```

---

## **3. Handling Insecure Origins (HTTP Local Backend)**
Vercel uses **HTTPS**. Browsers block HTTPS sites from calling local HTTP backends (e.g., `http://192.168.1.12:8000`). To fix this for your Mirror:

### **Option A: The Local Bypass (Recommended)**
Configure your Raspberry Pi's Chromium flags:
1. Navigate to: `chrome://flags/#unsafely-treat-insecure-origin-as-secure`
2. Add your Vercel URL: `https://your-mirror.vercel.app`
3. Restart Chromium.

### **Option B: Tailscale Funnel**
If you want to access your AI Backend globally (without being on the same WiFi):
```bash
tailscale funnel 8000
```
Then use the Tailscale URL as your `aiBackendUrl` in MongoDB.

---

## **4. Deployment Checklist**
- [ ] Vercel App is linked to your GitHub repo.
- [ ] MongoDB Atlas IP Whitelist includes `0.0.0.0/0` (Vercel uses dynamic IPs).
- [ ] NextAuth sessions are working on the production URL.

---

## **5. Maintenance**
- **Mirror ID**: Ensure your RPi matches the `MIRROR_ID` set in your local backend's `.env`.
- **Heartbeat**: Check your MongoDB `Mirror` collection to confirm the production frontend is seeing your local backend's registration.
