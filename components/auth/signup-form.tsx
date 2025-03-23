"use client";

import { useState } from "react";
import { toast } from "sonner";
import { signUp } from "@/app/auth/actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignUpForm() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await signUp(formData);

      if (result?.error) {
        setError(result.error);
        toast.error(result.error);
      }

      if (result?.success) {
        setSuccess(result.success);
        toast.success(result.success);
        // Clear the form
        const form = document.getElementById("signup-form") as HTMLFormElement;
        form?.reset();
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Something went wrong";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form id="signup-form" action={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-100 border border-red-200 rounded-md text-sm text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-100 border border-green-200 rounded-md text-sm text-green-600">
          {success}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          placeholder="John Doe"
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          disabled={isPending}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Creating account..." : "Sign Up"}
      </Button>
    </form>
  );
}
