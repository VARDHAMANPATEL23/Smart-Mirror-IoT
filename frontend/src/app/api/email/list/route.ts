import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Mirror from "@/models/Mirror";
import imaps from "imap-simple";
import { simpleParser } from "mailparser";

export async function POST(req: NextRequest) {
  let { emailAddress, appCode, mirrorId } = await req.json();

  if (!emailAddress || !appCode) {
    const session = await getServerSession(authOptions);
    await dbConnect();
    
    let user = null;
    if (session) {
      user = await User.findOne({ email: session.user?.email });
      console.log("[email/list] session user:", user?.email, "creds:", !!user?.serviceEmail, !!user?.serviceAppPassword);
    } else if (mirrorId) {
      console.log("[email/list] looking up mirror:", mirrorId);
      const mirror = await Mirror.findOne({ mirrorId: mirrorId });
      console.log("[email/list] mirror found:", !!mirror, "ownerId:", mirror?.ownerId);
      if (mirror?.ownerId) {
        user = await User.findById(mirror.ownerId);
        console.log("[email/list] owner found:", !!user, "creds:", !!user?.serviceEmail, !!user?.serviceAppPassword);
      }
    }

    if (user) {
      emailAddress = user.serviceEmail;
      appCode = user.serviceAppPassword;
    }
  }

  if (!emailAddress || !appCode) {
    return NextResponse.json({ message: "Missing credentials" }, { status: 400 });
  }

  const config = {
    imap: {
      user: emailAddress,
      password: appCode,
      host: "imap.gmail.com",
      port: 993,
      tls: true,
      authTimeout: 5000,
      tlsOptions: { rejectUnauthorized: false }
    }
  };

  try {
    const connection = await imaps.connect(config);
    await connection.openBox("INBOX");
    // Filter: Unread in Primary tab only (excludes Promotions, Social, Spam)
    const searchCriteria = ["UNSEEN", ["X-GM-RAW", "category:primary"]];
    const fetchOptions = { bodies: ["HEADER"], markSeen: false };

    const messages = await connection.search(searchCriteria, fetchOptions);
    
    const list = await Promise.all(
      messages.slice(-10).reverse().map(async (msg) => {
        const headerPart = msg.parts.find((p: any) => p.which === "HEADER");
        const headerBody = headerPart?.body;
        
        let subject = "No Subject";
        let from = "Unknown Sender";
        let date = new Date().toISOString();

        if (typeof headerBody === "string") {
          const parsed = await simpleParser(Buffer.from(headerBody));
          subject = parsed.subject || subject;
          from = parsed.from?.text || from;
          date = parsed.date ? parsed.date.toISOString() : date;
        } else if (headerBody && typeof headerBody === "object") {
          subject = headerBody.subject?.[0] || subject;
          from = headerBody.from?.[0] || from;
          date = headerBody.date?.[0] || date;
        }

        return {
          id: msg.attributes.uid,
          subject,
          from,
          date,
        };
      })
    );

    connection.end();
    return NextResponse.json(list);
  } catch (err: any) {
    console.error("Email Fetch Error:", err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
