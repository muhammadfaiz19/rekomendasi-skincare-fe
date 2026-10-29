'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { datasetCategoriesApi } from '@/lib/api/datasetCategories';
import { DatasetCategory, DatasetCategoryCreate } from '@/types/dataset_category';
import { Search, Plus, Edit3, Trash2, ChevronLeft, ChevronRight, AlertCircle, ListTree } from 'lucide-react';

export default function DatasetCategoriesPage() {
  const [categories, setCategories] = useState<DatasetCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;
  const [error, setError] = useState('');

  const [form, setForm] = useState<Partial<DatasetCategory>>({
    name: ''
  });

  const fetchData = useCallback(async () => {
    try {
      const response = await datasetCategoriesApi.list();
      setCategories(response.data);
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
    try {
      if (form.id) {
        await datasetCategoriesApi.update(form.id, form as any);
      } else {
        await datasetCategoriesApi.create(form as DatasetCategoryCreate);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus kategori dataset ini? Semua dataset yang terhubung juga mungkin terhapus (cascade). Lanjutkan?')) return;
    try {
      await datasetCategoriesApi.delete(id);
      fetchData();
    } catch (err) {
      if (err instanceof Error) alert(err.message);
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE);
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Kategori Dataset</h1>
          <p className="text-sm text-muted-foreground">Kelola label atau kategori kondisi kulit untuk dataset.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setForm({ name: '' });
              setShowModal(true);
            }}
            className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 text-sm"
          >
            <Plus size={18} />
            <span>Tambah Kategori</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-background p-4 rounded-2xl border border-border shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text"
            placeholder="Cari kategori..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all text-sm"
          />
        </div>
        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest hidden sm:block">
          Total: {filteredCategories.length} Kategori
        </div>
      </div>

      <div className="bg-background rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-wider w-24">ID</th>
                <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Nama Kategori</th>
                <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </td>
                </tr>
              ) : paginatedCategories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground italic">
                    Tidak ada kategori ditemukan.
                  </td>
                </tr>
              ) : paginatedCategories.map((c) => (
                <tr key={c.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-6 py-4 text-sm font-medium text-muted-foreground">#{c.id}</td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-foreground px-3 py-1.5 bg-primary/10 rounded-lg ring-1 ring-primary/20">
                      {c.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => { setForm(c); setError(''); setShowModal(true); }} 
                        className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                        title="Edit"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(c.id)} 
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
            <h2 className="text-xl md:text-2xl font-bold mb-6 text-foreground">{form.id ? 'Edit Kategori' : 'Tambah Kategori'}</h2>
            
            {error && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold flex items-center gap-3 rounded-2xl animate-chatbot-enter">
                <AlertCircle size={18} />
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Nama Kategori</label>
                <input type="text" required className="w-full rounded-2xl border border-border bg-muted/20 p-4 text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
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
