'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Cpu, 
  Play, 
  Square, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Database, 
  Sparkles, 
  Terminal as TerminalIcon, 
  Flame, 
  Activity,
  Check,
  Clock,
  HardDrive
} from 'lucide-react';
import { trainApi, TrainStatus, DatasetSummary } from '@/lib/api/train';

export default function TrainModelPage() {
  const [status, setStatus] = useState<TrainStatus | null>(null);
  const [summary, setSummary] = useState<DatasetSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);

  // Form parameters
  const [epochs, setEpochs] = useState<number>(10);
  const [batchSize, setBatchSize] = useState<number>(16);
  const [architecture, setArchitecture] = useState<string>('MobileNetV2');

  const logEndRef = useRef<HTMLDivElement>(null);

  // Polling data
  const fetchStatus = async () => {
    try {
      const res = await trainApi.getStatus();
      if (res && res.data) {
        setStatus(res.data);
      }
    } catch (err: any) {
      console.error('Fetch status error:', err);
    }
  };

  const fetchSummary = async () => {
    try {
      setLoadingSummary(true);
      const res = await trainApi.getDatasetSummary();
      if (res && res.data) {
        setSummary(res.data);
      }
    } catch (err: any) {
      console.error('Fetch summary error:', err);
    } finally {
      setLoadingSummary(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchSummary();
  }, []);

  // Poll every 1.5 seconds if training or every 5 seconds if idle
  useEffect(() => {
    const isRunning = status?.status === 'running';
    const interval = setInterval(() => {
      fetchStatus();
    }, isRunning ? 1500 : 5000);

    return () => clearInterval(interval);
  }, [status?.status]);

  // Auto-scroll logs
  useEffect(() => {
    if (autoScroll && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [status?.logs, autoScroll]);

  const handleStartTrain = async () => {
    try {
      setErrorMsg('');
      setSubmitting(true);
      const res = await trainApi.startTraining({
        epochs: Number(epochs),
        batch_size: Number(batchSize),
        architecture
      });
      if (res && res.success) {
        fetchStatus();
      } else {
        setErrorMsg(res.message || 'Gagal memulai training');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat memulai training');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStopTrain = async () => {
    if (!confirm('Apakah Anda yakin ingin membatalkan proses pelatihan yang sedang berjalan?')) {
      return;
    }
    try {
      setCancelling(true);
      await trainApi.stopTraining();
      fetchStatus();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal membatalkan training');
    } finally {
      setCancelling(false);
    }
  };

  const handleReset = async () => {
    try {
      setResetting(true);
      setErrorMsg('');
      await trainApi.resetTraining();
      await fetchStatus();
      await fetchSummary();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mereset status training');
    } finally {
      setResetting(false);
    }
  };

  const isTraining = status?.status === 'running';

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-background p-6 rounded-3xl border border-border shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
              <Cpu className={`w-6 h-6 ${isTraining ? 'animate-spin text-amber-500' : 'animate-pulse'}`} />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
              Pelatihan Model AI
            </h1>
          </div>
          <p className="text-sm text-muted-foreground ml-1">
            Latih ulang model klasifikasi kulit wajah menggunakan citra terbaru yang ada di database.
          </p>
        </div>

        {/* Status Badge & Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border shadow-sm">
            <span className="text-xs text-muted-foreground font-semibold">Status AI:</span>
            {isTraining ? (
              <span className="flex items-center gap-1.5 text-xs font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                SEDANG TRAINING
              </span>
            ) : status?.status === 'completed' ? (
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                <CheckCircle2 size={14} />
                TERLATIH (SELESAI)
              </span>
            ) : status?.status === 'failed' ? (
              <span className="flex items-center gap-1.5 text-xs font-bold text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded-lg">
                <AlertCircle size={14} />
                GAGAL
              </span>
            ) : status?.status === 'cancelled' ? (
              <span className="flex items-center gap-1.5 text-xs font-bold text-orange-500 bg-orange-500/10 px-2.5 py-1 rounded-lg">
                DIBATALKAN
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground bg-muted px-2.5 py-1 rounded-lg">
                STANDBY (IDLE)
              </span>
            )}
          </div>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            disabled={resetting || isTraining}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border hover:bg-muted text-xs font-bold text-foreground transition-all active:scale-95 disabled:opacity-50"
            title="Reset status pelatihan kembali ke Standby"
          >
            <RotateCcw size={14} className={resetting ? "animate-spin" : ""} />
            <span>Reset Status</span>
          </button>
        </div>
      </div>

      {/* Notice Banners for Failed / Completed States */}
      {status?.status === 'failed' && (
        <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm">Pelatihan Menemui Kendala</p>
              <p className="text-xs text-rose-600/90 dark:text-rose-300/90 mt-0.5 max-w-2xl font-mono">
                {status.error || 'Terjadi kesalahan sistem saat proses pelatihan.'}
              </p>
            </div>
          </div>
          <button
            onClick={handleReset}
            disabled={resetting}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shrink-0 flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
          >
            <RotateCcw size={14} className={resetting ? "animate-spin" : ""} />
            <span>Bersihkan & Reset Ulang</span>
          </button>
        </div>
      )}

      {status?.status === 'completed' && (
        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm">Pelatihan Selesai! Model AI Terbaru Siap Digunakan</p>
              <p className="text-xs text-emerald-700/90 dark:text-emerald-300/90 mt-0.5">
                Model klasifikasi telah otomatis dimuat ulang (hot-reloaded) di server.
              </p>
            </div>
          </div>
          <button
            onClick={handleReset}
            disabled={resetting}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shrink-0 flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
          >
            <RotateCcw size={14} />
            <span>Siapkan Training Baru</span>
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center gap-3 text-sm font-semibold">
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Top Grid: Dataset Summary & Model Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Dataset Information from Database */}
        <div className="lg:col-span-5 bg-background p-6 rounded-3xl border border-border shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-foreground font-bold text-lg">
                <Database size={20} className="text-primary" />
                <h2>Dataset di Database</h2>
              </div>
              <button 
                onClick={fetchSummary}
                disabled={loadingSummary}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors text-xs flex items-center gap-1"
                title="Refresh dataset count"
              >
                <RotateCcw size={14} className={loadingSummary ? "animate-spin" : ""} />
                <span>Refresh</span>
              </button>
            </div>

            <p className="text-xs text-muted-foreground mb-4">
              Model akan dilatih langsung menggunakan data gambar dari tabel database <code className="bg-muted px-1.5 py-0.5 rounded text-[11px] font-mono">skin_datasets</code>.
            </p>

            <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 mb-5">
              <div className="text-3xl font-black text-foreground mb-1">
                {loadingSummary ? '...' : summary?.total_images || 0}
              </div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Citra Gambar Siap Dilatih
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                Distribusi Kategori:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {loadingSummary ? (
                  <div className="col-span-2 text-xs text-muted-foreground italic py-2">Memuat kategori...</div>
                ) : summary?.categories && Object.keys(summary.categories).length > 0 ? (
                  Object.entries(summary.categories).map(([catName, count]) => (
                    <div key={catName} className="flex items-center justify-between p-2.5 rounded-xl bg-card border border-border/80">
                      <span className="text-xs font-semibold text-foreground truncate max-w-[110px]" title={catName}>
                        {catName}
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {count}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-xs text-muted-foreground italic py-2">
                    Belum ada data di database. Silakan seed atau tambah dataset terlebih dahulu.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Model info footnote */}
          <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <HardDrive size={14} />
              Model: {status?.model_info?.exists ? `${status.model_info.size_mb} MB` : 'Belum dibuat'}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {status?.model_info?.last_modified ? `Diperbarui: ${status.model_info.last_modified}` : 'Belum pernah dilatih'}
            </span>
          </div>
        </div>

        {/* Right: Training Parameters & Start Button */}
        <div className="lg:col-span-7 bg-background p-6 rounded-3xl border border-border shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-foreground font-bold text-lg mb-4">
              <Sparkles size={20} className="text-primary" />
              <h2>Parameter Pelatihan Model</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Architecture Selector */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                  Arsitektur Deep Learning:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div 
                    onClick={() => !isTraining && setArchitecture('MobileNetV2')}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      architecture === 'MobileNetV2' 
                        ? 'border-primary bg-primary/5 shadow-sm' 
                        : 'border-border hover:border-muted-foreground/30'
                    } ${isTraining ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-foreground">MobileNetV2</span>
                      {architecture === 'MobileNetV2' && <Check size={16} className="text-primary" />}
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Sangat cepat & efisien. Optimal untuk laptop/komputer tanpa GPU dedicated.
                    </p>
                  </div>

                  <div 
                    onClick={() => !isTraining && setArchitecture('EfficientNetB3')}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      architecture === 'EfficientNetB3' 
                        ? 'border-primary bg-primary/5 shadow-sm' 
                        : 'border-border hover:border-muted-foreground/30'
                    } ${isTraining ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-foreground">EfficientNetB3</span>
                      {architecture === 'EfficientNetB3' && <Check size={16} className="text-primary" />}
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Sesuai notebook skripsi. Resolusi tinggi 300x300, ekstraksi fitur mendalam.
                    </p>
                  </div>
                </div>
              </div>

              {/* Epochs Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                  Target Epochs (Iterasi):
                </label>
                <select
                  value={epochs}
                  disabled={isTraining}
                  onChange={(e) => setEpochs(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground font-semibold text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:opacity-60"
                >
                  <option value={5}>5 Epochs (Quick Test)</option>
                  <option value={10}>10 Epochs (Rekomendasi Standar)</option>
                  <option value={15}>15 Epochs (Peningkatan Akurasi)</option>
                  <option value={20}>20 Epochs (Mendalam)</option>
                  <option value={30}>30 Epochs (Maksimal)</option>
                </select>
              </div>

              {/* Batch Size */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                  Batch Size:
                </label>
                <select
                  value={batchSize}
                  disabled={isTraining}
                  onChange={(e) => setBatchSize(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground font-semibold text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:opacity-60"
                >
                  <option value={8}>8 (Hemat Memori)</option>
                  <option value={16}>16 (Optimal untuk CPU/Laptop)</option>
                  <option value={32}>32 (Standar Batch)</option>
                </select>
              </div>
            </div>

            {/* Smart Feature Pills */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-3 py-1 rounded-lg bg-muted text-muted-foreground text-xs font-medium flex items-center gap-1.5">
                <Layers size={13} /> Data Augmentation Otomatis
              </span>
              <span className="px-3 py-1 rounded-lg bg-muted text-muted-foreground text-xs font-medium flex items-center gap-1.5">
                <Activity size={13} /> Early Stopping Monitoring
              </span>
              <span className="px-3 py-1 rounded-lg bg-muted text-muted-foreground text-xs font-medium flex items-center gap-1.5">
                <Flame size={13} /> Hot-Reload Model Instan
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 pt-4 border-t border-border">
            {isTraining ? (
              <button
                onClick={handleStopTrain}
                disabled={cancelling}
                className="flex-1 flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 active:scale-98 text-white px-6 py-3.5 rounded-2xl font-bold shadow-lg shadow-rose-600/20 transition-all text-sm"
              >
                <Square size={18} />
                <span>{cancelling ? 'Menghentikan...' : 'Batalkan Pelatihan (Stop)'}</span>
              </button>
            ) : (
              <button
                onClick={handleStartTrain}
                disabled={submitting || (summary?.total_images || 0) < 8}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 active:scale-98 text-white px-6 py-3.5 rounded-2xl font-bold shadow-lg shadow-indigo-600/25 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play size={18} />
                <span>{submitting ? 'Menyiapkan...' : 'Mulai Latih Model AI (Train)'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Training Live Progress & Metrics Bar */}
      <div className="bg-background p-6 rounded-3xl border border-border shadow-sm space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-extrabold text-foreground flex items-center gap-2">
              <Activity size={18} className="text-primary" />
              Progres Pelatihan
            </span>
            <span className="text-sm font-black text-primary">
              {status?.progress || 0}%
            </span>
          </div>

          {/* Progress Bar Container */}
          <div className="w-full h-3.5 bg-muted rounded-full overflow-hidden p-0.5 border border-border/80">
            <div 
              className="h-full bg-gradient-to-r from-violet-600 via-indigo-600 to-primary rounded-full transition-all duration-500 ease-out shadow-sm"
              style={{ width: `${Math.max(status?.progress || 0, isTraining ? 3 : 0)}%` }}
            />
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
              Epoch Saat Ini
            </span>
            <span className="text-lg font-black text-foreground">
              {status?.current_epoch || 0} / {status?.total_epochs || epochs}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
              Batch Step
            </span>
            <span className="text-lg font-black text-foreground">
              {status?.current_step || 0} / {status?.total_steps || 0}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
              Train Accuracy
            </span>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
              {status?.metrics?.accuracy ? `${(status.metrics.accuracy * 100).toFixed(1)}%` : '0.0%'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
              Train Loss
            </span>
            <span className="text-lg font-black text-foreground">
              {status?.metrics?.loss ? status.metrics.loss.toFixed(4) : '0.0000'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
              Val Accuracy
            </span>
            <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
              {status?.metrics?.val_accuracy ? `${(status.metrics.val_accuracy * 100).toFixed(1)}%` : '0.0%'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
              Val Loss
            </span>
            <span className="text-lg font-black text-foreground">
              {status?.metrics?.val_loss ? status.metrics.val_loss.toFixed(4) : '0.0000'}
            </span>
          </div>
        </div>
      </div>

      {/* Terminal / Live Training Logs Console */}
      <div className="bg-[#0f172a] text-slate-100 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
        {/* Terminal Header */}
        <div className="bg-[#1e293b] px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-2">
              <TerminalIcon size={14} className="text-primary" />
              training_output.log — Real-time Training Console
            </span>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={autoScroll} 
                onChange={(e) => setAutoScroll(e.target.checked)}
                className="rounded accent-primary text-xs" 
              />
              <span>Auto-scroll</span>
            </label>

            <button
              onClick={handleReset}
              disabled={resetting || isTraining}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-100 bg-slate-800/80 hover:bg-slate-700 px-2.5 py-1 rounded-lg transition-colors border border-slate-700/60 disabled:opacity-50"
              title="Bersihkan log & reset status pelatihan"
            >
              <RotateCcw size={12} className={resetting ? "animate-spin" : ""} />
              <span>Bersihkan & Reset</span>
            </button>
          </div>
        </div>

        {/* Terminal Body */}
        <div className="p-5 font-mono text-xs max-h-[380px] min-h-[220px] overflow-y-auto space-y-1.5 leading-relaxed bg-[#0b0f19]">
          {(!status?.logs || status.logs.length === 0) ? (
            <div className="text-slate-500 italic py-6 text-center">
              Belum ada log aktif. Klik "Mulai Latih Model AI" di atas untuk memulai proses pelatihan.
            </div>
          ) : (
            status.logs.map((log, idx) => {
              let colorClass = 'text-slate-300';
              if (log.level === 'epoch') colorClass = 'text-amber-400 font-bold';
              else if (log.level === 'success') colorClass = 'text-emerald-400 font-bold';
              else if (log.level === 'warning') colorClass = 'text-orange-400';
              else if (log.level === 'error') colorClass = 'text-rose-400 font-bold';

              return (
                <div key={idx} className="flex items-start gap-2.5 font-mono">
                  <span className="text-slate-600 select-none">[{log.timestamp}]</span>
                  <span className={colorClass}>{log.message}</span>
                </div>
              );
            })
          )}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
}
