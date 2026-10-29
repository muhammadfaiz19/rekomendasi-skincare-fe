'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Upload, RefreshCw, X, CheckCircle, ChevronLeft, ScanFace, Smartphone, Lock } from 'lucide-react';
import Link from 'next/link';
import { authApi } from '@/lib/api/auth';

export default function ScanPage() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await authApi.getMe();
        if (res && res.success && res.data && res.data.id) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (err) {
        setIsLoggedIn(false);
      }
    };
    fetchUser();
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      setStream(mediaStream);
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Tidak dapat mengakses kamera. Pastikan Anda telah memberikan izin.");
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraActive(false);
    }
  }, [stream]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageData);
        stopCamera();
        analyzeSkin(imageData);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result as string;
        setCapturedImage(imageData);
        analyzeSkin(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeSkin = async (base64Image: string) => {
    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      // Convert base64 to Blob
      const res = await fetch(base64Image);
      const blob = await res.blob();
      
      const formData = new FormData();
      formData.append('file', blob, 'scan.jpg');

      const apiRes = await fetch('http://127.0.0.1:8000/api/analyze-skin', {
        method: 'POST',
        body: formData,
      });

      const data = await apiRes.json();
      
      if (data.success) {
        setResult(data.data);
        
        // Simpan ke local storage secara aman (thumbnail terkompresi & quota fallback)
        try {
          const createThumbnail = (src: string, maxDim = 120, quality = 0.5): Promise<string> => {
            return new Promise((resolve) => {
              try {
                const img = new Image();
                img.onload = () => {
                  const canvas = document.createElement('canvas');
                  let w = img.width;
                  let h = img.height;
                  if (w > h) {
                    if (w > maxDim) {
                      h = Math.round((h * maxDim) / w);
                      w = maxDim;
                    }
                  } else {
                    if (h > maxDim) {
                      w = Math.round((w * maxDim) / h);
                      h = maxDim;
                    }
                  }
                  canvas.width = w;
                  canvas.height = h;
                  const ctx = canvas.getContext('2d');
                  if (ctx) {
                    ctx.drawImage(img, 0, 0, w, h);
                    resolve(canvas.toDataURL('image/jpeg', quality));
                  } else {
                    resolve('');
                  }
                };
                img.onerror = () => resolve('');
                img.src = src;
              } catch {
                resolve('');
              }
            });
          };

          let thumb = '';
          try {
            thumb = await createThumbnail(base64Image, 120, 0.5);
          } catch {
            thumb = '';
          }

          const historyItem = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            condition: data.data.detected_condition,
            confidence: data.data.confidence,
            details: data.data.diagnosis_details,
            image: thumb || undefined
          };

          const safeSave = (list: any[]) => {
            try {
              localStorage.setItem('scanHistory', JSON.stringify(list));
              return true;
            } catch {
              return false;
            }
          };

          let existingHistory: any[] = [];
          try {
            existingHistory = JSON.parse(localStorage.getItem('scanHistory') || '[]');
          } catch {
            existingHistory = [];
          }

          // Coba simpan list terbaru (maksimal 10 item)
          const updatedHistory = [historyItem, ...existingHistory].slice(0, 10);
          
          if (!safeSave(updatedHistory)) {
            // Jika melebihi kuota, buang gambar dari riwayat lama
            const textOnlyOld = updatedHistory.map((item, idx) => 
              idx === 0 ? item : { ...item, image: undefined }
            );
            if (!safeSave(textOnlyOld)) {
              // Jika masih tidak cukup, simpan tanpa gambar sama sekali
              const textOnlyAll = updatedHistory.map(item => ({ ...item, image: undefined }));
              if (!safeSave(textOnlyAll)) {
                // Fallback terakhir jika localStorage benar-benar penuh: bersihkan lalu simpan 1 item terbaru
                localStorage.removeItem('scanHistory');
                safeSave([textOnlyAll[0]]);
              }
            }
          }
        } catch (storageErr) {
          console.warn("Gagal menyimpan riwayat ke local storage:", storageErr);
        }
      } else {
        setError(data.message || "Gagal menganalisis gambar.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError("Terjadi kesalahan jaringan saat menghubungi server AI.");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetScanner = () => {
    setCapturedImage(null);
    setResult(null);
    setError(null);
    startCamera();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar Simple */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-foreground font-semibold hover:text-primary transition-colors">
            <ChevronLeft size={20} />
            Kembali ke Beranda
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/history" className="text-sm font-semibold text-primary hover:text-primary/80 bg-primary/10 px-4 py-1.5 rounded-full transition-all">
              Riwayat
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <ScanFace size={18} />
              </div>
              <span className="font-bold text-foreground">AI Skin Scanner</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
            Analisis Kulit <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Kecerdasan Buatan</span>
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Arahkan kamera ke wajah Anda atau unggah foto untuk mendapatkan analisis mendalam dan rekomendasi produk Skincare yang paling cocok untuk kondisi kulit Anda saat ini.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bagian Scanner */}
          <div className="bg-white rounded-[32px] p-6 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center justify-center min-h-[500px]">
            
            {isLoggedIn === null ? (
              <div className="flex flex-col items-center justify-center text-slate-400">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin mb-4"></div>
                <p>Memuat pengaturan...</p>
              </div>
            ) : !isLoggedIn ? (
              <div className="flex flex-col items-center justify-center text-center max-w-sm mx-auto">
                <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner rotate-3">
                  <Lock size={40} className="text-primary" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3">Akses Terkunci</h3>
                <p className="text-slate-500 mb-8 leading-relaxed">
                  Fitur AI Skin Scanner memerlukan data profil untuk menyimpan riwayat kulit Anda. Silakan login terlebih dahulu.
                </p>
                <Link 
                  href="/login"
                  className="bg-primary text-white w-full py-4 rounded-full font-bold shadow-lg shadow-primary/30 hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  Login Sekarang
                </Link>
              </div>
            ) : (
              <>
                <div className="relative w-full aspect-square max-w-md mx-auto bg-slate-900 rounded-[24px] overflow-hidden flex items-center justify-center shadow-inner mb-6">
              
              {!isCameraActive && !capturedImage && (
                <div className="text-center p-8">
                  <ScanFace className="w-20 h-20 text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-400 font-medium">Kamera tidak aktif</p>
                </div>
              )}

              {/* Video Stream */}
              <video 
                ref={videoRef}
                autoPlay 
                playsInline 
                muted 
                className={`absolute inset-0 w-full h-full object-cover ${!isCameraActive || capturedImage ? 'hidden' : 'block'}`}
              />

              {/* Captured Image */}
              {capturedImage && (
                <img src={capturedImage} alt="Captured" className="absolute inset-0 w-full h-full object-cover" />
              )}

              {/* Scanning Overlay Effect */}
              {isProcessing && (
                <div className="absolute inset-0 z-20 overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full bg-primary/20 backdrop-blur-sm"></div>
                  <div className="absolute top-0 left-0 w-full h-1 bg-white shadow-[0_0_20px_5px_rgba(255,255,255,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
                </div>
              )}

              <canvas ref={canvasRef} className="hidden" />
            </div>

            {error && (
              <div className="w-full max-w-md bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 mb-6 flex items-start gap-3">
                <X className="shrink-0 mt-0.5" size={16} /> {error}
              </div>
            )}

            {/* Banner Tips & Disclaimer */}
            {!capturedImage && (
              <div className="w-full max-w-md bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Smartphone className="text-amber-600" size={18} />
                  <h3 className="font-bold text-amber-800 text-sm">Panduan & Informasi AI</h3>
                </div>
                <ul className="text-xs text-amber-700 leading-relaxed list-disc list-outside ml-4 space-y-1">
                  <li><strong>Gunakan HP:</strong> Disarankan memakai kamera Handphone karena lebih tajam daripada laptop.</li>
                  <li><strong>Pencahayaan Terang:</strong> Pastikan wajah terkena cahaya yang cukup (natural) tanpa bayangan gelap.</li>
                  <li><strong>Tanpa Makeup/Filter:</strong> Pindai wajah dalam keadaan bersih agar AI bisa mendeteksi kondisi kulit yang asli.</li>
                  <li><strong>Bukan Diagnosis Medis:</strong> Hasil analisis AI <strong>belum tentu 100% akurat</strong> dan tidak menggantikan saran dari dokter kulit profesional.</li>
                </ul>
              </div>
            )}

            <div className="w-full max-w-md flex flex-col gap-3">
              {!isCameraActive && !capturedImage ? (
                <>
                  <button onClick={startCamera} className="w-full py-4 bg-primary text-white rounded-full font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/30">
                    <Camera size={20} /> Buka Kamera
                  </button>
                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="shrink-0 px-4 text-slate-400 text-sm">ATAU</span>
                    <div className="flex-grow border-t border-slate-200"></div>
                  </div>
                  <button onClick={() => fileInputRef.current?.click()} className="w-full py-4 bg-slate-100 text-slate-700 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-all">
                    <Upload size={20} /> Unggah Foto Galeri
                  </button>
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                </>
              ) : !capturedImage ? (
                <div className="flex gap-3">
                  <button onClick={capturePhoto} className="flex-1 py-4 bg-primary text-white rounded-full font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/30">
                    <ScanFace size={20} /> Pindai Wajah
                  </button>
                  <button onClick={stopCamera} className="px-6 py-4 bg-slate-100 text-slate-600 rounded-full font-bold flex items-center justify-center hover:bg-slate-200 transition-all">
                    Batal
                  </button>
                </div>
                ) : (
                  <button onClick={resetScanner} disabled={isProcessing} className="w-full py-4 bg-slate-100 text-slate-700 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-all disabled:opacity-50">
                    <RefreshCw size={20} /> Ulangi Foto
                  </button>
                )}
              </div>
            </>
            )}
          </div>

          {/* Bagian Hasil */}
          <div className="bg-white rounded-[32px] p-6 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col h-full">
            <h2 className="text-xl font-extrabold mb-6 flex items-center gap-2">
              <CheckCircle className="text-primary" /> Laporan Analisis
            </h2>

            {isProcessing ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 relative mb-6">
                  <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                </div>
                <h3 className="text-lg font-bold text-slate-800">Sedang Menganalisis...</h3>
                <p className="text-slate-500 text-sm mt-2">AI sedang mengevaluasi kondisi kulit Anda dan mencari produk yang tepat.</p>
              </div>
            ) : result ? (
              <div className="flex-1 flex flex-col space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                
                <div className="bg-primary/5 rounded-2xl p-5 border border-primary/10">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm text-primary font-bold tracking-wider uppercase">Deteksi Utama</p>
                    <span className="bg-primary/10 text-primary font-black text-xs px-2.5 py-1 rounded-full border border-primary/20 shadow-sm">
                      {result.confidence}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 capitalize">{result.detected_condition.replace(/_/g, ' ')}</h3>
                  <p className="text-slate-600 mt-2 text-sm leading-relaxed">{result.diagnosis_details}</p>
                </div>

                {/* Top-3 Candidates Prediction (Notebook Deployment Style) */}
                {result.top_3_predictions && Object.keys(result.top_3_predictions).length > 0 && (
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kandidat Hasil AI (Top-3)</p>
                      <span className="text-[10px] text-slate-400 font-medium">EfficientNetB3</span>
                    </div>
                    <div className="space-y-2.5">
                      {Object.entries(result.top_3_predictions).map(([className, score]: [string, any], idx: number) => {
                        const val = typeof score === 'number' ? score : parseFloat(score) || 0;
                        return (
                          <div key={className} className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="capitalize text-slate-700 flex items-center gap-1.5">
                                <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${idx === 0 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-600'}`}>
                                  {idx + 1}
                                </span>
                                {className.replace(/_/g, ' ')}
                              </span>
                              <span className={idx === 0 ? 'text-primary font-bold' : 'text-slate-500'}>{val.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-700 ${idx === 0 ? 'bg-gradient-to-r from-primary to-accent' : 'bg-slate-400'}`}
                                style={{ width: `${Math.min(100, Math.max(0, val))}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-bold text-slate-800 mb-4 flex items-center justify-between">
                    Rekomendasi Skincare
                    <span className="text-xs bg-accent text-white px-3 py-1 rounded-full">Khusus Untukmu</span>
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    {result.recommended_products.length > 0 ? (
                      result.recommended_products.map((prod: any) => (
                        <div key={prod.id} className="flex gap-4 p-4 rounded-2xl border border-slate-200 hover:border-primary/30 hover:shadow-md transition-all group bg-white">
                          <div className="w-20 h-20 bg-slate-100 rounded-xl flex items-center justify-center shrink-0 overflow-hidden relative">
                            {prod.image_url ? (
                              <img src={`http://127.0.0.1:8000${prod.image_url}`} alt={prod.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            ) : (
                              <span className="text-3xl">✨</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-bold text-primary mb-1">{prod.brand}</p>
                            <h5 className="font-bold text-slate-900 leading-tight mb-2">{prod.name}</h5>
                            <p className="text-slate-500 text-xs line-clamp-2">{prod.description}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500 italic">Belum ada produk yang cocok ditemukan di database.</p>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-4">
                  <ScanFace size={32} />
                </div>
                <h3 className="text-slate-600 font-medium">Belum Ada Data</h3>
                <p className="text-slate-400 text-sm mt-2">Silakan ambil foto wajah Anda untuk melihat hasil analisis di sini.</p>
              </div>
            )}
          </div>

        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}} />
    </div>
  );
}
