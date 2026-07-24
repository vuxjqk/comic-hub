"use client";

import { useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { LogOutIcon, UserIcon } from "lucide-react";
import { toast } from "react-toastify";

import AppLogo from "@/components/app-logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";

import { clearSession } from "@/actions/auth";
import { useAuth } from "@/context/auth-context";

export default function Navigation() {
  const router = useRouter();
  const { user, setUser, authLoading } = useAuth();

  const [loading, setLoading] = useState<boolean>(false);

  const handleSignOut = async () => {
    setLoading(true);
    const { success, message } = await clearSession();

    if (success) {
      setUser(null);
      router.push("/");
      router.refresh();
    }

    toast[success ? "success" : "error"](message);
    setLoading(false);
  };

  if (authLoading) {
    return (
      <div className="h-16 flex items-center justify-center">
        <Spinner className="size-2.5" />
      </div>
    );
  }

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <AppLogo />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar>
                  <AvatarImage
                    src={`${process.env.NEXT_PUBLIC_API_URL}/${user.avatar}`}
                  />
                  <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <UserIcon />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  disabled={loading}
                  onClick={handleSignOut}
                >
                  <LogOutIcon />
                  {loading ? <Spinner /> : "Sign out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/sign-in">Sign in</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/sign-up">Sign up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
