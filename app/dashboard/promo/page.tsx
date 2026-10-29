'use client';

import { useState, useEffect, useRef } from 'react';
import { Upload, Image as ImageIcon, CheckCircle2, AlertCircle, X, Trash2 } from 'lucide-react';
import Cookies from 'js-cookie';

interface Promo {
  filename: string;
  url: string;
}

export default function PromoDashboard() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [promos, setPromos] = useState<Promo[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchPromos = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/settings/promo');
      const data = await res.json();
      if (data.success && data.data.promos) {
        setPromos(data.data.promos);
      }
    } catch (err) {
      console.error('Failed to fetch promos', err);
    }
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.includes('image/')) {
        setStatus({ type: 'error', message: 'Harap unggah file gambar (JPEG/PNG).' });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setStatus({ type: 'error', message: 'Ukuran file maksimal 5MB.' });
        return;
      }
      
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setStatus({ type: null, message: '' });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setStatus({ type: null, message: '' });
    
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const token = Cookies.get('access_token');
      const res = await fetch('http://127.0.0.1:8000/api/settings/promo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      const data = await res.json();
      
      if (res.ok) {
        setStatus({ type: 'success', message: 'Poster Promo berhasil ditambahkan!' });
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchPromos();
      } else {
        setStatus({ type: 'error', message: data.detail || 'Gagal mengunggah poster.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Terjadi kesalahan jaringan.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (filename: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus poster ini?')) return;
    
    try {
      const token = Cookies.get('access_token');
      const res = await fetch(`http://127.0.0.1:8000/api/settings/promo/${filename}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        setStatus({ type: 'success', message: 'Poster berhasil dihapus.' });
        fetchPromos();
      } else {
        setStatus({ type: 'error', message: 'Gagal menghapus poster.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Terjadi kesalahan jaringan.' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Katalog Promo</h1>
        <p className="text-muted-foreground mt-2">Atur slideshow poster diskon yang tampil di kotak kanan Halaman Utama.</p>
      </div>

      {status.message && (
        <div className={`p-4 rounded-xl flex items-start gap-3 ${status.type === 'success' ? 'bg-green-500/10 text-green-600 border border-green-500/20' : 'bg-red-500/10 text-red-600 border border-red-500/20'}`}>
          {status.type === 'success' ? <CheckCircle2 className="shrink-0 mt-0.5" size={18} /> : <AlertCircle className="shrink-0 mt-0.5" size={18} />}
          <p className="text-sm font-medium">{status.message}</p>
          <button onClick={() => setStatus({ type: null, message: '' })} className="ml-auto opacity-70 hover:opacity-100">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Kolom Upload */}
        <div className="bg-white p-6 md:p-8 rounded-[24px] border border-border shadow-sm h-fit">
          <h2 className="text-lg font-bold mb-4">Tambahkan Poster Baru</h2>
          
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border hover:border-primary/50 bg-muted/20 rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[250px] group"
          >
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="max-h-[200px] object-contain rounded-lg shadow-sm" />
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Upload size={28} />
                </div>
                <p className="font-semibold text-foreground">Klik untuk memilih poster</p>
                <p className="text-xs text-muted-foreground mt-2">Mendukung format JPG, JPEG, PNG (Maks 5MB)</p>
                <p className="text-xs text-muted-foreground mt-1">Rekomendasi rasio: 1:1 (Persegi)</p>
              </>
            )}
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            accept="image/jpeg, image/png, image/jpg" 
            className="hidden" 
          />

          <div className="mt-6 flex justify-end gap-3">
            {previewUrl && (
              <button 
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                disabled={loading}
                className="px-5 py-2.5 rounded-full border border-border text-foreground text-sm font-bold hover:bg-muted transition-colors disabled:opacity-50"
              >
                Batal
              </button>
            )}
            <button 
              onClick={handleUpload}
              disabled={!selectedFile || loading}
              className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-md shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                  Mengunggah...
                </>
              ) : (
                <>
                  <Upload size={16} /> Tambahkan ke Slideshow
                </>
              )}
            </button>
          </div>
        </div>

        {/* Kolom Gallery */}
        <div className="bg-white p-6 md:p-8 rounded-[24px] border border-border shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <ImageIcon size={20} className="text-primary" /> Poster Tersimpan
            </h2>
            <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">
              {promos.length} Poster
            </span>
          </div>
          
          {promos.length === 0 ? (
            <div className="flex-1 bg-muted/30 rounded-2xl border border-border/50 p-4 flex flex-col items-center justify-center min-h-[250px]">
              <ImageIcon size={48} className="mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground text-sm font-medium">Belum ada poster dalam slideshow.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {promos.map((promo, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden border border-border shadow-sm aspect-square bg-muted">
                  <img 
                    src={`http://127.0.0.1:8000${promo.url}`} 
                    alt={`Promo ${idx+1}`} 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <button 
                      onClick={() => handleDelete(promo.filename)}
                      className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 hover:scale-110 transition-all shadow-lg"
                      title="Hapus Poster"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
