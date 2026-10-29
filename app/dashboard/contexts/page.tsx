'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { chatbotContextApi } from '@/lib/api/contexts';
import { ChatbotContext, ChatbotFile } from '@/types/context';
import { Save, Upload, Trash2, FileText, File as FileIcon, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ContextsPage() {
  const [mainContext, setMainContext] = useState<string>('');
  const [files, setFiles] = useState<ChatbotFile[]>([]);
  const [loadingContext, setLoadingContext] = useState(true);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [savingContext, setSavingContext] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchContext = useCallback(async () => {
    setLoadingContext(true);
    try {
      const resp = await chatbotContextApi.getContext("glamora");
      if (resp.data) {
        setMainContext(resp.data.context);
      }
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setLoadingContext(false);
    }
  }, []);

  const fetchFiles = useCallback(async () => {
    setLoadingFiles(true);
    try {
      const resp = await chatbotContextApi.listFiles();
      setFiles(resp.data || []);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setLoadingFiles(false);
    }
  }, []);

  useEffect(() => {
    fetchContext();
    fetchFiles();
  }, [fetchContext, fetchFiles]);

  const handleSaveContext = async () => {
    setSavingContext(true);
    setError('');
    setSuccess('');
    try {
      await chatbotContextApi.updateContext("glamora", { context: mainContext });
      setSuccess('Konteks utama berhasil disimpan!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setSavingContext(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    setSuccess('');
    try {
      await chatbotContextApi.uploadFile(file);
      setSuccess(`File ${file.name} berhasil diupload!`);
      setTimeout(() => setSuccess(''), 3000);
      fetchFiles();
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteFile = async (id: number) => {
    if (!confirm('Hapus file ini dari konteks AI?')) return;
    setError('');
    setSuccess('');
    try {
      await chatbotContextApi.deleteFile(id);
      setSuccess('File berhasil dihapus!');
      setTimeout(() => setSuccess(''), 3000);
      fetchFiles();
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pengetahuan Toko (Context AI)</h1>
          <p className="text-sm text-muted-foreground">Kelola informasi utama dan dokumen tambahan untuk asisten AI Anda.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm font-bold flex items-center gap-3 rounded-2xl">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-sm font-bold flex items-center gap-3 rounded-2xl">
          <CheckCircle2 size={18} />
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Main Context Editor */}
        <div className="bg-background rounded-3xl shadow-sm border border-border p-6 md:p-8 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold">Konteks Utama</h2>
              <p className="text-xs text-muted-foreground">Penjelasan umum mengenai toko, alamat, dan persona AI.</p>
            </div>
          </div>
          
          {loadingContext ? (
            <div className="flex-1 flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="flex flex-col flex-1 gap-4">
              <textarea
                value={mainContext}
                onChange={(e) => setMainContext(e.target.value)}
                placeholder="Masukkan prompt / konteks utama untuk AI..."
                className="w-full flex-1 min-h-[300px] rounded-2xl border border-border bg-muted/20 p-4 text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all leading-relaxed resize-y font-mono text-sm"
              />
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSaveContext}
                  disabled={savingContext}
                  className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Save size={18} />
                  <span>{savingContext ? 'Menyimpan...' : 'Simpan Konteks'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Files Context Manager */}
        <div className="bg-background rounded-3xl shadow-sm border border-border p-6 md:p-8 flex flex-col">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                <FileIcon size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold">Dokumen Tambahan</h2>
                <p className="text-xs text-muted-foreground">Upload file .txt atau markdown sebagai ilmu tambahan.</p>
              </div>
            </div>
            <input 
              type="file" 
              accept=".txt,.md,.csv" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileUpload} 
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center justify-center gap-2 bg-accent text-accent-foreground px-5 py-2.5 rounded-xl font-bold hover:bg-accent/90 transition-all active:scale-95 disabled:opacity-50 text-sm"
            >
              <Upload size={16} />
              <span>{uploading ? 'Upload...' : 'Upload File'}</span>
            </button>
          </div>

          <div className="flex-1 bg-muted/20 rounded-2xl border border-border p-4 overflow-y-auto max-h-[400px]">
            {loadingFiles ? (
              <div className="flex justify-center items-center h-full py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
              </div>
            ) : files.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-full py-16 text-center">
                <FileIcon size={40} className="text-muted-foreground opacity-30 mb-4" />
                <p className="text-muted-foreground italic text-sm">Belum ada dokumen tambahan.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {files.map((file) => (
                  <div key={file.id} className="bg-background border border-border p-4 rounded-xl flex items-center justify-between group hover:border-accent/30 transition-all">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2 bg-muted rounded-lg shrink-0">
                        <FileIcon size={16} className="text-muted-foreground" />
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-bold text-foreground truncate">{file.filename}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{new Date(file.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteFile(file.id)}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                      title="Hapus"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
