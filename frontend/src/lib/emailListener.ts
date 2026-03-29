import EventEmitter from "events";
import imaps from "imap-simple";
import { simpleParser } from "mailparser";

/**
 * Singleton service for managing real-time IMAP connections within the Next.js process.
 */

const g = global as any;

if (!g._emailEventEmitter) {
  g._emailEventEmitter = new EventEmitter();
  g._emailEventEmitter.setMaxListeners(100);
}

if (!g._emailConnections) {
  g._emailConnections = new Map<string, any>();
}

export const emailEventEmitter: EventEmitter = g._emailEventEmitter;
const activeConnections: Map<string, any> = g._emailConnections;

function cleanMessage(raw: string) {
  if (!raw) return "No message";
  let text = raw.replace(/<[^>]*>/g, "");
  text = text.replace(/Content-Type:.*?\n/g, "");
  text = text.replace(/--.*?\n/g, "");
  return text.trim().substring(0, 200);
}

export async function ensureEmailListener(userEmail: string, appPassword: string) {
  if (!userEmail || !appPassword) return;

  const key = `${userEmail}`;
  if (activeConnections.has(key)) {
    return;
  }

  const config = {
    imap: {
      user: userEmail,
      password: appPassword,
      host: "imap.gmail.com",
      port: 993,
      tls: true,
      authTimeout: 5000,
      tlsOptions: { rejectUnauthorized: false }
    }
  };

  try {
    console.log(`📡 [Email] Connecting to IMAP for ${userEmail}...`);
    const connection = await imaps.connect(config);
    await connection.openBox("INBOX");
    
    activeConnections.set(key, connection);

    connection.imap.on("mail", async () => {
      console.log(`📩 [Email] New mail detected for ${userEmail}`);
      
      try {
        const messages = await connection.search(
          ["UNSEEN", ["X-GM-RAW", "category:primary"]],
          { bodies: ["HEADER.FIELDS (FROM SUBJECT DATE)", "TEXT"], struct: true }
        );

        if (messages.length === 0) return;

        // Get the latest unseen message
        const latest = messages.slice(-1);
        const emails = await Promise.all(latest.map(async (item: any) => {
          const headerPart = item.parts.find((p: any) => p.which.includes("HEADER"));
          const bodyPart = item.parts.find((p: any) => p.which === "TEXT");
          
          let from = "Unknown";
          let subject = "No Subject";
          let date = new Date().toISOString();

          if (typeof headerPart.body === "string") {
            const parsed = await simpleParser(Buffer.from(headerPart.body));
            from = parsed.from?.text || from;
            subject = parsed.subject || subject;
            date = parsed.date?.toISOString() || date;
          } else if (headerPart.body && typeof headerPart.body === "object") {
            from = headerPart.body.from?.[0] || from;
            subject = headerPart.body.subject?.[0] || subject;
            date = headerPart.body.date?.[0] || date;
          }

          let body = "No message";
          if (bodyPart && bodyPart.body) {
            body = cleanMessage(bodyPart.body);
          }

          return {
            from,
            subject,
            date,
            message: body
          };
        }));

        // Broadcast to all clients watching this email stream
        emailEventEmitter.emit(`mail:${userEmail}`, emails[0]);
      } catch (err: any) {
        console.error(`❌ [Email] Fetch error for ${userEmail}:`, err.message);
      }
    });

    connection.imap.on("error", (err: any) => {
      console.error(`❌ [Email] IMAP Error for ${userEmail}:`, err.message);
      activeConnections.delete(key);
    });

    connection.imap.on("end", () => {
      console.warn(`⚠️ [Email] Connection ended for ${userEmail}`);
      activeConnections.delete(key);
    });

  } catch (err: any) {
    console.error(`❌ [Email] Connection failed for ${userEmail}:`, err.message);
  }
}
