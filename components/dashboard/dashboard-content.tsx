"use client";

import { SignOutButton } from "../auth/sign-out-button";
import { useEffect, useState } from "react";
import { createClientBrowser } from "@/lib/supabase";

export function DashboardContent() {
  const [userName, setUserName] = useState<string>("User");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const supabase = createClientBrowser();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setUserName(user.user_metadata?.name || user.email || "User");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (isLoading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <SignOutButton />
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
