'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { datasetsApi } from '@/lib/api/datasets';
import { datasetCategoriesApi } from '@/lib/api/datasetCategories';
import { SkinDataset, SkinDatasetCreate } from '@/types/dataset';
import { DatasetCategory } from '@/types/dataset_category';
import { Search, Plus, Edit3, Trash2, ChevronLeft, ChevronRight, AlertCircle, UploadCloud, Cpu } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<SkinDataset[]>([]);
  const [categories, setCategories] = useState<DatasetCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<number | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;
  const [error, setError] = useState('');

  const [form, setForm] = useState<{ id?: number, category_id: number, file?: File | null }>({
    category_id: 0, file: null
  });
  
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [dsResp, catResp] = await Promise.all([
        datasetsApi.list(),
        datasetCategoriesApi.list()
      ]);
      setDatasets(dsResp.data);
      setCategories(catResp.data);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!form.id && !form.file) {
        setError('Pilih file gambar untuk di-upload!');
        return;
    }
    if (!form.category_id) {
        setError('Pilih kategori!');
        return;
    }
    
    try {
      const formData = new FormData();
      formData.append('category_id', form.category_id.toString());
      if (form.file) {
          formData.append('file', form.file);
      }
      
      if (form.id) {
        await datasetsApi.update(form.id, formData);
      } else {
        await datasetsApi.create(formData);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus dataset ini?')) return;
    try {
      await datasetsApi.delete(id);
      fetchData();
    } catch (err) {
      if (err instanceof Error) alert(err.message);
    }
  };

  const filteredDatasets = datasets.filter(d => {
    const matchesSearch = d.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.category?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || d.category_id === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredDatasets.length / ITEMS_PER_PAGE);
  const paginatedDatasets = filteredDatasets.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL 
    ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') 
    : 'http://127.0.0.1:8000';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dataset Gambar</h1>
          <p className="text-sm text-muted-foreground">Kelola dataset gambar kondisi kulit wajah.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/train-model"
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:from-violet-500 hover:to-indigo-500 transition-all active:scale-95 text-sm"
          >
            <Cpu size={18} />
            <span>Latih Model AI</span>
          </Link>
          <button
            onClick={() => {
              setForm({ category_id: categories.length > 0 ? categories[0].id : 0, file: null });
              setPreviewUrl(null);
              setShowModal(true);
            }}
            className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 text-sm"
          >
            <Plus size={18} />
            <span>Tambah Dataset</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-background p-4 rounded-2xl border border-border shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input 
                type="text"
                placeholder="Cari file atau label..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all text-sm"
              />
            </div>
            
            <select
                value={filterCategory}
                onChange={(e) => {
                    setFilterCategory(e.target.value === 'all' ? 'all' : Number(e.target.value));
                    setCurrentPage(1);
                }}
                className="w-full sm:w-48 bg-muted/50 border border-border rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all appearance-none"
            >
                <option value="all">Semua Kategori</option>
                {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                ))}
            </select>
        </div>
        
        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest hidden sm:block">
          Total: {filteredDatasets.length} Data
        </div>
      </div>

      <div className="bg-background rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-wider w-24">Preview</th>
                <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">File Name</th>
                <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Label</th>
                <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Path</th>
                <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </td>
                </tr>
              ) : paginatedDatasets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground italic">
                    Tidak ada dataset ditemukan.
                  </td>
                </tr>
              ) : paginatedDatasets.map((d) => (
                <tr key={d.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-6 py-3">
                    <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden relative flex items-center justify-center border border-border">
                      <Image 
                        src={`${BACKEND_URL}/${d.file_path}`} 
                        alt={d.category?.name || d.filename || 'Dataset Image'}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground font-semibold max-w-[200px] truncate" title={d.filename}>{d.filename}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-semibold px-2 py-1 bg-primary/10 text-primary rounded-md ring-1 ring-primary/20">
                      {d.category?.name || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground max-w-[200px] truncate" title={d.file_path}>
                    {d.file_path}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => { 
                            setForm({ id: d.id, category_id: d.category_id, file: null }); 
                            setPreviewUrl(`${BACKEND_URL}/${d.file_path}`);
                            setError(''); 
                            setShowModal(true); 
                        }} 
                        className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                        title="Edit"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(d.id)} 
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                        title="Hapus"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && totalPages > 1 && (
          <div className="px-6 py-4 bg-muted/20 border-t border-border flex items-center justify-between">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Halaman {currentPage} dari {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-border bg-background disabled:opacity-40 hover:bg-muted transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-border bg-background disabled:opacity-40 hover:bg-muted transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[100] overflow-y-auto">
          <div className="bg-background rounded-3xl max-w-lg w-full p-6 md:p-8 my-auto shadow-2xl border border-border animate-chatbot-enter">
            <h2 className="text-xl md:text-2xl font-bold mb-6 text-foreground">{form.id ? 'Edit Dataset' : 'Tambah Dataset'}</h2>
            
            {error && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold flex items-center gap-3 rounded-2xl animate-chatbot-enter">
                <AlertCircle size={18} />
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Kategori (Label)</label>
                <select 
                    required 
                    className="w-full rounded-2xl border border-border bg-muted/20 p-4 text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none" 
                    value={form.category_id} 
                    onChange={e => setForm({...form, category_id: Number(e.target.value)})}
                >
                    <option value="" disabled>Pilih Kategori</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">File Gambar Dataset</label>
                
                <div className="flex items-center gap-4">
                  {previewUrl && (
                      <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden relative border border-border">
                          <Image src={previewUrl} alt="Preview" fill className="object-cover" unoptimized />
                      </div>
                  )}
                  <label className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-2xl hover:bg-muted/30 hover:border-primary/50 transition-all cursor-pointer">
                      <UploadCloud className="text-muted-foreground mb-2" size={24} />
                      <span className="text-sm font-semibold text-foreground">Klik untuk upload gambar</span>
                      <span className="text-xs text-muted-foreground mt-1">JPG, JPEG, PNG (Maks. 5MB)</span>
                      <input 
                          type="file" 
                          accept="image/jpeg, image/png, image/jpg"
                          className="hidden" 
                          onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) {
                                  setForm({...form, file});
                                  setPreviewUrl(URL.createObjectURL(file));
                              }
                          }}
                          required={!form.id}
                      />
                  </label>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-8 pt-6 border-t border-border">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 text-muted-foreground font-bold hover:text-foreground">Batal</button>
                <button type="submit" className="bg-primary text-primary-foreground px-6 md:px-10 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
