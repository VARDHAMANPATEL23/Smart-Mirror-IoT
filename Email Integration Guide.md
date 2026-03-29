# Smart Mirror — Email Widget Integration Guide

> **Overview:** This guide walks through integrating a Node.js email backend (from your ZIP) into your Smart Mirror project as a new Email Widget module.

**Project context:** Your ZIP contains a Node.js backend with email fetching logic. Your Smart Mirror likely uses a React/web frontend on a Raspberry Pi display.

---

## Overall Plan

1. Extract email logic from ZIP backend
2. Turn it into an API service
3. Connect it to your Smart Mirror frontend
4. Create a new widget component
5. Register it in your dashboard layout

---

## Step 1 — Setup Email Backend Service

### 1.1 Extract the Backend

Unzip and locate:

```
email section/backend/
```

Inside you'll find:

- `server.js` / `index.js` — entry point
- `node_modules` — ignore
- `package.json`

### 1.2 Install Dependencies

```bash
cd backend
npm install
```

### 1.3 Identify Email Logic

Look for:

- IMAP / POP3 usage (`imap`, `mailparser`, etc.)
- Credentials (email + password or app password)
- Fetch function

You'll likely see something like:

```js
imap.connect()
imap.on('mail', ...)
```

### 1.4 Convert into API Endpoint

Modify the backend to expose a `GET /emails` route:

```js
app.get("/emails", async (req, res) => {
  try {
    const emails = await fetchEmails(); // your existing logic
    res.json(emails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

### 1.5 Standardize Response Format

Ensure the backend returns the following shape:

```json
[
  {
    "from": "example@gmail.com",
    "subject": "Hello",
    "date": "2026-03-28T10:30:00Z",
    "snippet": "Preview text..."
  }
]
```

### 1.6 Run the Backend

```bash
node server.js
```

Confirm the endpoint is accessible at:

```
http://localhost:PORT/emails
```

---

## Step 2 — Integrate into Smart Mirror Project

Navigate to your repository root:

```
Smart-Mirror-IoT/
```

### 2.1 Create an API Service File

Create the file `/src/services/emailService.js`:

```js
export async function fetchEmails() {
  const res = await fetch("http://localhost:PORT/emails");
  if (!res.ok) throw new Error("Failed to fetch emails");
  return res.json();
}
```

---

## Step 3 — Create the Email Widget Component

### 3.1 Create the File

```
/src/widgets/EmailWidget.jsx
```

### 3.2 Widget Implementation

```jsx
import { useEffect, useState } from "react";
import { fetchEmails } from "../services/emailService";

export default function EmailWidget() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmails();
    const interval = setInterval(loadEmails, 60000); // refresh every 60s
    return () => clearInterval(interval);
  }, []);

  async function loadEmails() {
    try {
      const data = await fetchEmails();
      setEmails(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="email-widget">
      <h2>📧 Emails</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {emails.slice(0, 5).map((email, i) => (
            <li key={i}>
              <strong>{email.from}</strong>
              <br />
              <span>{email.subject}</span>
              <br />
              <small>{new Date(email.date).toLocaleTimeString()}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

## Step 4 — Style the Widget

Create `/src/styles/emailWidget.css`:

```css
.email-widget {
  color: white;
  padding: 10px;
  font-family: sans-serif;
}

.email-widget h2 {
  font-size: 18px;
  margin-bottom: 10px;
}

.email-widget ul {
  list-style: none;
  padding: 0;
}

.email-widget li {
  margin-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
```

---

## Step 5 — Register Widget in Dashboard

Find your main layout file:

```
/src/App.jsx
OR
/src/components/Dashboard.jsx
```

### 5.1 Import the Widget

```js
import EmailWidget from "./widgets/EmailWidget";
```

### 5.2 Add to Layout

```jsx
<div className="dashboard">
  <ClockWidget />
  <WeatherWidget />
  <EmailWidget /> {/* ADD HERE */}
</div>
```

---

## Step 6 — Handle CORS

> **Important:** Without this, your frontend will be blocked from reaching the backend.

In your backend entry file:

```js
const cors = require("cors");
app.use(cors());
```

---

## Step 7 — Email Security

> **Warning:** Do not use your real email password in code.

Use a **Gmail App Password** and store credentials in environment variables.

Create a `.env` file in your backend directory:

```
EMAIL_USER=your@email.com
EMAIL_PASS=your_app_password
```

---

## Step 8 — Auto-Start on Raspberry Pi

Run both services on boot:

```bash
node backend/server.js
npm run dev   # frontend
```

Recommended process managers:

- **PM2** — simple Node.js process manager
- **systemd** — native Linux service manager

---

## Step 9 — Test Checklist

- [ ] Backend returns valid email JSON at `/emails`
- [ ] Frontend fetch succeeds without CORS errors
- [ ] Widget updates every 60 seconds
- [ ] Display fits within mirror layout

---

## Optional Improvements

You can extend the widget later with:

- Unread count badge
- Sender avatars
- Voice read-out via TTS
- Swipe gestures
- Email filtering by sender or label

---

## Final Architecture

```
[ Email Server ]
       ↓
[ Node Backend (ZIP logic) ]
       ↓  GET /emails
[ Smart Mirror Frontend ]
       ↓
[ Email Widget UI ]
```

---

## Next Steps

Choose what to tackle next:

- **Refactor** the ZIP backend into clean, production-ready code
- **Design** a premium mirror-style UI (Apple / Jarvis aesthetic) for the widget
- **Integrate** with your AI assistant system
