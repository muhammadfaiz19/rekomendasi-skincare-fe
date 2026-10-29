'use client';

import { useCallback, useEffect, useState } from 'react';
import { categoriesApi } from '@/lib/api/categories';
import { Category } from '@/types/category';
import { Search, Plus, Edit3, Trash2, ChevronLeft, ChevronRight, Tag, Calendar, AlertCircle, X } from 'lucide-react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  const [form, setForm] = useState<Partial<Category>>({ name: '' });

  const fetchCategories = useCallback(async () => {
    try {
      const resp = await categoriesApi.list();
      setCategories(resp.data);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      await fetchCategories();
    };
    load();
  }, [fetchCategories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      if (form.id) {
        await categoriesApi.update(form.id, form.name);
      } else {
        await categoriesApi.create(form.name);
      }
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus kategori ini?')) return;
    try {
      await categoriesApi.delete(id);
      fetchCategories();
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    }
  };

  // Search & Filter
  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE);
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manajemen Kategori</h1>
          <p className="text-sm text-muted-foreground">Kelola kategori produk skincare Skinwise by Glamora.</p>
        </div>
        <button
          onClick={() => { setForm({ name: '' }); setShowModal(true); }}
          className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
        >
          <Plus size={18} />
          <span>Tambah Kategori</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-background p-4 rounded-3xl border border-border shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text"
            placeholder="Cari kategori..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-12 pr-4 py-3 bg-muted/30 border border-border rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
          />
        </div>
        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest hidden sm:block pr-2">
          Total: {filteredCategories.length} Kategori
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-background rounded-3xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="px-8 py-5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">ID</th>
                <th className="px-8 py-5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Nama Kategori</th>
                <th className="px-8 py-5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Calendar size={14} /> Tanggal Dibuat
                </th>
                <th className="px-8 py-5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-16 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </td>
                </tr>
              ) : paginatedCategories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-16 text-center text-muted-foreground italic text-sm">
                    Tidak ada kategori ditemukan.
                  </td>
                </tr>
              ) : (
                paginatedCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-8 py-5 text-sm text-muted-foreground font-mono">#{cat.id}</td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
                          <Tag size={18} />
                        </div>
                        <span className="font-bold text-foreground text-sm">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm text-muted-foreground">
                      {new Date(cat.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => { setForm(cat); setShowModal(true); }}
                          className="p-2.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                          title="Edit"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(cat.id)}
                          className="p-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
                          title="Hapus"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="px-8 py-5 bg-muted/10 border-t border-border flex items-center justify-between">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
              Halaman {currentPage} dari {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2.5 rounded-xl border border-border bg-background disabled:opacity-40 hover:bg-muted transition-colors shadow-sm"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2.5 rounded-xl border border-border bg-background disabled:opacity-40 hover:bg-muted transition-colors shadow-sm"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Kategori */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[100] overflow-y-auto">
          <div className="bg-background rounded-[40px] max-w-md w-full p-6 md:p-10 my-auto shadow-3xl border border-border animate-chatbot-enter">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                   <Tag size={22} />
                </div>
                {form.id ? 'Edit Kategori' : 'Kategori Baru'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground">
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold flex items-center gap-3 rounded-2xl animate-chatbot-enter">
                <AlertCircle size={18} />
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Nama Kategori</label>
                <input 
                  type="text" 
                  placeholder="misal: Serum Wajah" 
                  required 
                  className="w-full rounded-2xl border border-border bg-muted/20 p-4 text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold" 
                  value={form.name} 
                  onChange={e => setForm({...form, name: e.target.value})} 
                />
                <p className="text-[10px] text-muted-foreground ml-1 italic">* Pastikan nama kategori belum ada sebelumnya.</p>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-10 pt-6 border-t border-border">
                <button type="button" onClick={() => setShowModal(false)} className="px-8 py-4 text-muted-foreground font-bold hover:text-foreground">Batal</button>
                <button type="submit" disabled={submitting} className="bg-primary text-primary-foreground px-10 py-4 rounded-3xl font-bold shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50">
                  {submitting ? 'Menyimpan...' : (form.id ? 'Simpan Perubahan' : 'Tambah Kategori')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
