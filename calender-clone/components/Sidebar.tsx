"use client";

import { userApi } from "@/lib/api";
import {
  Calendar,
  Clock,
  Copy,
  ExternalLink,
  Link2,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const menuItems = [
  { href: "/", icon: Link2, label: "Event types" },
  { href: "/bookings", icon: Calendar, label: "Bookings" },
  { href: "/availability", icon: Clock, label: "Availability" },
];

interface UserData {
  name: string;
  email: string;
}

export default function Sidebar() {
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);
  const [user, setUser] = useState<UserData | null>(() => {
    // Initialize from sessionStorage if available
    if (typeof window !== "undefined") {
      const cached = sessionStorage.getItem("sidebar_user");
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {
          return null;
        }
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(!user); // Only show loading if we don't have cached data
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // Only fetch if we don't have cached data and haven't fetched yet
    if (!user && !hasFetchedRef.current) {
      fetchUser();
      hasFetchedRef.current = true;
    } else if (user) {
      // If we have cached data, we're done loading
      setLoading(false);
    }

    // Listen for user update events from settings page
    const handleUserUpdate = (event: CustomEvent) => {
      // Only update when Settings page dispatches the event with user data
      if (event.detail) {
        const updatedUser = event.detail;
        setUser(updatedUser);
        // Cache the updated user data
        if (typeof window !== "undefined") {
          sessionStorage.setItem("sidebar_user", JSON.stringify(updatedUser));
        }
      }
    };

    window.addEventListener("userUpdated", handleUserUpdate as EventListener);

    return () => {
      window.removeEventListener(
        "userUpdated",
        handleUserUpdate as EventListener
      );
    };
  }, []); // Empty dependency array - only run on mount

  const fetchUser = async () => {
    try {
      const response = await userApi.get();
      const userData = response.data;
      setUser(userData);
      // Cache the user data in sessionStorage
      if (typeof window !== "undefined") {
        sessionStorage.setItem("sidebar_user", JSON.stringify(userData));
      }
    } catch (error) {
      console.error("Error fetching user in sidebar:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPublicLink = () => {
    const publicUrl =
      typeof window !== "undefined" ? window.location.origin : "";
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return (
      name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "U"
    );
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-[#1a1a1a] border-r border-[#2a2a2a] flex flex-col">
      {/* User Profile */}
      <div className="p-6 border-b border-[#2a2a2a]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#3a3a3a] flex items-center justify-center text-white font-semibold">
            {loading ? "..." : user ? getInitials(user.name) : "U"}
          </div>
          <div>
            <div className="text-white font-medium">
              {loading ? "Loading..." : user ? user.name : "User"}
            </div>
            <div className="text-sm text-gray-400">
              {loading ? "..." : user ? user.email : "email@example.com"}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? "bg-[#2a2a2a] text-white"
                      : "text-gray-400 hover:bg-[#2a2a2a] hover:text-white"
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer Links */}
      <div className="p-4 border-t border-[#2a2a2a] space-y-1">
        <Link
          href="/public"
          target="_blank"
          className="flex items-center gap-3 px-4 py-2.5 text-gray-400 hover:bg-[#2a2a2a] hover:text-white rounded-lg transition-colors"
        >
          <ExternalLink size={20} />
          <span className="font-medium">View public page</span>
        </Link>
        <button
          onClick={handleCopyPublicLink}
          className="flex items-center gap-3 px-4 py-2.5 text-gray-400 hover:bg-[#2a2a2a] hover:text-white rounded-lg transition-colors w-full"
        >
          <Copy size={20} />
          <span className="font-medium">
            {copied ? "Copied!" : "Copy public page link"}
          </span>
        </button>
        <Link
          href="/settings"
          className="flex items-center gap-3 px-4 py-2.5 text-gray-400 hover:bg-[#2a2a2a] hover:text-white rounded-lg transition-colors"
        >
          <Settings size={20} />
          <span className="font-medium">Settings</span>
        </Link>
      </div>

      {/* Copyright */}
      <div className="p-4 border-t border-[#2a2a2a] text-xs text-gray-500 text-center">
        © 2026 Calendar Clone
      </div>
    </div>
  );
}
