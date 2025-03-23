import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { SignOutForm } from "@/components/auth/sign-out-form";

export const metadata = {
  title: "Dashboard | WriteSharp",
  description: "Welcome to your WriteSharp dashboard",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/login");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userName = user?.user_metadata?.name || user?.email || "User";

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <SignOutForm />
      </div>

      <div className="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
        <h2 className="text-xl font-semibold mb-4">Welcome, {userName}</h2>
        <p className="text-gray-600 dark:text-gray-400">
          You&apos;ve successfully logged in to WriteSharp. This is your
          dashboard where you&apos;ll see all your writing projects.
        </p>
      </div>
    </div>
  );
}
