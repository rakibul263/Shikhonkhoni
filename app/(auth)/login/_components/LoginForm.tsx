"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { ArrowRight, KeyRound, Loader2, Mail, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, type FormEvent } from "react";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { FaGithub } from "react-icons/fa";
import { toast } from "sonner";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 45;

function Spinner({ label }: { label: string }) {
  return (
    <span className="flex items-center justify-center gap-2">
      <Loader2 className="size-4 animate-spin text-current" />
      <span>{label}</span>
    </span>
  );
}

export default function LoginForm() {
  const router = useRouter();
  const [githubPending, startGithubTransition] = useTransition();
  const [sendPending, startSendTransition] = useTransition();
  const [verifyPending, startVerifyTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  async function signInWithGithub() {
    startGithubTransition(async () => {
      const { error } = await authClient.signIn.social({
        provider: "github",
        callbackURL: "/",
      });

      if (error) {
        toast.error(
          error.message || "GitHub sign-in failed. Please try again.",
        );
      }
    });
  }

  function sendOtp(event?: FormEvent) {
    event?.preventDefault();

    const target = email.trim();
    if (!target) {
      toast.error("Please enter your email address.");
      return;
    }

    startSendTransition(async () => {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email: target,
        type: "sign-in",
      });

      if (error) {
        toast.error(
          error.message || "Could not send the verification code. Please try again.",
        );
        return;
      }

      setOtp("");
      setOtpSent(true);
      setResendIn(RESEND_COOLDOWN_SECONDS);
      toast.success(`Verification code sent to ${target}`);
    });
  }

  function submitVerification() {
    if (verifyPending) return;

    if (otp.length !== OTP_LENGTH) {
      toast.error(`Please enter the complete ${OTP_LENGTH}-digit code.`);
      return;
    }

    startVerifyTransition(async () => {
      const { error } = await authClient.signIn.emailOtp({
        email: email.trim(),
        otp,
      });

      if (error) {
        toast.error(error.message || "Invalid or expired verification code.");
        return;
      }

      toast.success("Signed in successfully!");
      router.push("/");
      router.refresh();
    });
  }

  function verifyOtp(event: FormEvent) {
    event.preventDefault();
    submitVerification();
  }

  function changeEmail() {
    setOtpSent(false);
    setOtp("");
    setResendIn(0);
  }

  return (
    <Card className="w-full max-w-md rounded-2xl border-border/70 bg-card/85 backdrop-blur-xl shadow-xl shadow-primary/5 transition-all">
      <CardHeader className="text-center pb-2 pt-6 sm:pt-8 px-6 sm:px-8">
        <CardTitle className="text-2xl font-bold tracking-tight">
          {otpSent ? "Check your email" : "Welcome back"}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground mt-1">
          {otpSent
            ? "Enter the 6-digit code sent to your inbox"
            : "Sign in with GitHub or your email to continue"}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-5 px-6 sm:px-8 pb-8 pt-4">
        {otpSent ? (
          /* OTP Verification Form */
          <form onSubmit={verifyOtp} className="flex flex-col gap-5">
            <div className="flex flex-col items-center text-center">
              <div className="mb-3 flex size-12 items-center justify-center rounded-2xl border border-sky-500/20 bg-sky-500/10 text-sky-500 shadow-xs">
                <KeyRound className="size-5" />
              </div>
              <p className="text-xs text-muted-foreground">
                We sent a 6-digit code to
              </p>
              <div className="mt-1.5 inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/60 px-3 py-1 text-xs font-medium text-foreground">
                <span className="truncate max-w-[200px]">{email.trim()}</span>
                <button
                  type="button"
                  onClick={changeEmail}
                  className="inline-flex items-center gap-1 text-sky-500 hover:text-sky-400 font-medium transition-colors"
                  title="Change email"
                >
                  <Pencil className="size-3" />
                  <span className="underline">Edit</span>
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-border/80 bg-background/50 p-4 sm:p-5 flex justify-center shadow-xs">
              <InputOTP
                id="otp"
                aria-label="Verification code"
                maxLength={OTP_LENGTH}
                value={otp}
                onChange={setOtp}
                onComplete={submitVerification}
                pattern={REGEXP_ONLY_DIGITS}
                inputMode="numeric"
                autoComplete="one-time-code"
                disabled={verifyPending}
                containerClassName="justify-center"
              >
                <Label htmlFor="otp" className="sr-only">
                  Verification code
                </Label>
                <InputOTPGroup className="gap-1.5 sm:gap-2">
                  <InputOTPSlot index={0} className="size-10 sm:size-11 rounded-lg text-base font-bold border-border/80" />
                  <InputOTPSlot index={1} className="size-10 sm:size-11 rounded-lg text-base font-bold border-border/80" />
                  <InputOTPSlot index={2} className="size-10 sm:size-11 rounded-lg text-base font-bold border-border/80" />
                  <InputOTPSlot index={3} className="size-10 sm:size-11 rounded-lg text-base font-bold border-border/80" />
                  <InputOTPSlot index={4} className="size-10 sm:size-11 rounded-lg text-base font-bold border-border/80" />
                  <InputOTPSlot index={5} className="size-10 sm:size-11 rounded-lg text-base font-bold border-border/80" />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/15 transition-all hover:opacity-95"
              disabled={verifyPending || otp.length !== OTP_LENGTH}
            >
              {verifyPending ? (
                <Spinner label="Verifying code..." />
              ) : (
                "Verify & Continue"
              )}
            </Button>

            <div className="flex flex-col items-center gap-2 pt-1 text-center text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span>Didn&apos;t receive the email?</span>
                <button
                  type="button"
                  disabled={sendPending || resendIn > 0}
                  onClick={() => sendOtp()}
                  className="font-semibold text-primary hover:underline disabled:opacity-50 disabled:no-underline transition-opacity"
                >
                  {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground/80">
                Code expires in 5 minutes. Check spam folder if you don&apos;t see it.
              </p>
            </div>
          </form>
        ) : (
          /* Primary Login Form (GitHub + Email OTP) */
          <>
            <Button
              type="button"
              disabled={githubPending}
              onClick={signInWithGithub}
              className="w-full h-11 rounded-xl border border-border/80 bg-background/60 hover:bg-muted/70 hover:text-foreground font-medium transition-all shadow-xs gap-2.5"
              variant="outline"
              size="lg"
            >
              {githubPending ? (
                <Spinner label="Redirecting to GitHub..." />
              ) : (
                <span className="flex items-center justify-center gap-2.5">
                  <FaGithub className="size-4.5" />
                  <span className="text-sm">Continue with GitHub</span>
                </span>
              )}
            </Button>

            <div className="relative my-1 text-center text-xs after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border/70">
              <span className="relative z-10 bg-card px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Or continue with email
              </span>
            </div>

            <form onSubmit={sendOtp} className="flex flex-col gap-3.5">
              <div className="space-y-1.5">
                <Label
                  htmlFor="email"
                  className="text-xs font-semibold text-foreground/90 uppercase tracking-wider"
                >
                  Email address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    autoFocus
                    disabled={sendPending}
                    className="h-11 pl-10 rounded-xl bg-background/50 border-border/80 text-sm focus-visible:border-sky-500 focus-visible:ring-sky-500/20"
                  />
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/15 transition-all hover:opacity-95 gap-2"
                disabled={sendPending}
              >
                {sendPending ? (
                  <Spinner label="Sending code..." />
                ) : (
                  <>
                    <span>Send Login Code</span>
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>

              <p className="text-center text-[11px] text-muted-foreground pt-1">
                We will send a 6-digit one-time passcode to your email. Password-free.
              </p>
            </form>
          </>
        )}
      </CardContent>
    </Card>
  );
}
