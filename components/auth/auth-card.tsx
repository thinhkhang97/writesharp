"use client";

import { useState } from "react";
import { LoginForm } from "./login-form";
import { SignUpForm } from "./signup-form";

type AuthMode = "login" | "signup";

export function AuthCard() {
  const [mode, setMode] = useState<AuthMode>("login");

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg dark:bg-gray-800">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold">
          {mode === "login" ? "Sign In" : "Create Account"}
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {mode === "login"
            ? "Don't have an account?"
            : "Already have an account?"}
          <button
            type="button"
            className="ml-1 font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
          >
            {mode === "login" ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>

      <div className="mt-8">
        {mode === "login" ? <LoginForm /> : <SignUpForm />}
      </div>
    </div>
  );
}
