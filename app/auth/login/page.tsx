import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Login | WriteSharp",
  description: "Login to your WriteSharp account",
};

export default function LoginPage() {
  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg dark:bg-gray-800">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold">Sign In</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Don&apos;t have an account?
          <Link
            href="/auth/signup"
            className="ml-1 font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Sign Up
          </Link>
        </p>
      </div>

      <div className="mt-8">
        <LoginForm />
      </div>
    </div>
  );
}
