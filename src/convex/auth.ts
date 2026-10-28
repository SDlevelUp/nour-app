import { convexAuth } from "@convex-dev/auth/server";
import { Anonymous } from "@convex-dev/auth/providers/Anonymous";
import { Password } from "@convex-dev/auth/providers/Password";
import Google from "@auth/core/providers/google";
import { ConvexError } from "convex/values";
import { emailOtp, passwordReset, passwordVerify } from "./auth/emailOtp";

const google = Google({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
});

// E-mail + mot de passe (choix de Sarah, 2026-10-28) : un code à l'inscription pour
// confirmer l'adresse, puis plus de code ; « Mot de passe oublié » par code.
// Une adresse déjà vérifiée (code ou Google) est reliée au même espace.
const password = Password({
  verify: passwordVerify,
  reset: passwordReset,
  validatePasswordRequirements(value: string) {
    if (value.length < 8 || value.length > 128) {
      throw new ConvexError("Ton mot de passe doit contenir entre 8 et 128 caractères.");
    }
  },
});

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers:
    process.env.NOUR_DEMO_MODE === "true"
      ? [Anonymous]
      : [google, password, emailOtp, Anonymous],
});
