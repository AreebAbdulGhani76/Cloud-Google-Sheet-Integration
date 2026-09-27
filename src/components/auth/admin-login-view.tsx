"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminLoginView() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quick fill function
  function fillCredentials() {
    setEmail("abdulghaniareeb@gmail.com");
    setPassword("Admin123");
    setErrorMessage(null);
    toast.info("Admin credentials pre-filled", {
      description: "Click 'Sign In' to authenticate.",
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    try {
      setIsLoading(true);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, remember }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Welcome back, Administrator!", {
          description: "Access granted to E-commerce Dashboard.",
        });
        // Redirect to ecommerce dashboard
        router.push("/dashboard/ecommerce");
        router.refresh();
      } else {
        setErrorMessage(data.error || "Invalid credentials. Please verify and try again.");
        toast.error("Authentication Failed", {
          description: data.error || "Please check your login details.",
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error. Please try again.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-background via-muted/40 to-background p-4 sm:p-8">
      {/* Background glow effects */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />

      <Card className="relative w-full max-w-md border-border/80 bg-card/85 shadow-2xl backdrop-blur-md">
        <CardHeader className="space-y-3 pb-6 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/25">
            <ShieldCheck className="size-6 text-primary" />
          </div>

          <div className="space-y-1">
            <CardTitle className="font-bold text-2xl tracking-tight">Admin Portal</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Sign in with your administrator credentials to access the Dashboard
            </CardDescription>
          </div>

          {/* Quick-fill helper banner */}
          <button
            type="button"
            onClick={fillCredentials}
            className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs transition-all hover:bg-primary/10"
          >
            <div className="flex items-center gap-2 text-left">
              <Sparkles className="size-3.5 text-primary shrink-0" />
              <div>
                <span className="font-medium text-foreground">Configured Admin Account</span>
                <span className="block text-[11px] text-muted-foreground font-mono">abdulghaniareeb@gmail.com</span>
              </div>
            </div>
            <Badge variant="secondary" className="text-[10px] shrink-0 font-normal">
              Quick Fill
            </Badge>
          </button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <Alert variant="destructive" className="py-2.5 text-xs">
                <AlertCircle className="size-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="admin-email" className="text-xs font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="abdulghaniareeb@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 h-10 text-sm"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="admin-password" className="text-xs font-medium">
                  Password
                </Label>
                <span className="text-[11px] text-muted-foreground">Case sensitive</span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-10 h-10 text-sm font-mono"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember-me" checked={remember} onCheckedChange={(c) => setRemember(Boolean(c))} />
                <Label htmlFor="remember-me" className="text-xs font-normal text-muted-foreground cursor-pointer">
                  Remember session (30 days)
                </Label>
              </div>

              <span className="text-[11px] font-mono text-muted-foreground">Admin123</span>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 font-medium text-sm gap-2 mt-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="size-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 border-t pt-4 text-center">
          <p className="text-[11px] text-muted-foreground">
            Protected with environment variables (<code className="font-mono text-primary">.env.local</code>)
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
