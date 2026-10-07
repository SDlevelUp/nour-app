import { Email } from "@convex-dev/auth/providers/Email";
import { RandomReader, generateRandomString } from "@oslojs/crypto/random";

export const emailOtp = Email({
  id: "email-otp",
  maxAge: 60 * 15, // 15 minutes
  // This function can be asynchronous
  async generateVerificationToken() {
    const random: RandomReader = {
      read(bytes: Uint8Array) {
        crypto.getRandomValues(bytes);
      },
    };
    const alphabet = "0123456789";
    return generateRandomString(random, alphabet, 6);
  },
  async sendVerificationRequest({ identifier: email, token }) {
    const mailerUrl = process.env.NOUR_MAILER_URL;
    const mailerApiKey = process.env.NOUR_MAILER_API_KEY;

    if (!mailerUrl || !mailerApiKey) {
      throw new Error(
        "NOUR_MAILER_URL and NOUR_MAILER_API_KEY must be configured in Convex.",
      );
    }

    const endpoint = new URL(mailerUrl);
    if (endpoint.protocol !== "https:") {
      throw new Error("NOUR_MAILER_URL must use HTTPS.");
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${mailerApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ to: email, otp: token }),
    });

    if (!response.ok) {
      throw new Error(`Nour email relay failed with HTTP ${response.status}.`);
    }

    const result: unknown = await response.json();
    if (
      typeof result !== "object" ||
      result === null ||
      !("ok" in result) ||
      result.ok !== true
    ) {
      throw new Error("Nour email relay returned an invalid response.");
    }
  },
});
