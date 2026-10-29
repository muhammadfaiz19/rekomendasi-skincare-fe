'use client';

import Chatbot from '@/components/Chatbot';
import Link from 'next/link';
import Image from 'next/image';
import { ScanFace, ShoppingBag, MessageSquare, LogOut, User, Camera, Video, Headphones, Home as HomeIcon, Info, Sparkles, Bot, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { authApi } from '@/lib/api/auth';
import { User as UserType } from '@/types/auth';

export default function Home() {
  const [user, setUser] = useState<UserType | null>(null);
  const [promos, setPromos] = useState<string[]>([]);
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);

  useEffect(() => {
    const token = Cookies.get('access_token');
    if (token) {
      authApi.getMe().then(res => {
        setUser(res.data);
      }).catch(() => {
        Cookies.remove('access_token');
      });
    }

    // Fetch Promos
    fetch('http://127.0.0.1:8000/api/settings/promo')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data.promos && data.data.promos.length > 0) {
          const urls = data.data.promos.map((p: any) => `http://127.0.0.1:8000${p.url}`);
          setPromos(urls);
        }
      })
      .catch(err => console.error('Failed to fetch promos', err));
  }, []);

  // Slideshow Effect
  useEffect(() => {
    if (promos.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentPromoIndex(prev => (prev + 1) % promos.length);
    }, 4000); // Ganti gambar setiap 4 detik
    return () => clearInterval(interval);
  }, [promos.length]);

  const handleLogout = () => {
    Cookies.remove('access_token');
    setUser(null);
    window.location.reload();
  };

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary/10">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-40 bg-background/70 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo.jpg" alt="Glamora" width={40} height={40} className="object-cover rounded-full shadow-sm" />
            <span className="text-xl font-bold tracking-tight text-primary">Glamora</span>
          </div>
          <div className="hidden md:flex items-center gap-8 bg-white/50 px-6 py-2 rounded-full border border-primary/10">
            <Link href="/" className="text-primary hover:text-primary transition-colors tooltip" title="Beranda">
              <HomeIcon size={20} />
            </Link>
            <Link href="/interactive-tools" className="text-muted-foreground hover:text-primary transition-colors tooltip relative group" title="Interactive Tools">
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs bg-slate-800 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Interactive Tools
              </span>
              Tools
            </Link>
            <Link href="/edu-hub" className="text-muted-foreground hover:text-primary transition-colors tooltip relative group" title="Edu Hub">
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs bg-slate-800 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Edu Hub
              </span>
              Edu Hub
            </Link>
            <Link href="/scan" className="text-muted-foreground hover:text-primary transition-colors tooltip relative group" title="Scan Kulit AI">
              <ScanFace size={20} />
              {/* Tooltip text */}
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs bg-slate-800 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Scan AI
              </span>
            </Link>
            <button 
              onClick={() => window.dispatchEvent(new Event('open-chatbot'))} 
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
                {user.role === 'admin' && (
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

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 -z-10"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4 -z-10"></div>
        
        <div className="max-w-7xl mx-auto text-center md:text-left flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 space-y-8">
            <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-[0.2em]">Next-Gen Skincare</span>
            <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight text-foreground">
              Temukan Rahasia <br />
              <span className="text-primary italic">Kecantikanmu</span> <br />
              Bersama Skinwise <span className="text-2xl md:text-3xl font-medium opacity-70">by Glamora</span> AI.
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
              Konsultasikan masalah kulitmu dengan Beauty Advisor bertenaga AI kami. 
              Dapatkan rekomendasi produk yang dipersonalisasi khusus untuk kebutuhanmu.
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <button onClick={() => window.dispatchEvent(new Event('open-chatbot'))} className="px-10 py-4 bg-primary text-primary-foreground rounded-full font-bold shadow-xl shadow-primary/20 hover:bg-primary/90 hover:scale-105 transition-all">
                Mulai Konsultasi
              </button>
            </div>
          </div>
          <div className="flex-1 relative">
            <div className="w-full aspect-square bg-linear-to-br from-accent/30 to-primary/40 rounded-[60px] shadow-2xl overflow-hidden flex items-center justify-center relative group">
              {promos.length > 0 ? (
                <>
                  {promos.map((url, idx) => (
                    <div 
                      key={idx}
                      className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentPromoIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                    >
                      <img src={url} alt={`Promo ${idx+1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {/* Indikator Slideshow */}
                  {promos.length > 1 && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full">
                      {promos.map((_, idx) => (
                        <button 
                          key={idx} 
                          onClick={() => setCurrentPromoIndex(idx)}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentPromoIndex ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/80'}`}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-primary-foreground/50 italic text-sm animate-pulse">
                  ✨ Visualising Premium Products...
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Cara Pakai Section */}
      <section id="cara-pakai" className="py-24 px-6 bg-muted/10 relative">
        <div className="max-w-7xl mx-auto space-y-20">
          {/* Cara Pakai */}
          <div className="mt-32 pt-20 border-t border-border/50">
            <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Cara Kerja AI Skinwise <span className="text-xl md:text-2xl font-medium opacity-70">by Glamora</span></h2>
              <p className="text-muted-foreground leading-relaxed">Cukup 3 langkah mudah untuk mendapatkan kulit impian Anda.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Connector lines (hidden on mobile) */}
              <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-primary/10 via-primary/30 to-primary/10 -z-10"></div>
              
              <div className="relative text-center space-y-6">
                <div className="w-24 h-24 mx-auto rounded-full bg-white border-4 border-primary/20 flex items-center justify-center text-3xl font-black text-primary shadow-xl shadow-primary/10">1</div>
                <div className="space-y-2">
                  <h4 className="text-lg font-bold">Mulai Konsultasi</h4>
                  <p className="text-sm text-muted-foreground">Klik ikon ✨ di pojok kanan bawah untuk memulai sesi chat Anda.</p>
                </div>
              </div>
              <div className="relative text-center space-y-6">
                <div className="w-24 h-24 mx-auto rounded-full bg-white border-4 border-primary/20 flex items-center justify-center text-3xl font-black text-primary shadow-xl shadow-primary/10">2</div>
                <div className="space-y-2">
                  <h4 className="text-lg font-bold">Ceritakan Keluhan</h4>
                  <p className="text-sm text-muted-foreground">Sampaikan masalah kulit (jerawat, kering, kusam) secara detail kepada AI.</p>
                </div>
              </div>
              <div className="relative text-center space-y-6">
                <div className="w-24 h-24 mx-auto rounded-full bg-white border-4 border-primary/20 flex items-center justify-center text-3xl font-black text-primary shadow-xl shadow-primary/10">3</div>
                <div className="space-y-2">
                  <h4 className="text-lg font-bold">Terima Rekomendasi</h4>
                  <p className="text-sm text-muted-foreground">AI akan memproses dan memberikan rekomendasi produk terbaik seketika.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TENTANG KAMI */}
      <section id="tentang" className="py-24 px-6 relative overflow-hidden bg-background">
        {/* Subtle Background Gradients */}
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 -z-10"></div>
        
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            
            {/* Visual Side (Left) */}
            <div className="flex-1 w-full relative">
              <div className="relative aspect-[4/3] rounded-[40px] overflow-hidden border border-border shadow-2xl group">
                <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-accent/5 to-background flex flex-col items-center justify-center p-8 text-center backdrop-blur-sm transition-transform duration-700 group-hover:scale-105">
                  <div className="w-20 h-20 rounded-full bg-white/50 backdrop-blur-md shadow-xl flex items-center justify-center mb-6 border border-white/20 animate-pulse">
                    <Sparkles className="text-primary" size={40} />
                  </div>
                  <h3 className="text-2xl font-black italic text-foreground tracking-tight">Skinwise <span className="text-lg font-medium opacity-70 not-italic">by Glamora</span></h3>
                  <p className="text-muted-foreground mt-2 max-w-sm">
                    Revolusi perawatan kulit masa depan yang dirancang khusus untuk memahami keunikan Anda.
                  </p>
                </div>
              </div>
              {/* Floating decorative elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/20 rounded-full blur-2xl -z-10"></div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-accent/20 rounded-full blur-2xl -z-10"></div>
            </div>

            {/* Text Side (Right) */}
            <div className="flex-1 space-y-8">
              <div className="space-y-4">
                <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-[0.2em]">
                  Di Balik Layar
                </span>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.1]">
                  Lebih dari Sekadar Skincare, Ini adalah <span className="text-primary italic">Inovasi.</span>
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Kami percaya bahwa setiap orang berhak mendapatkan perawatan kulit yang terbaik. Tanpa tebak-tebakan, tanpa keraguan. Dengan mengandalkan teknologi Artificial Intelligence terdepan, Skinwise hadir sebagai Beauty Advisor pribadi Anda yang objektif dan presisi.
                </p>
              </div>

              {/* Micro-Stats / Features */}
              <div className="space-y-5 pt-4 border-t border-border/50">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                    <Sparkles className="text-primary" size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">100% Personal</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">Setiap rekomendasi yang diberikan sepenuhnya disesuaikan dengan kondisi, tipe, dan masalah spesifik kulit Anda.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="text-primary" size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">AI-Driven Analysis</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">Analisis cerdas menggunakan teknologi terkini yang terus belajar untuk memberikan hasil yang semakin akurat.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                    <Clock className="text-primary" size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">Dukungan 24/7</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">Asisten virtual kami selalu siap sedia kapan pun Anda membutuhkan konsultasi darurat tentang kulit Anda.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section for Floating Bot */}
      <section className="py-20 px-6 bg-muted">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h2 className="text-3xl font-bold">Bingung Mulai Dari Mana?</h2>
          <p className="text-muted-foreground mb-6">Anda juga bisa langsung mengobrol dengan asisten virtual kami di bawah ini.</p>
          <button onClick={() => window.dispatchEvent(new Event('open-chatbot'))} className="mt-6 px-8 py-3 bg-primary text-primary-foreground rounded-full font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 hover:scale-105 transition-all mx-auto inline-flex items-center gap-2">
            Mulai Chat AI
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-muted border-t border-border/50 pt-20 pb-10 px-6 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/3 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 -z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3 -z-10 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            {/* Brand Section */}
            <div className="md:col-span-2 space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-linear-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
                  <span className="text-white text-sm">✨</span>
                </div>
                <span className="text-2xl font-black tracking-tight text-foreground italic">
                  Skinwise <span className="text-sm font-medium opacity-70 not-italic">by Glamora</span>
                </span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
                Inovasi kecantikan berbasis Artificial Intelligence. Kami hadir untuk membantu Anda menemukan rutinitas dan produk skincare yang paling sempurna untuk kulit Anda yang unik.
              </p>
            </div>

            {/* Links */}
            <div className="space-y-6">
              <h4 className="text-sm font-bold text-foreground uppercase tracking-widest">Eksplorasi</h4>
              <div className="flex flex-col gap-4">
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Beranda</a>
                <a href="#fitur" className="text-sm text-muted-foreground hover:text-primary transition-colors">Analisis Kulit</a>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Produk Skincare</a>
                <a href="#tentang" className="text-sm text-muted-foreground hover:text-primary transition-colors">Tentang Kami</a>
              </div>
            </div>

            {/* Contact / Social */}
            <div className="space-y-6">
              <h4 className="text-sm font-bold text-foreground uppercase tracking-widest">Terhubung</h4>
              <div className="flex flex-col gap-4">
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-3">
                  <Camera size={16} /> Instagram
                </a>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-3">
                  <Video size={16} /> TikTok
                </a>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-3">
                  <Headphones size={16} /> Hubungi Bantuan
                </a>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
              &copy; 2026 Skinwise by Glamora AI. Crafted with Love.
            </p>
            <div className="flex items-center gap-6 text-xs text-muted-foreground font-medium">
              <a href="#" className="hover:text-primary transition-colors">Syarat & Ketentuan</a>
              <a href="#" className="hover:text-primary transition-colors">Kebijakan Privasi</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Chatbot */}
      <Chatbot />
    </main>
  );
}

