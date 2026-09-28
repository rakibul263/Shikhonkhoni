import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { resend } from "./resend";

const SITE_NAME = "Shikhonkhoni";
const SITE_TAGLINE = "Learn Today, Build Tomorrow";
const LOGO_FILE = join(process.cwd(), "public", "logo.png");
const LOGO_CID = "shikhonkhoni-logo";
const EMAIL_FONT =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const MONO_FONT =
  "ui-monospace,SFMono-Regular,Menlo,Consolas,'Liberation Mono',monospace";

export type OtpType =
  | "sign-in"
  | "email-verification"
  | "forget-password"
  | "change-email";

const OTP_COPY: Record<
  OtpType,
  { subject: (otp: string) => string; heading: string; intro: string }
> = {
  "sign-in": {
    subject: (otp) => `${otp} is your ${SITE_NAME} sign-in code`,
    heading: "Sign in to your account",
    intro: "Use the verification code below to finish signing in to your account.",
  },
  "email-verification": {
    subject: (otp) => `${otp} is your ${SITE_NAME} verification code`,
    heading: "Verify your email address",
    intro: "Use the verification code below to confirm your email address.",
  },
  "forget-password": {
    subject: (otp) => `${otp} is your ${SITE_NAME} password reset code`,
    heading: "Reset your password",
    intro: "Use the verification code below to choose a new password.",
  },
  "change-email": {
    subject: (otp) => `${otp} is your ${SITE_NAME} email change code`,
    heading: "Confirm your new email",
    intro: "Use the verification code below to confirm your new email address.",
  },
};

const FALLBACK_COPY = OTP_COPY["email-verification"];

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ]!,
  );
}

let logoCache: Buffer | null | undefined;

async function loadLogo(): Promise<Buffer | null> {
  if (logoCache !== undefined) return logoCache;

  try {
    logoCache = await readFile(LOGO_FILE);
  } catch {
    console.warn(
      `[email] Logo not found at ${LOGO_FILE}, using hosted logo URL instead`,
    );
    logoCache = null;
  }

  return logoCache;
}

export function buildVerificationEmail({
  email,
  otp,
  type,
  logoSrc,
  siteUrl,
  expiresInMinutes,
}: {
  email: string;
  otp: string;
  type: OtpType;
  logoSrc: string;
  siteUrl: string;
  expiresInMinutes: number;
}) {
  const copy = OTP_COPY[type] ?? FALLBACK_COPY;
  const subject = copy.subject(otp);
  const baseUrl = siteUrl.replace(/\/$/, "");
  const siteHost = baseUrl.replace(/^https?:\/\//, "");
  const loginUrl = `${baseUrl}/login`;
  const year = new Date().getFullYear();
  const safeEmail = escapeHtml(email);

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <title>${subject}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#eef2f7;font-family:${EMAIL_FONT};color:#0f172a;-webkit-text-size-adjust:100%;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#eef2f7;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:0;height:6px;font-size:0;line-height:0;background-color:#00a3ff;background-image:linear-gradient(90deg,#00a3ff,#0b4da2);">&nbsp;</td>
            </tr>
            <tr>
              <td align="center" style="padding:36px 40px 0;">
                <img
                  src="${logoSrc}"
                  width="180"
                  alt="${SITE_NAME} &mdash; ${SITE_TAGLINE}"
                  style="display:block;width:180px;max-width:100%;height:auto;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;"
                />
              </td>
            </tr>
            <tr>
              <td style="padding:28px 40px 40px;">
                <h1 style="margin:0 0 10px;font-family:${EMAIL_FONT};font-size:22px;line-height:1.3;font-weight:700;color:#0f172a;text-align:center;">
                  ${copy.heading}
                </h1>
                <p style="margin:0 0 28px;font-family:${EMAIL_FONT};font-size:15px;line-height:1.6;color:#64748b;text-align:center;">
                  ${copy.intro}
                </p>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background-color:#eff6ff;border:1px dashed #93c5fd;border-radius:12px;">
                  <tr>
                    <td align="center" style="padding:26px 12px 22px;">
                      <div style="font-family:${MONO_FONT};font-size:34px;line-height:1;letter-spacing:10px;font-weight:700;color:#0b4da2;">
                        ${otp}
                      </div>
                      <div style="margin-top:14px;font-family:${EMAIL_FONT};font-size:11px;letter-spacing:1.4px;text-transform:uppercase;color:#2563eb;">
                        Valid for ${expiresInMinutes} minutes
                      </div>
                    </td>
                  </tr>
                </table>

                <p style="margin:20px 0 0;font-family:${EMAIL_FONT};font-size:13px;line-height:1.6;color:#64748b;text-align:center;">
                  This code was sent to
                  <strong style="color:#0f172a;">${safeEmail}</strong>
                </p>

                <div style="text-align:center;margin-top:28px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
                    <tr>
                      <td align="center" bgcolor="#0b4da2" style="border-radius:8px;">
                        <a
                          href="${loginUrl}"
                          style="display:inline-block;padding:12px 26px;font-family:${EMAIL_FONT};font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;border:1px solid #0b4da2;"
                        >
                          Open ${SITE_NAME}
                        </a>
                      </td>
                    </tr>
                  </table>
                </div>

                <hr style="border:0;border-top:1px solid #e2e8f0;margin:30px 0 22px;" />

                <p style="margin:0;font-family:${EMAIL_FONT};font-size:13px;line-height:1.65;color:#94a3b8;text-align:center;">
                  If you didn&rsquo;t request this code, you can safely ignore this email.
                  ${SITE_NAME} staff will never ask you for your code.
                </p>
              </td>
            </tr>
          </table>

          <p style="margin:20px 0 0;font-family:${EMAIL_FONT};font-size:12px;line-height:1.7;color:#94a3b8;text-align:center;">
            <strong style="color:#64748b;">${SITE_NAME}</strong> &middot; ${SITE_TAGLINE}<br />
            <a href="${baseUrl}" style="color:#0b4da2;text-decoration:none;">${siteHost}</a>
            &middot; &copy; ${year} ${SITE_NAME}. All rights reserved.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = `${SITE_NAME} — ${SITE_TAGLINE}

${copy.heading}

${copy.intro}

Your verification code: ${otp}

This code expires in ${expiresInMinutes} minutes and can only be used once.
It was sent to ${email}.

Open ${SITE_NAME}: ${loginUrl}

If you didn't request this code, you can safely ignore this email.

${SITE_NAME} · ${siteHost}
(c) ${year} ${SITE_NAME}
`;

  return { subject, html, text };
}

export async function sendVerificationOtpEmail({
  email,
  otp,
  type,
  from,
  siteUrl,
  expiresInMinutes,
}: {
  email: string;
  otp: string;
  type: OtpType;
  from: string;
  siteUrl: string;
  expiresInMinutes: number;
}) {
  try {
    const logo = await loadLogo();
    const { subject, html, text } = buildVerificationEmail({
      email,
      otp,
      type,
      logoSrc: logo
        ? `cid:${LOGO_CID}`
        : `${siteUrl.replace(/\/$/, "")}/logo.png`,
      siteUrl,
      expiresInMinutes,
    });

    const { error } = await resend.emails.send({
      from,
      to: [email],
      subject,
      html,
      text,
      attachments: logo
        ? [
            {
              content: logo,
              filename: "logo.png",
              contentType: "image/png",
              contentId: LOGO_CID,
            },
          ]
        : undefined,
    });

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : JSON.stringify(error ?? "unknown error");

    console.error(
      `[email] Failed to send verification OTP type=${type} to=${email} detail=${detail}`,
    );
    throw new Error("Failed to send verification email");
  }
}
