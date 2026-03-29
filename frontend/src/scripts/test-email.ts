import imaps from "imap-simple";
import { simpleParser } from "mailparser";

// 🛑 REPLACE THESE WITH YOUR ACTUAL VALUES
const TEST_EMAIL = "pvandan29@gmail.com";
const TEST_PASSWORD = "oeuuvbqqjqldddza";

const config = {
  imap: {
    user: TEST_EMAIL,
    password: TEST_PASSWORD,
    host: "imap.gmail.com",
    port: 993,
    tls: true,
    authTimeout: 5000,
    tlsOptions: { rejectUnauthorized: false }
  }
};

async function testConnection() {
  console.log("📡 Attempting to connect to Gmail IMAP...");
  console.log(`📧 User: ${TEST_EMAIL}`);
  console.log("🔑 Password: [HIDDEN]");

  //@ts-ignore
  if (TEST_EMAIL === "ENTER_GMAIL_HERE") {
    console.error("❌ ERROR: You must update the TEST_EMAIL variable in the script!");
    process.exit(1);
  }

  try {
    const connection = await imaps.connect(config);
    console.log("✅ SUCCESS: Connected to IMAP server!");

    await connection.openBox("INBOX");
    console.log("✅ SUCCESS: Opened INBOX!");

    const searchCriteria = ["UNSEEN"];
    const fetchOptions = {
      bodies: ["HEADER", "TEXT"],
      markSeen: false
    };

    console.log("📬 Searching for UNSEEN messages...");
    const messages = await connection.search(searchCriteria, fetchOptions);
    console.log(`📬 Found ${messages.length} UNSEEN messages.`);

    if (messages.length === 0) {
      console.log("⚠️ No unread messages found. Trying to find ALL messages instead...");
      const allMessages = await connection.search(["ALL"], { bodies: ["HEADER"], markSeen: false });
      console.log(`📬 Found ${allMessages.length} total messages in INBOX.`);
    }

    if (messages.length > 0) {
      console.log("📩 Parsing the latest unseen email...");
      const latest = messages[messages.length - 1];
      const headerPart = latest.parts.find((p: any) => p.which.includes("HEADER"));
      
      if (headerPart && headerPart.body) {
        try {
          const rawHeader = typeof headerPart.body === 'string' ? headerPart.body : JSON.stringify(headerPart.body);
          const parsed = await simpleParser(Buffer.from(rawHeader));
          console.log(`✅ SUCCESS! Parsed Email Details:`);
          console.log(`   👉 Subject: "${parsed.subject}"`);
          console.log(`   👉 From: ${parsed.from?.text}`);
          console.log(`   👉 Date: ${parsed.date}`);
        } catch (parseErr: any) {
          console.error("❌ PARSE FAILED!");
          console.error(parseErr.message);
          console.log("Raw Header body type:", typeof headerPart.body);
        }
      }
    }

    connection.end();
    console.log("👋 Connection closed safely.");
    process.exit(0);

  } catch (err: any) {
    console.error("❌ CONNECTION FAILED!");
    console.error("--------------------------------------------------");
    console.error(`ERROR TYPE: ${err.code || "unknown"}`);
    console.error(`MESSAGE: ${err.message}`);

    if (err.message.includes("Application-specific password required")) {
      console.error("\n💡 FIX: You are using your normal password. You MUST use a 16-character App Password.");
    } else if (err.message.includes("Invalid credentials")) {
      console.error("\n💡 FIX: Check your email and 16-character password for typos.");
    } else if (err.message.includes("IMAP not enabled")) {
      console.error("\n💡 FIX: You must enable IMAP in your Gmail Settings -> Forwarding and POP/IMAP.");
    }

    process.exit(1);
  }
}

testConnection();
