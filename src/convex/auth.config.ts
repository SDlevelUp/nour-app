import type { AuthConfig } from "convex/server";

export default {
  providers: [
    // Convex Auth issues and validates this project's own tokens through its
    // OIDC discovery endpoint, served by auth.addHttpRoutes() in convex/http.ts.
    {
      domain: process.env.CONVEX_SITE_URL!,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
