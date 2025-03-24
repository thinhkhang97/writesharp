import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { SignOutForm } from "@/components/auth/sign-out-form";
import Link from "next/link";
import { FileText, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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

      <div className="bg-white p-6 rounded-lg shadow dark:bg-gray-800 mb-8">
        <h2 className="text-xl font-semibold mb-4">Welcome, {userName}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          You&apos;ve successfully logged in to WriteSharp. This is your
          dashboard where you&apos;ll see all your writing projects.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow dark:bg-gray-800">
          <div className="flex items-center mb-4">
            <FileText className="h-6 w-6 mr-2 text-blue-500" />
            <h3 className="text-lg font-semibold">My Drafts</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Manage all your writing drafts, ideas, and ongoing projects.
          </p>
          <Link href="/dashboard/drafts">
            <Button className="w-full">View Drafts</Button>
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow dark:bg-gray-800">
          <div className="flex items-center mb-4">
            <BarChart2 className="h-6 w-6 mr-2 text-green-500" />
            <h3 className="text-lg font-semibold">Your Skills</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Track your writing skill development and see personalized
            improvement tips.
          </p>
          <Link href="/dashboard/skills">
            <Button className="w-full bg-green-600 hover:bg-green-700">
              View Skills
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
