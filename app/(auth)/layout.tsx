import { buttonVariants } from "@/components/ui/button";
import logoImage from "@/public/logo.png";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center">
      <Link
        href={"/"}
        className={buttonVariants({
          variant: "outline",
          className: "absolute top-4 left-4",
        })}
      >
        <ArrowLeft className="size-4" />
        Back
      </Link>
      <div className="w-full max-w-sm gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 self-center font-medium justify-center"
        >
          <Image src={logoImage} alt="Logo" width={150} height={150} />
        </Link>
        {children}
        <div className="text-balance text-center text-xs text-muted-foreground mt-3">
          By clicking continue, you agree to out{" "}
          <span className="hover:text-primary hover:underline">
            Terms of Service
          </span>{" "}
          and{" "}
          <span className="hover:text-primary hover:underline">
            Privacy policy
          </span>
          .
        </div>
      </div>
    </div>
  );
}
