"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-service";
import { useState } from "react";
import { toast } from "sonner";

export function SignOutButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut();
      toast.success("Signed out successfully");
      // Force a hard navigation to home page
      window.location.href = "/";
    } catch (error) {
      toast.error("Failed to sign out");
      console.error(error);
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleSignOut} disabled={isLoading}>
      {isLoading ? "Signing out..." : "Sign Out"}
    </Button>
  );
}
