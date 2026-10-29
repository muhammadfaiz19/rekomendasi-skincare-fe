'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Tag, Database, User, X, Image as ImageIcon, ListTree, Cpu } from 'lucide-react';
import { authApi } from '@/lib/api/auth';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [profile, setProfile] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await authApi.getMe();
        // The fetcher returns the whole object: { success, message, data }
        if (response && response.success && response.data) {
          setProfile({
            name: response.data.name,
            role: response.data.role
          });
        }
      } catch (error) {
        console.error('Sidebar Profile Fetch Error:', error);
      }
    };
    fetchProfile();
  }, []);

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={20} />, exact: true },
    { name: 'Katalog Produk', href: '/dashboard/products', icon: <Package size={20} /> },
    { name: 'Kategori Produk', href: '/dashboard/categories', icon: <Tag size={20} /> },
    { name: 'Katalog Promo', href: '/dashboard/promo', icon: <ImageIcon size={20} /> },
    { name: 'Kategori Dataset', href: '/dashboard/dataset-categories', icon: <ListTree size={20} /> },
    { name: 'Dataset Gambar', href: '/dashboard/datasets', icon: <ImageIcon size={20} /> },
    { name: 'Train Model AI', href: '/dashboard/train-model', icon: <Cpu size={20} /> },
    { name: 'Info Toko (Context)', href: '/dashboard/contexts', icon: <Database size={20} /> },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-70 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed md:sticky top-0 left-0 z-80
        w-64 bg-sidebar text-sidebar-foreground border-r border-border h-screen flex flex-col
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-full bg-primary"></div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">Skinwise <span className="text-xs font-medium opacity-70">by Glamora</span></h2>
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground opacity-60">Admin Console</p>
          </div>
          
          <button onClick={onClose} className="md:hidden p-2 text-muted-foreground hover:bg-muted rounded-lg">
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 px-4">
          <ul className="space-y-1.5">
            {menuItems.map((item) => {
              const isActive = item.exact 
                ? pathname === item.href 
                : pathname.startsWith(item.href);
                
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => { if(window.innerWidth < 768) onClose?.(); }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive 
                        ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' 
                        : 'hover:bg-sidebar-accent hover:text-primary group'
                    }`}
                  >
                    <span className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-primary transition-colors'}`}>
                      {item.icon}
                    </span>
                    <span className="font-semibold text-sm">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        <div className="p-6 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-primary font-bold shadow-sm">
              <User size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate">{profile?.name || 'Loading...'}</p>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
                {String(profile?.role || '').trim().toLowerCase() === 'admin' ? 'Admin' : (profile?.role || 'Staff')}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
