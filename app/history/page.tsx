'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ScanFace, Trash2, Clock, CheckCircle } from 'lucide-react';

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem('scanHistory') || '[]');
    setHistory(savedHistory);
  }, []);

  const clearHistory = () => {
    if (confirm('Apakah Anda yakin ingin menghapus semua riwayat?')) {
      localStorage.removeItem('scanHistory');
      setHistory([]);
    }
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/scan" className="flex items-center gap-2 text-foreground font-semibold hover:text-primary transition-colors">
            <ChevronLeft size={20} />
            Kembali ke Scanner
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Clock size={18} />
            </div>
            <span className="font-bold text-foreground">Riwayat Analisis</span>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Riwayat <span className="text-primary">Scan Wajah</span>
            </h1>
            <p className="text-slate-600 mt-2">Data riwayat disimpan secara lokal di perangkat ini.</p>
          </div>
          {history.length > 0 && (
            <button 
              onClick={clearHistory}
              className="flex items-center gap-2 text-red-500 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition-colors font-medium text-sm"
            >
              <Trash2 size={16} />
              Bersihkan Riwayat
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="bg-white rounded-[32px] p-12 text-center shadow-sm border border-slate-100 flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
              <Clock size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Belum Ada Riwayat</h3>
            <p className="text-slate-500 max-w-md mx-auto mb-8">Anda belum pernah melakukan analisis wajah di perangkat ini. Silakan lakukan scan terlebih dahulu.</p>
            <Link href="/scan" className="bg-primary text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-primary/30 hover:bg-primary/90 transition-colors inline-flex items-center gap-2">
              <ScanFace size={20} /> Mulai Scan Wajah
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map((item) => (
              <div key={item.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle size={12} /> {parseFloat(item.confidence || '0').toFixed(1)}%
                  </div>
                  <span className="text-xs text-slate-400 font-medium">{formatDate(item.date)}</span>
                </div>
                
                {item.image && (
                  <div className="w-full aspect-square rounded-xl bg-slate-100 overflow-hidden mb-4 relative">
                    <img src={item.image} alt="Scan Result" className="w-full h-full object-cover" />
                  </div>
                )}
                
                <h3 className="text-xl font-black text-slate-800 mb-2 capitalize">
                  {item.condition ? String(item.condition).replace(/_/g, ' ') : 'Unknown'}
                </h3>
                <p className="text-slate-600 text-sm line-clamp-3 mb-4">{item.details}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
