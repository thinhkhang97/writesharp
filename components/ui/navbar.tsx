"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, X } from "lucide-react";
import { signOut, getCurrentUser } from "@/lib/auth-service";

interface NavbarProps {
  initialUser?: User | null;
}

export function Navbar({ initialUser }: NavbarProps) {
  const [user, setUser] = useState<User | null>(initialUser || null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const fetchUser = async () => {
      if (!initialUser) {
        try {
          const currentUser = await getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          console.error("Error fetching user:", error);
          setUser(null);
        }
      }
    };

    fetchUser();
  }, [initialUser]);

  // Close mobile menu when pathname changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const navItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Drafts", href: "/drafts" },
    { name: "Skills", href: "/skills" },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white bg-opacity-80 backdrop-blur-sm border-b border-gray-200 py-4 px-6 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-12">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              WriteSharp
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  pathname === item.href ? "text-blue-600" : "text-gray-600"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMenu}
            className="p-1"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Desktop user info/auth */}
        <div className="hidden md:block">
          {user ? (
            <div className="flex items-center space-x-4">
              <div className="text-sm font-medium text-gray-700">
                {user.user_metadata?.name || user.email}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-gray-600 hover:text-red-600"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link href="/auth/signin">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button>Sign up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 pb-2">
          <div className="flex flex-col space-y-3 pt-2 border-t border-gray-200">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium px-2 py-1 transition-colors ${
                  pathname === item.href
                    ? "text-blue-600 bg-blue-50 rounded"
                    : "text-gray-600"
                }`}
              >
                {item.name}
              </Link>
            ))}

            {user ? (
              <div className="flex flex-col pt-2 border-t border-gray-200">
                <div className="text-sm font-medium text-gray-700 px-2 py-1">
                  {user.user_metadata?.name || user.email}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-gray-600 hover:text-red-600 justify-start px-2 py-1"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </Button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2 pt-2 border-t border-gray-200">
                <Link href="/auth/signin" className="px-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                  >
                    Sign in
                  </Button>
                </Link>
                <Link href="/auth/signup" className="px-2">
                  <Button size="sm" className="w-full">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
