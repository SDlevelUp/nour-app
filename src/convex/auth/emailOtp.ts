import { Email } from "@convex-dev/auth/providers/Email";
import { RandomReader, generateRandomString } from "@oslojs/crypto/random";

// Envoie le code à six chiffres via le relais Hostinger (voir hostinger-mailer/README.md).
async function sendCodeByEmail(email: string, token: string) {
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
}

// Même code à six chiffres (valable 15 minutes) pour chaque usage, seul l'identifiant change.
function emailCodeProvider(id: string) {
  return Email({
    id,
    maxAge: 60 * 15, // 15 minutes
    async generateVerificationToken() {
      const random: RandomReader = {
        read(bytes: Uint8Array) {
          crypto.getRandomValues(bytes);
        },
      };
      return generateRandomString(random, "0123456789", 6);
    },
    async sendVerificationRequest({ identifier: email, token }) {
      await sendCodeByEmail(email, token);
    },
  });
}

// Connexion par code seul (anciennes inscrites ; plus proposée sur la page).
export const emailOtp = emailCodeProvider("email-otp");
// Code envoyé une seule fois à l'inscription par mot de passe, pour confirmer l'adresse.
export const passwordVerify = emailCodeProvider("password-verify");
// Code de « Mot de passe oublié ».
export const passwordReset = emailCodeProvider("password-reset");
