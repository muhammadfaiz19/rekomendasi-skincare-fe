'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { authApi } from '@/lib/api/auth';
import { Mail, Lock, Sparkles, Loader2, AlertCircle, CheckCircle2, ArrowRight, User } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<{ type: 'error' | 'success' | null; message: string }>({ type: null, message: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus({ type: null, message: '' });
    setLoading(true);

    try {
      const response = await authApi.register({ name, email, password });
      
      if (response.success) {
        setStatus({ type: 'success', message: 'Registrasi berhasil! Silakan login.' });
        setTimeout(() => router.push('/login'), 1500);
      } else {
        setStatus({ type: 'error', message: response.message || 'Gagal melakukan registrasi.' });
      }
    } catch (err: unknown) {
      let errorMsg = 'Terjadi kesalahan saat registrasi. Silakan coba lagi.';
      if (err instanceof Error) {
        errorMsg = err.message;
      }
      setStatus({ type: 'error', message: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-primary/20">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_-20%,var(--color-primary),transparent_50%)] opacity-[0.03] -z-10"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3 -z-10 animate-pulse"></div>

      <div className="w-full max-w-[420px]">
        {/* Branding Logo */}
        <div className="text-center mb-10 flex flex-col items-center">
            <Link href="/" className="inline-flex items-center gap-3 mb-6 group transition-transform hover:scale-105 active:scale-95">
                <Image src="/logo.jpg" alt="Glamora" width={80} height={80} className="object-cover rounded-full shadow-xl shadow-primary/20" />
            </Link>
            <div className="space-y-1">
                <h2 className="text-2xl font-bold text-foreground">Daftar Akun Baru</h2>
                <p className="text-muted-foreground text-sm font-medium">Buat akun untuk mendapatkan fitur penuh</p>
            </div>
        </div>

        {/* Form Card */}
        <div className="bg-background/60 backdrop-blur-2xl border border-border/80 rounded-[40px] p-10 shadow-3xl shadow-primary/5 relative overflow-hidden">
          {/* Top accent line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary/40 via-accent/40 to-primary/40"></div>
          
          {/* Validation Messages */}
          {status.type && (
            <div className={`mb-8 p-4 rounded-2xl border text-sm font-bold flex gap-3 items-center animate-chatbot-enter ${
              status.type === 'success' 
                ? 'bg-green-500/10 border-green-500/20 text-green-600' 
                : 'bg-destructive/10 border-destructive/20 text-destructive'
            }`}>
              {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span className="leading-tight">{status.message}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-2">Nama Lengkap</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors">
                    <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  disabled={loading}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-muted/20 border border-border rounded-2xl pl-14 pr-5 py-4 text-foreground outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all font-sans font-medium placeholder:text-muted-foreground/20 text-sm"
                  placeholder="Nama Anda"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-2">Email</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors">
                    <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  disabled={loading}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-muted/20 border border-border rounded-2xl pl-14 pr-5 py-4 text-foreground outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all font-sans font-medium placeholder:text-muted-foreground/20 text-sm"
                  placeholder="user@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-2">Password</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors">
                    <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  disabled={loading}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-muted/20 border border-border rounded-2xl pl-14 pr-5 py-4 text-foreground outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all font-sans font-medium placeholder:text-muted-foreground/20 text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold shadow-xl shadow-primary/20 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:grayscale disabled:scale-100"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <span>Daftar Sekarang</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm font-medium text-muted-foreground">
            Sudah punya akun? <Link href="/login" className="text-primary hover:underline">Masuk di sini</Link>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-12 text-center">
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.3em] opacity-40 mb-6">Secured by Skinwise by Glamora AI</p>
            <div className="flex justify-center gap-6">
                <div className="w-1.5 h-1.5 rounded-full bg-primary/20"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-accent/20"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-primary/20"></div>
            </div>
        </div>
      </div>
    </div>
  );
}
