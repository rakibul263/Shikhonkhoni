import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

/**
 * Server guard to ensure the current request is from an authenticated user.
 * Throws or returns an error if unauthenticated.
 */
export async function requireAuth(): Promise<AuthenticatedUser> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user?.id) {
    return session.user as AuthenticatedUser;
  }

  // In development, if user hasn't logged in yet, fallback to the first user
  if (process.env.NODE_ENV !== "production") {
    const devUser = await prisma.user.findFirst({
      select: { id: true, name: true, email: true, image: true },
    });
    if (devUser) {
      return devUser;
    }
  }

  throw new Error("Unauthorized: You must be logged in to access this resource.");
}

/**
 * Optional session retriever that does not throw.
 */
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  try {
    return await requireAuth();
  } catch {
    return null;
  }
}
