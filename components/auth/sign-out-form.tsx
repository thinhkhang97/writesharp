"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "@/app/auth/actions";
import { useState } from "react";
import { toast } from "sonner";

export function SignOutForm() {
  const [isPending, setIsPending] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsPending(true);
      await signOut();
      // No need to redirect here as the server action will handle it
    } catch {
      toast.error("Failed to sign out");
      setIsPending(false);
    }
  };

  return (
    <Button onClick={handleSignOut} disabled={isPending}>
      {isPending ? "Signing out..." : "Sign Out"}
    </Button>
  );
}
