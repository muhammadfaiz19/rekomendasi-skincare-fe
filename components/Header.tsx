'use client';

import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { Menu, LogOut, Search, Bell } from 'lucide-react';

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove('access_token');
    router.push('/login');
  };

  return (
    <header className="h-20 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2.5 bg-muted/50 hover:bg-muted text-muted-foreground rounded-xl md:hidden transition-colors"
        >
          <Menu size={20} />
        </button>
        <div className="hidden sm:block text-sm font-semibold text-muted-foreground uppercase tracking-[0.15em] opacity-70">
          Management <span className="text-primary/50 ml-1">/</span> Overview
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-destructive hover:bg-destructive/10 rounded-xl transition-all active:scale-95"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </header>
  );
}
