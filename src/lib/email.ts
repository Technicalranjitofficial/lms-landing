// ─── Email Service ────────────────────────────────────────────────────────────
// Currently stubs to console in dev. When mail creds are added:
//   1. npm install nodemailer @types/nodemailer
//   2. Uncomment the nodemailer block in sendMail() below
//   3. Fill EMAIL_SERVER_* vars in .env

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

async function sendMail(opts: SendMailOptions): Promise<void> {
  // Always log in dev for easy inspection
  if (process.env.NODE_ENV === "development") {
    console.log("\n─── [EMAIL] ───────────────────────────────────────────");
    console.log(`To:      ${opts.to}`);
    console.log(`Subject: ${opts.subject}`);
    console.log(`Text:    ${opts.text ?? "(html only)"}`);
    console.log("───────────────────────────────────────────────────────\n");
  }

  const host = process.env.EMAIL_SERVER_HOST;
  const user = process.env.EMAIL_SERVER_USER;
  const pass = process.env.EMAIL_SERVER_PASSWORD;

  // No SMTP creds → skip sending (dev mode already logged above)
  if (!host || !user || !pass) return;

  // ── TODO: uncomment when nodemailer is installed ──────────────────────────
  // npm install nodemailer @types/nodemailer
  //
  // const nodemailer = require("nodemailer");
  // const transporter = nodemailer.createTransport({
  //   host,
  //   port: Number(process.env.EMAIL_SERVER_PORT ?? 587),
  //   secure: Number(process.env.EMAIL_SERVER_PORT) === 465,
  //   auth: { user, pass },
  // });
  // await transporter.sendMail({
  //   from: process.env.EMAIL_FROM ?? "noreply@codepath.dev",
  //   to: opts.to,
  //   subject: opts.subject,
  //   html: opts.html,
  //   text: opts.text,
  // });
  console.warn("[EMAIL] SMTP creds set but nodemailer not installed. Run: npm install nodemailer @types/nodemailer");
}

// ─── Templates ────────────────────────────────────────────────────────────────

export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string
): Promise<void> {
  const appUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const verifyUrl = `${appUrl}/verify-email?token=${token}`;

  await sendMail({
    to: email,
    subject: "Verify your CGS email",
    text: `Hi ${name},\n\nVerify your email:\n${verifyUrl}\n\nThis link expires in 24 hours.\n\n— CGS Team`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#0a0a0a;color:#f2f2f2;border-radius:16px">
        <div style="margin-bottom:24px">
          <span style="font-size:22px;font-weight:900;color:#7c6fff">CGS</span>
          <p style="font-size:11px;color:#666;margin:2px 0 0">CG School of Technology</p>
        </div>
        <h1 style="font-size:20px;font-weight:700;margin:0 0 12px">Verify your email</h1>
        <p style="color:#888;line-height:1.6;margin:0 0 24px">Hi ${name}, thanks for signing up. Click below to verify your email and activate your account.</p>
        <a href="${verifyUrl}" style="display:inline-block;padding:14px 28px;background:linear-gradient(135deg,#9d96ff,#7c6fff);color:#fff;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px">
          Verify Email
        </a>
        <p style="color:#444;font-size:13px;margin-top:24px">Or copy this link:<br>
          <a href="${verifyUrl}" style="color:#7c6fff;word-break:break-all">${verifyUrl}</a>
        </p>
        <p style="color:#444;font-size:12px;margin-top:16px">Link expires in 24 hours. If you didn&apos;t sign up for CGS, ignore this email.</p>
      </div>
    `,
  });
}

export async function sendWelcomeEmail(email: string, name: string): Promise<void> {
  const appUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  await sendMail({
    to: email,
    subject: "Welcome to CGS 🎉",
    text: `Hi ${name},\n\nWelcome to CG School of Technology! Your account is active. Start learning at ${appUrl}/courses\n\n— CGS Team`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#0a0a0a;color:#f2f2f2;border-radius:16px">
        <div style="margin-bottom:24px">
          <span style="font-size:22px;font-weight:900;color:#7c6fff">CGS</span>
          <p style="font-size:11px;color:#666;margin:2px 0 0">CG School of Technology</p>
        </div>
        <h1 style="font-size:20px;font-weight:700;margin:0 0 12px">Welcome aboard, ${name}! 🎉</h1>
        <p style="color:#888;line-height:1.6;margin:0 0 24px">Your email is verified. Explore our courses and start your tech journey today.</p>
        <a href="${appUrl}/courses" style="display:inline-block;padding:14px 28px;background:linear-gradient(135deg,#9d96ff,#7c6fff);color:#fff;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px">
          Explore Courses
        </a>
      </div>
    `,
  });
}
