import Link from "next/link";
import { SignUpForm } from "@/components/auth/signup-form";

export const metadata = {
  title: "Sign Up | WriteSharp",
  description: "Create a new WriteSharp account",
};

export default function SignUpPage() {
  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg dark:bg-gray-800">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold">Create Account</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Already have an account?
          <Link
            href="/auth/login"
            className="ml-1 font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Sign In
          </Link>
        </p>
      </div>

      <div className="mt-8">
        <SignUpForm />
      </div>
    </div>
  );
}
