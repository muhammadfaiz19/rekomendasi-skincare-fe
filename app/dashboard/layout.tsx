"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { authApi } from "@/lib/api/auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = Cookies.get("access_token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const response = await authApi.getMe();
        if (response.data.role !== "admin") {
          router.push("/login");
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/login");
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground font-bold uppercase tracking-widest text-xs">
            Memverifikasi akses...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-muted/20">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="p-4 md:p-8 flex-1 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
