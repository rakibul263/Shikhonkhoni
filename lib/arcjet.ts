import arcjet, {
  detectBot,
  fixedWindow,
  protectSignup,
  request,
  sensitiveInfo,
  shield,
  slidingWindow,
  tokenBucket,
  validateEmail,
} from "@arcjet/next";
import { env } from "./env";

// Re-export common Arcjet rules and utilities for easy consumption
export {
  detectBot,
  fixedWindow,
  protectSignup,
  request,
  sensitiveInfo,
  shield,
  slidingWindow,
  tokenBucket,
  validateEmail,
};

// Base Arcjet instance configured with attack protection (Shield)
// and rate limiting (200 requests per minute via sliding window).
// Additional rules can be added per route or action using aj.withRule(...)
export const aj = arcjet({
  key: env.ARCJET_KEY,
  rules: [
    shield({
      mode: "LIVE",
    }),
    slidingWindow({
      mode: "LIVE",
      interval: "1m",
      max: 200,
    }),
  ],
});

export default aj;
