import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router";

// Délai maximal d'attente du retour de Google avant de renvoyer vers /auth.
const AUTH_CODE_TIMEOUT_MS = 10_000;

/**
 * Protège une page réservée aux personnes connectées.
 *
 * Au retour de Google, l'URL porte un `?code=` que Convex Auth échange contre
 * une session : pendant cet échange, on affiche « Connexion en cours… » au lieu
 * de conclure trop tôt que la personne n'est pas connectée (cause du « il faut
 * se connecter deux fois »). Sans session, on renvoie directement vers la page
 * de connexion, qui ramène ici via `returnTo`.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const hasAuthCode = params.has("code");
  const [codeTimedOut, setCodeTimedOut] = useState(false);

  useEffect(() => {
    if (!hasAuthCode) return;
    const timer = window.setTimeout(() => setCodeTimedOut(true), AUTH_CODE_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [hasAuthCode]);

  const waitingForGoogle = hasAuthCode && !codeTimedOut;

  if (isLoading || (!isAuthenticated && waitingForGoogle)) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden="true" />
        <p role="status" className="text-sm text-muted-foreground">
          {hasAuthCode ? "Connexion en cours…" : "Chargement de ton espace…"}
        </p>
      </main>
    );
  }

  if (!isAuthenticated) {
    params.delete("code");
    const search = params.toString();
    const returnTo = `${location.pathname}${search ? `?${search}` : ""}`;
    return <Navigate to={`/auth?returnTo=${encodeURIComponent(returnTo)}`} replace />;
  }

  return children;
}
