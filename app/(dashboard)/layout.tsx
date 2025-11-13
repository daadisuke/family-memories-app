"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navigation = [
    { name: "ホーム", href: "/", icon: "🏠" },
    { name: "写真", href: "/photos", icon: "📷" },
    { name: "検索", href: "/search", icon: "🔍" },
    { name: "アップロード", href: "/upload", icon: "⬆️" },
    { name: "家族", href: "/family", icon: "👨‍👩‍👧‍👦" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900">
                Family Memories
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex md:space-x-4">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                {session?.user?.name || session?.user?.email}
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200">
          <div className="flex justify-around py-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                    isActive
                      ? "text-blue-700"
                      : "text-gray-700"
                  }`}
                >
                  <span className="text-xl mb-1">{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
