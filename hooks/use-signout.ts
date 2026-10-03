"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export interface SignOutOptions {
  redirectTo?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useSignOut() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function signOut(options?: SignOutOptions) {
    const redirectTo = options?.redirectTo ?? "/";
    setIsLoading(true);

    try {
      const { error } = await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            options?.onSuccess?.();
          },
          onError: (ctx) => {
            const err = new Error(ctx.error.message || "Failed to sign out");
            options?.onError?.(err);
          },
        },
      });

      if (error) {
        toast.error(error.message || "Failed to sign out. Please try again.");
        options?.onError?.(new Error(error.message));
        setIsLoading(false);
        return;
      }

      toast.success("Signed out successfully");

      // Full navigation to ensure all client and server caches & session cookies are cleared
      if (typeof window !== "undefined") {
        window.location.href = redirectTo;
      } else {
        router.push(redirectTo);
        router.refresh();
      }
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to sign out");
      toast.error(
        error.message || "An unexpected error occurred during sign out.",
      );
      options?.onError?.(error);
      setIsLoading(false);
    }
  }

  return {
    signOut,
    isPending: isLoading,
    isLoading,
  };
}

export default useSignOut;

