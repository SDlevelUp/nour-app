import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, UserX } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

interface AuthProps {
  redirectAfterAuth?: string;
}

type Mode = "signIn" | "signUp" | "forgot";
// Écran du code : confirmation de l'adresse (inscription) ou nouveau mot de passe (oubli).
type CodeStep = { kind: "verify" | "reset"; email: string };

function resolveRedirectAfterAuth(
  returnTo: string | null,
  fallback = "/dashboard",
) {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
    return returnTo;
  }
  return fallback;
}

// En production, Convex masque le détail des erreurs (« Server Error ») : un message
// clair par étape, sauf pour les erreurs volontaires (ConvexError) qui arrivent telles quelles.
function convexErrorMessage(error: unknown): string | null {
  if (error && typeof error === "object" && "data" in error) {
    const { data } = error as { data: unknown };
    if (typeof data === "string") return data;
  }
  return null;
}

function PasswordField({
  name,
  autoComplete,
  placeholder,
  disabled,
}: {
  name: string;
  autoComplete: string;
  placeholder: string;
  disabled: boolean;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" aria-hidden="true" />
      <Input
        name={name}
        type={visible ? "text" : "password"}
        placeholder={placeholder}
        className="px-9"
        autoComplete={autoComplete}
        minLength={8}
        maxLength={128}
        disabled={disabled}
        required
      />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
        aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = resolveRedirectAfterAuth(
    searchParams.get("returnTo"),
    redirectAfterAuth,
  );
  const [mode, setMode] = useState<Mode>("signIn");
  const [codeStep, setCodeStep] = useState<CodeStep | null>(null);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(redirect, { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate, redirect]);

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
  };

  const backToForm = () => {
    setCodeStep(null);
    setOtp("");
    setError(null);
  };

  const handlePasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    formData.set("email", email);
    formData.set("flow", mode);
    try {
      const result = await signIn("password", formData);
      if (result.signingIn) {
        navigate(redirect, { replace: true });
        return;
      }
      // Adresse pas encore confirmée : un code vient d'être envoyé.
      setCodeStep({ kind: "verify", email });
    } catch (error) {
      console.error("Password sign-in error:", error);
      setError(
        convexErrorMessage(error) ??
          (mode === "signUp"
            ? "Impossible de créer ton espace avec cette adresse. Si tu as déjà un mot de passe, utilise « Se connecter » ou « Mot de passe oublié »."
            : "E-mail ou mot de passe incorrect."),
      );
    }
    setIsLoading(false);
  };

  const handleForgotSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    try {
      await signIn("password", { email, flow: "reset" });
      setCodeStep({ kind: "reset", email });
    } catch (error) {
      console.error("Password reset error:", error);
      setError(
        "Aucun mot de passe n’est lié à cette adresse, ou le code n’a pas pu être envoyé. Si tu t’es inscrite avec un code ou avec Google, choisis « Créer mon espace » avec la même adresse.",
      );
    }
    setIsLoading(false);
  };

  const handleCodeSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!codeStep) return;
    setIsLoading(true);
    setError(null);
    const formData = new FormData(event.currentTarget);
    formData.set("flow", codeStep.kind === "verify" ? "email-verification" : "reset-verification");
    try {
      await signIn("password", formData);
      navigate(redirect, { replace: true });
    } catch (error) {
      console.error("Code verification error:", error);
      setError(
        convexErrorMessage(error) ??
          "Ce code est incorrect ou a expiré. Vérifie-le ou recommence pour en recevoir un nouveau.",
      );
      setOtp("");
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("google", { redirectTo: redirect });
    } catch (error) {
      console.error("Google sign-in error:", error);
      setError("La connexion avec Google a échoué. Réessaie.");
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("anonymous");
      navigate(redirect, { replace: true });
    } catch (error) {
      console.error("Guest login error:", error);
      setError("La connexion sans compte a échoué. Réessaie.");
      setIsLoading(false);
    }
  };

  const errorMessage = error && (
    <p role="alert" className="text-sm text-red-500">
      {error}
    </p>
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Auth Content */}
      <div className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="flex w-full max-w-sm flex-col items-center justify-center">
          <Card className="w-full pb-0 border shadow-md">
            {codeStep === null ? (
              <>
                <CardHeader className="text-center">
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => navigate("/")}
                      aria-label="Retour à l’accueil"
                    >
                      <span className="font-display mb-3 mt-4 block text-[30px] font-bold leading-none tracking-[-0.03em] text-foreground">
                        Rawdah
                      </span>
                    </button>
                  </div>
                  <CardTitle className="text-xl">
                    Bienvenue dans ton espace
                  </CardTitle>
                  <CardDescription>
                    {isDemoMode
                      ? "Mode test : commence sans créer de compte."
                      : "Connecte-toi ou crée ton espace avec Google ou par e-mail"}
                  </CardDescription>
                </CardHeader>
                {!isDemoMode && (
                  <>
                    <CardContent className="space-y-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <svg
                            aria-hidden="true"
                            className="mr-2 h-4 w-4"
                            viewBox="0 0 48 48"
                          >
                            <path
                              fill="#FFC107"
                              d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.9 6.1-15Z"
                            />
                            <path
                              fill="#4CAF50"
                              d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.6-5.1c-1.8 1.2-4.1 2-6.9 2-5.3 0-9.8-3.6-11.4-8.4H5.8v5.2A20 20 0 0 0 24 44Z"
                            />
                            <path
                              fill="#1976D2"
                              d="M12.6 27.7a12 12 0 0 1 0-7.4v-5.2H5.8a20 20 0 0 0 0 17.8l6.8-5.2Z"
                            />
                            <path
                              fill="#EA4335"
                              d="M24 11.9c3 0 5.7 1 7.8 3.1l5.8-5.8C34.1 5.9 29.5 4 24 4A20 20 0 0 0 5.8 15.1l6.8 5.2c1.6-4.8 6.1-8.4 11.4-8.4Z"
                            />
                          </svg>
                        )}
                        Continuer avec Google
                      </Button>
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-card px-2 text-muted-foreground">
                            Ou avec e-mail
                          </span>
                        </div>
                      </div>
                    </CardContent>

                    {mode === "forgot" ? (
                      <form onSubmit={handleForgotSubmit}>
                        <CardContent className="space-y-3 pt-0">
                          <p className="text-sm font-medium">Mot de passe oublié</p>
                          <p className="text-sm text-muted-foreground">
                            Indique ton adresse : tu reçois un code pour choisir un nouveau mot de passe.
                          </p>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              name="email"
                              placeholder="vous@exemple.fr"
                              type="email"
                              className="pl-9"
                              autoComplete="email"
                              autoCapitalize="none"
                              disabled={isLoading}
                              required
                            />
                          </div>
                          {errorMessage}
                          <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Recevoir un code
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            className="w-full"
                            onClick={() => switchMode("signIn")}
                            disabled={isLoading}
                          >
                            Retour à la connexion
                          </Button>
                        </CardContent>
                      </form>
                    ) : (
                      <form onSubmit={handlePasswordSubmit}>
                        <CardContent className="space-y-3 pt-0">
                          <div
                            role="tablist"
                            aria-label="Connexion ou inscription"
                            className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1"
                          >
                            {(
                              [
                                ["signIn", "Se connecter"],
                                ["signUp", "Créer mon espace"],
                              ] as const
                            ).map(([value, label]) => (
                              <button
                                key={value}
                                type="button"
                                role="tab"
                                aria-selected={mode === value}
                                onClick={() => switchMode(value)}
                                className={`rounded-md px-2 py-1.5 text-sm font-medium transition-colors ${
                                  mode === value
                                    ? "bg-card text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              name="email"
                              placeholder="vous@exemple.fr"
                              type="email"
                              className="pl-9"
                              autoComplete="email"
                              autoCapitalize="none"
                              disabled={isLoading}
                              required
                            />
                          </div>
                          <PasswordField
                            key={mode}
                            name="password"
                            autoComplete={mode === "signUp" ? "new-password" : "current-password"}
                            placeholder={mode === "signUp" ? "Choisis un mot de passe" : "Mot de passe"}
                            disabled={isLoading}
                          />
                          {mode === "signUp" && (
                            <p className="text-xs text-muted-foreground">
                              8 caractères minimum. Un code t’est envoyé une seule fois pour
                              confirmer ton adresse, ensuite ton mot de passe suffit.
                            </p>
                          )}
                          {errorMessage}
                          <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            {mode === "signUp" ? "Créer mon espace" : "Se connecter"}
                          </Button>
                          {mode === "signIn" ? (
                            <p className="text-center text-sm">
                              <Button
                                type="button"
                                variant="link"
                                className="h-auto p-0"
                                onClick={() => switchMode("forgot")}
                                disabled={isLoading}
                              >
                                Mot de passe oublié ?
                              </Button>
                            </p>
                          ) : (
                            <p className="text-center text-xs text-muted-foreground">
                              Déjà inscrite avec un code ou avec Google ? Crée ton mot de passe
                              ici avec la même adresse : tu retrouves ton espace.
                            </p>
                          )}
                        </CardContent>
                      </form>
                    )}
                  </>
                )}
                <CardContent className={isDemoMode ? "space-y-3" : "pt-0"}>
                  {isDemoMode && (
                    <p
                      role="note"
                      className="rounded-md bg-amber-500/10 p-3 text-sm text-amber-900 dark:text-amber-200"
                    >
                      Version de test : ne saisissez aucune vraie donnée
                      personnelle ou sensible. Les données ajoutées sont
                      enregistrées dans l’environnement de test.
                    </p>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleGuestLogin}
                    disabled={isLoading}
                  >
                    <UserX className="mr-2 h-4 w-4" />
                    {isDemoMode ? "Commencer le test" : "Continuer sans compte"}
                  </Button>
                  {isDemoMode && errorMessage}
                </CardContent>
              </>
            ) : (
              <>
                <CardHeader className="text-center mt-4">
                  <CardTitle>
                    {codeStep.kind === "verify" ? "Confirme ton adresse" : "Nouveau mot de passe"}
                  </CardTitle>
                  <CardDescription>
                    Nous avons envoyé un code à {codeStep.email}. Pense à regarder dans tes spams.
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleCodeSubmit}>
                  <CardContent className="space-y-4 pb-4">
                    <input type="hidden" name="email" value={codeStep.email} />
                    <input type="hidden" name="code" value={otp} />

                    <div className="flex justify-center">
                      <InputOTP
                        value={otp}
                        onChange={setOtp}
                        maxLength={6}
                        disabled={isLoading}
                        aria-label="Code de vérification à six chiffres"
                        onKeyDown={(e) => {
                          if (
                            e.key === "Enter" &&
                            otp.length === 6 &&
                            !isLoading
                          ) {
                            const form = (e.target as HTMLElement).closest(
                              "form",
                            );
                            if (form) {
                              form.requestSubmit();
                            }
                          }
                        }}
                      >
                        <InputOTPGroup>
                          {Array.from({ length: 6 }).map((_, index) => (
                            <InputOTPSlot key={index} index={index} />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                    {codeStep.kind === "reset" && (
                      <PasswordField
                        name="newPassword"
                        autoComplete="new-password"
                        placeholder="Nouveau mot de passe (8 caractères min.)"
                        disabled={isLoading}
                      />
                    )}
                    {error && (
                      <p role="alert" className="text-sm text-red-500 text-center">
                        {error}
                      </p>
                    )}
                  </CardContent>
                  <CardFooter className="flex-col gap-2">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading || otp.length !== 6}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Vérification…
                        </>
                      ) : (
                        <>
                          {codeStep.kind === "verify" ? "Confirmer" : "Enregistrer le mot de passe"}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={backToForm}
                      disabled={isLoading}
                      className="w-full"
                    >
                      Pas reçu de code ? Recommencer
                    </Button>
                  </CardFooter>
                </form>
              </>
            )}

            <div className="py-4 px-6 text-center text-xs text-muted-foreground bg-muted border-t rounded-b-lg">
              Connexion sécurisée par Rawdah
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}
