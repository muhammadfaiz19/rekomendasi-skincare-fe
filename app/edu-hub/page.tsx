"use client";

import MakeupInfo from "@/components/MakeupInfo";
import SkincareDictionary from "@/components/SkincareDictionary";
import SkinTypeTest from "@/components/SkinTypeTest";
import MythVsFact from "@/components/MythVsFact";
import PregnancyGuide from "@/components/PregnancyGuide";
import Chatbot from "@/components/Chatbot";
import Link from "next/link";
import Image from "next/image";
import {
  HomeIcon,
  Info,
  MessageSquare,
  ScanFace,
  LogOut,
  User,
} from "lucide-react";
import Cookies from "js-cookie";
import { useState, useEffect } from "react";
import { authApi } from "@/lib/api/auth";
import { User as UserType } from "@/types/auth";

export default function EduHubPage() {
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    const token = Cookies.get("access_token");
    if (token) {
      authApi
        .getMe()
        .then((res) => {
          setUser(res.data);
        })
        .catch(() => {
          Cookies.remove("access_token");
        });
    }
  }, []);

  const handleLogout = () => {
    Cookies.remove("access_token");
    setUser(null);
    window.location.reload();
  };

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary/10">
      {/* Navigation (Shared) */}
      <nav className="fixed top-0 w-full z-40 bg-background/70 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.jpg"
              alt="Glamora"
              width={40}
              height={40}
              className="object-cover rounded-full shadow-sm"
            />
            <span className="text-xl font-bold tracking-tight text-primary">
              Glamora
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 bg-white/50 px-6 py-2 rounded-full border border-primary/10">
            <Link
              href="/"
              className="text-muted-foreground hover:text-primary transition-colors tooltip"
              title="Beranda"
            >
              <HomeIcon size={20} />
            </Link>
            <Link
              href="/interactive-tools"
              className="text-muted-foreground hover:text-primary transition-colors tooltip relative group"
              title="Interactive Tools"
            >
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs bg-slate-800 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Interactive Tools
              </span>
              Tools
            </Link>
            <Link
              href="/edu-hub"
              className="text-primary font-bold hover:text-primary transition-colors tooltip relative group"
              title="Edu Hub"
            >
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs bg-slate-800 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Edu Hub
              </span>
              Edu Hub
            </Link>
            <Link
              href="/scan"
              className="text-muted-foreground hover:text-primary transition-colors tooltip relative group"
              title="Scan Kulit AI"
            >
              <ScanFace size={20} />
            </Link>
            <button
              onClick={() => window.dispatchEvent(new Event("open-chatbot"))}
              className="text-muted-foreground hover:text-primary transition-colors tooltip"
              title="Konsultasi"
            >
              <MessageSquare size={20} />
            </button>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="hidden md:flex items-center gap-2 text-sm font-semibold text-muted-foreground mr-2">
                  <User size={16} />
                  <span>Hi, {user.name}</span>
                </div>
                {user.role === "admin" && (
                  <Link
                    href="/dashboard"
                    className="px-5 py-2 rounded-full border border-primary/20 text-primary text-sm font-bold hover:bg-primary/5 transition-all"
                  >
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="px-5 py-2 rounded-full bg-destructive/10 text-destructive text-sm font-bold hover:bg-destructive/20 transition-all flex items-center gap-2"
                >
                  <LogOut size={16} />
                  <span className="hidden md:inline">Keluar</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-5 py-2 rounded-full border border-primary/20 text-primary text-sm font-bold hover:bg-primary/5 transition-all"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all"
                >
                  Daftar
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="pt-32 pb-24 px-6 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="px-4 py-1.5 rounded-full bg-accent/20 text-accent-foreground text-xs font-bold uppercase tracking-[0.2em]">
            Edu Hub
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Pusat Edukasi Kecantikan
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Pelajari lebih lanjut tentang tips makeup, tren kecantikan, dan
            pengetahuan dasar mengenai perawatan kulit.
          </p>
        </div>

        <div className="space-y-16">
          <SkincareDictionary />
          <SkinTypeTest />
          <MythVsFact />
          <PregnancyGuide />
          <MakeupInfo />
        </div>
      </div>

      <Chatbot />
    </main>
  );
}
