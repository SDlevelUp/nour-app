import { convexAuth } from "@convex-dev/auth/server";
import { Anonymous } from "@convex-dev/auth/providers/Anonymous";
import Google from "@auth/core/providers/google";
import { emailOtp } from "./auth/emailOtp";

const google = Google({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
});

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers:
    process.env.NOUR_DEMO_MODE === "true"
      ? [Anonymous]
      : [google, emailOtp, Anonymous],
});
