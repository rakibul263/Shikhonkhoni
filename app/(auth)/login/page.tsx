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
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { Loader } from "lucide-react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { FaGithub } from "react-icons/fa";
import { toast } from "sonner";

const LoginPage = () => {
  const router = useRouter();
  const [githubPending, githubTransication] = useTransition();

  async function signInWithGithub() {
    githubTransication(async () => {
      const { error } = await authClient.signIn.social({
        provider: "github",
        callbackURL: "/",
      });

      if (error) {
        toast.error(error.message || "GitHub sign-in failed. Please try again.");
      }
    });
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome Back!</CardTitle>
        <CardDescription>Login with you Github Email Account.</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <Button
          disabled={githubPending}
          onClick={signInWithGithub}
          className="w-full"
          variant="outline"
        >
          {githubPending ? (
            <span className="flex items-center gap-2">
              <Loader className="h-4 w-4 animate-spin" />
              <span>Loading...</span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <FaGithub className="h-4 w-4" />
              <span>Sign in with GitHub</span>
            </span>
          )}
        </Button>

        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after: items-center after:border-t after:border-border">
          <span className="relative z-10 bg-card px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>

        <div className="grid gap-3">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input type="email" placeholder="name@gmail.com" />
          </div>
          <Button>Continue with Email</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginPage;
