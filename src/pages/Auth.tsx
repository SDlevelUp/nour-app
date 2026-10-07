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
import { ArrowRight, Loader2, Mail, MoonStar, UserX } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

interface AuthProps {
  redirectAfterAuth?: string;
}

function resolveRedirectAfterAuth(
  returnTo: string | null,
  fallback = "/dashboard",
) {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
    return returnTo;
  }
  return fallback;
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
  const [step, setStep] = useState<"signIn" | { email: string }>("signIn");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(redirect, { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate, redirect]);
  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      const email = String(formData.get("email") ?? "").trim();
      formData.set("email", email);
      await signIn("email-otp", formData);
      setStep({ email });
      setIsLoading(false);
    } catch (error) {
      console.error("Email sign-in error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Impossible d’envoyer le code de vérification. Réessayez.",
      );
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      navigate(redirect, { replace: true });
    } catch (error) {
      console.error("OTP verification error:", error);

      setError("Le code de vérification saisi est incorrect.");
      setIsLoading(false);

      setOtp("");
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("google", { redirectTo: redirect });
    } catch (error) {
      console.error("Google sign-in error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "La connexion avec Google a échoué. Réessayez.",
      );
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
      setError(
        `Connexion sans compte impossible : ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Auth Content */}
      <div className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="flex w-full max-w-sm flex-col items-center justify-center">
          <Card className="w-full pb-0 border shadow-md">
            {step === "signIn" ? (
              <>
                <CardHeader className="text-center">
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => navigate("/")}
                      aria-label="Retour à l’accueil"
                    >
                      <span className="mb-4 mt-4 flex size-16 items-center justify-center rounded-2xl bg-[#523B46] text-white">
                        <MoonStar className="size-8" aria-hidden="true" />
                      </span>
                    </button>
                  </div>
                  <CardTitle className="text-xl">
                    Bienvenue dans votre espace
                  </CardTitle>
                  <CardDescription>
                    {isDemoMode
                      ? "Mode test : commencez sans créer de compte."
                      : "Connectez-vous ou créez votre espace avec Google ou par e-mail"}
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
                    <form onSubmit={handleEmailSubmit}>
                      <CardContent className="pt-0">
                        <div className="relative flex items-center gap-2">
                          <div className="relative flex-1">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              name="email"
                              placeholder="vous@exemple.fr"
                              type="email"
                              className="pl-9"
                              autoComplete="email"
                              disabled={isLoading}
                              required
                            />
                          </div>
                          <Button
                            type="submit"
                            variant="outline"
                            size="icon"
                            aria-label="Envoyer le code de connexion"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <ArrowRight className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        {error && (
                          <p role="alert" className="mt-2 text-sm text-red-500">
                            {error}
                          </p>
                        )}
                      </CardContent>
                    </form>
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
                  {error && isDemoMode && (
                    <p role="alert" className="text-sm text-red-500">
                      {error}
                    </p>
                  )}
                </CardContent>
              </>
            ) : (
              <>
                <CardHeader className="text-center mt-4">
                  <CardTitle>Vérifiez votre e-mail</CardTitle>
                  <CardDescription>
                    Nous avons envoyé un code à {step.email}
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleOtpSubmit}>
                  <CardContent className="pb-4">
                    <input type="hidden" name="email" value={step.email} />
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
                    {error && (
                      <p className="mt-2 text-sm text-red-500 text-center">
                        {error}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground text-center mt-4">
                      Vous n’avez pas reçu de code ?{" "}
                      <Button
                        type="button"
                        variant="link"
                        className="p-0 h-auto"
                        onClick={() => setStep("signIn")}
                        disabled={isLoading}
                      >
                        Réessayer
                      </Button>
                    </p>
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
                          Vérifier le code
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setStep("signIn")}
                      disabled={isLoading}
                      className="w-full"
                    >
                      Utiliser une autre adresse
                    </Button>
                  </CardFooter>
                </form>
              </>
            )}

            <div className="py-4 px-6 text-center text-xs text-muted-foreground bg-muted border-t rounded-b-lg">
              Connexion sécurisée par Nour
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
