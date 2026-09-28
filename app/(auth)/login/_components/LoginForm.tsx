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
import { Loader, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, type FormEvent } from "react";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { FaGithub } from "react-icons/fa";
import { toast } from "sonner";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 45;

function Spinner({ label }: { label: string }) {
  return (
    <span className="flex items-center gap-2">
      <Loader className="h-4 w-4 animate-spin" />
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
      toast.error("Enter your email address.");
      return;
    }

    startSendTransition(async () => {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email: target,
        type: "sign-in",
      });

      if (error) {
        toast.error(
          error.message || "Could not send the code. Please try again.",
        );
        return;
      }

      setOtp("");
      setOtpSent(true);
      setResendIn(RESEND_COOLDOWN_SECONDS);
      toast.success(`Code sent to ${target}`);
    });
  }

  function submitVerification() {
    if (verifyPending) return;

    if (otp.length !== OTP_LENGTH) {
      toast.error(`Enter the ${OTP_LENGTH}-digit code.`);
      return;
    }

    startVerifyTransition(async () => {
      const { error } = await authClient.signIn.emailOtp({
        email: email.trim(),
        otp,
      });

      if (error) {
        toast.error(error.message || "Invalid or expired code.");
        return;
      }

      toast.success("Signed in successfully.");
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
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Welcome Back!</CardTitle>
        <CardDescription>Sign in with GitHub or your email.</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <Button
          disabled={githubPending}
          onClick={signInWithGithub}
          className="w-full"
          size="lg"
          variant="outline"
        >
          {githubPending ? (
            <Spinner label="Redirecting..." />
          ) : (
            <span className="flex items-center gap-2">
              <FaGithub className="h-4 w-4" />
              <span>Sign in with GitHub</span>
            </span>
          )}
        </Button>

        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-card px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>

        {otpSent ? (
          <form onSubmit={verifyOtp} className="flex flex-col gap-5">
            <div className="flex flex-col items-center text-center">
              <div className="mb-3 flex size-11 items-center justify-center rounded-full border border-border bg-muted text-foreground">
                <Mail className="size-5" />
              </div>
              <h3 className="text-base font-semibold">
                Enter verification code
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                We sent a {OTP_LENGTH}-digit code to
                <br />
                <span className="font-medium break-all text-foreground">
                  {email.trim()}
                </span>
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-muted/30 p-4 transition-shadow focus-within:border-ring/60 focus-within:ring-4 focus-within:ring-ring/20">
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
                <InputOTPGroup>
                  <InputOTPSlot index={0} className="size-10 text-base" />
                  <InputOTPSlot index={1} className="size-10 text-base" />
                  <InputOTPSlot index={2} className="size-10 text-base" />
                  <InputOTPSlot index={3} className="size-10 text-base" />
                  <InputOTPSlot index={4} className="size-10 text-base" />
                  <InputOTPSlot index={5} className="size-10 text-base" />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={verifyPending || otp.length !== OTP_LENGTH}
            >
              {verifyPending ? (
                <Spinner label="Verifying..." />
              ) : (
                "Verify and continue"
              )}
            </Button>

            <div className="flex flex-col items-center gap-1.5 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <span>Didn&apos;t get the code?</span>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  disabled={sendPending || resendIn > 0}
                  onClick={() => sendOtp()}
                >
                  {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
                </Button>
              </div>
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={changeEmail}
              >
                Change email address
              </Button>
              <p className="mt-1 text-xs text-muted-foreground/80">
                The code expires in 5 minutes. Check your spam folder if you
                don&apos;t see it.
              </p>
            </div>
          </form>
        ) : (
          <form onSubmit={sendOtp} className="grid gap-3">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@gmail.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoFocus
                className="h-10"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={sendPending}
            >
              {sendPending ? (
                <Spinner label="Sending..." />
              ) : (
                "Continue with Email"
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
