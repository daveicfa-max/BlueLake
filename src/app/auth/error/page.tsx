import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

type Props = {
  searchParams: Promise<{ reason?: string }>;
};

export default async function AuthErrorPage({ searchParams }: Props) {
  const { reason } = await searchParams;

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="flex max-w-sm flex-col items-center gap-4 text-center">
        <h1 className="text-2xl font-semibold">Sign-in failed</h1>
        <p className="text-sm text-muted-foreground">
          {reason
            ? decodeURIComponent(reason)
            : "Something went wrong. Please try again."}
        </p>
        <Link href="/login" className={buttonVariants()}>
          Back to sign in
        </Link>
      </div>
    </main>
  );
}
