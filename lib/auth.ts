import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP } from "better-auth/plugins";
import { prisma } from "./db";
import { sendVerificationOtpEmail } from "./email";
import { env } from "./env";

const OTP_EXPIRES_IN_SECONDS = 300;

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  socialProviders: {
    github: {
      clientId: env.AUTH_GITHUB_CLIENT_ID,
      clientSecret: env.AUTH_GITHUB_SECRET,
    },
  },
  trustedOrigins: [env.BETTER_AUTH_URL],
  plugins: [
    emailOTP({
      expiresIn: OTP_EXPIRES_IN_SECONDS,
      async sendVerificationOTP(data) {
        await sendVerificationOtpEmail({
          ...data,
          from: env.EMAIL_FROM,
          siteUrl: env.BETTER_AUTH_URL,
          expiresInMinutes: Math.round(OTP_EXPIRES_IN_SECONDS / 60),
        });
      },
    }),
  ],
});
