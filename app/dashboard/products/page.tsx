'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { productsApi } from '@/lib/api/products';
import { categoriesApi } from '@/lib/api/categories';
import { formatRupiah } from '@/lib/utils';
import { Product, ProductCreate } from '@/types/product';
import { Category } from '@/types/category';
import { Search, Plus, Edit3, Trash2, ChevronLeft, ChevronRight, Package, AlertCircle, Download, Upload, FileText, X, CheckCircle2, ArrowRightLeft } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;
  const [error, setError] = useState('');
  const [importStats, setImportStats] = useState<{
    successCount: number;
    updatedCount: number;
    skippedCount: number;
    failedOthers: string[];
    invalidRows: number;
  } | null>(null);

  const [importConflicts, setImportConflicts] = useState<{
    row: { brand: string; name: string; description: string; price: number; categoryName: string; category_id: number };
    existingProduct: Product;
  }[] | null>(null);

  const downloadTemplate = () => {
    const headers = ["BRAND", "Name", "Description", "categories", "Price"];
    const sampleRow = ["SKINTIFIC", "SKINTIFIC 5X Ceramide Barrier Moisture Gel 30g", "Moisturizer yang melembapkan kulit", "Face Moisturizer", "119500"];
    const csvContent = [headers.join(","), sampleRow.join(",")].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "skintific_product_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToCSV = () => {
    const headers = ["BRAND", "Name", "Description", "categories", "Price"];
    const rows = products.map(p => {
      const catName = categories.find(c => c.id === p.category_id)?.name || 'N/A';
      const escape = (val: string | number) => {
        const text = String(val);
        if (text.includes(",") || text.includes('"') || text.includes("\n")) {
          return `"${text.replace(/"/g, '""')}"`;
        }
        return text;
      };
      return [
        escape(p.brand),
        escape(p.name),
        escape(p.description),
        escape(catName),
        escape(p.price)
      ];
    });
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `glamora_products_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCSV = (text: string) => {
    const lines: string[][] = [];
    let row: string[] = [];
    let inQuotes = false;
    let entry = '';

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          entry += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        row.push(entry.trim());
        entry = '';
      } else if ((char === '\r' || char === '\n') && !inQuotes) {
        row.push(entry.trim());
        entry = '';
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
        if (row.length > 1 || (row.length === 1 && row[0] !== '')) {
          lines.push(row);
        }
        row = [];
      } else {
        entry += char;
      }
    }
    if (entry || row.length > 0) {
      row.push(entry.trim());
      lines.push(row);
    }
    return lines;
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setLoading(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const csvRows = parseCSV(text);
        if (csvRows.length < 2) {
          throw new Error('CSV file is empty or invalid.');
        }

        const headers = csvRows[0].map(h => h.toUpperCase());
        const brandIdx = headers.indexOf('BRAND');
        const nameIdx = headers.indexOf('NAME');
        const descIdx = headers.indexOf('DESCRIPTION');
        const catIdx = headers.indexOf('CATEGORIES');
        const priceIdx = headers.indexOf('PRICE');

        if (brandIdx === -1 || nameIdx === -1 || priceIdx === -1) {
          throw new Error('CSV must contain BRAND, Name, and Price columns.');
        }

        let currentCategoriesResponse = await categoriesApi.list();
        let currentCategories = currentCategoriesResponse.data;

        let successCount = 0;
        let invalidRows = 0;
        const failedOthers: string[] = [];
        
        const conflicts: {
          row: { brand: string; name: string; description: string; price: number; categoryName: string; category_id: number };
          existingProduct: Product;
        }[] = [];

        // Pre-fetch latest products just to be safe
        const latestProductsResponse = await productsApi.list();
        const latestProducts = latestProductsResponse.data;

        for (let i = 1; i < csvRows.length; i++) {
          const row = csvRows[i];
          if (row.length < Math.max(brandIdx, nameIdx, priceIdx) + 1) continue;

          const brand = row[brandIdx];
          const name = row[nameIdx];
          const description = descIdx !== -1 ? row[descIdx] : '';
          const categoryName = catIdx !== -1 ? row[catIdx] : 'Uncategorized';
          const price = parseFloat(row[priceIdx].replace(/[^0-9.-]+/g, '')) || 0;

          if (!name || !brand || price <= 0) {
            invalidRows++;
            continue;
          }

          let category = currentCategories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
          let category_id: number;

          if (!category) {
            try {
              const newCatResp = await categoriesApi.create(categoryName);
              category_id = newCatResp.data.id;
              currentCategories.push(newCatResp.data);
            } catch (err) {
              category_id = currentCategories[0]?.id || 1;
            }
          } else {
            category_id = category.id;
          }

          const existingProduct = latestProducts.find(
            p => p.name.toLowerCase() === name.toLowerCase() && p.brand.toLowerCase() === brand.toLowerCase()
          );

          if (existingProduct) {
            conflicts.push({
              row: { brand, name, description, price, categoryName, category_id },
              existingProduct
            });
          } else {
            try {
              await productsApi.create({
                brand,
                name,
                description,
                price,
                category_id
              });
              successCount++;
            } catch (err) {
              failedOthers.push(`${brand} - ${name}`);
            }
          }
        }

        if (conflicts.length > 0) {
          setImportStats({
            successCount,
            updatedCount: 0,
            skippedCount: 0,
            failedOthers,
            invalidRows
          });
          setImportConflicts(conflicts);
        } else {
          setImportStats({
            successCount,
            updatedCount: 0,
            skippedCount: 0,
            failedOthers,
            invalidRows
          });
        }
        
        fetchData();
      } catch (err) {
        if (err instanceof Error) setError(err.message);
      } finally {
        setLoading(false);
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const resolveConflict = async (index: number, action: 'replace' | 'skip') => {
    if (!importConflicts || !importStats) return;
    
    const conflict = importConflicts[index];
    const newStats = { ...importStats };

    if (action === 'replace') {
      try {
        await productsApi.update(conflict.existingProduct.id, {
          brand: conflict.row.brand,
          name: conflict.row.name,
          description: conflict.row.description,
          price: conflict.row.price,
          category_id: conflict.row.category_id
        });
        newStats.updatedCount++;
      } catch (err) {
        newStats.failedOthers.push(`${conflict.row.brand} - ${conflict.row.name}`);
      }
    } else {
      newStats.skippedCount++;
    }

    setImportStats(newStats);
    
    const newConflicts = [...importConflicts];
    newConflicts.splice(index, 1);
    
    if (newConflicts.length === 0) {
      setImportConflicts(null);
      fetchData();
    } else {
      setImportConflicts(newConflicts);
    }
  };

  const resolveAllConflicts = async (action: 'replace' | 'skip') => {
    if (!importConflicts || !importStats) return;
    setLoading(true);
    
    const newStats = { ...importStats };
    
    if (action === 'replace') {
      for (const conflict of importConflicts) {
        try {
          await productsApi.update(conflict.existingProduct.id, {
            brand: conflict.row.brand,
            name: conflict.row.name,
            description: conflict.row.description,
            price: conflict.row.price,
            category_id: conflict.row.category_id
          });
          newStats.updatedCount++;
        } catch (err) {
          newStats.failedOthers.push(`${conflict.row.brand} - ${conflict.row.name}`);
        }
      }
    } else {
      newStats.skippedCount += importConflicts.length;
    }

    setImportStats(newStats);
    setImportConflicts(null);
    fetchData();
    setLoading(false);
  };

  const [form, setForm] = useState<Partial<Product>>({
    name: '', brand: '', description: '', price: 0, category_id: 0
  });
 
  const fetchData = useCallback(async () => {
    try {
      const [prodResp, catResp] = await Promise.all([
        productsApi.list(),
        categoriesApi.list()
      ]);
      setProducts(prodResp.data);
      setCategories(catResp.data);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);
 
  useEffect(() => {
    const load = async () => {
      await fetchData();
    };
    load();
  }, [fetchData]);
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (form.id) {
        await productsApi.update(form.id, form);
      } else {
        await productsApi.create(form as ProductCreate);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      if (err instanceof Error) {
        let msg = err.message;
        if (msg.includes('already exists')) {
          msg = 'Produk ini gagal ditambahkan karena sudah terupload (sudah ada).';
        }
        setError(msg);
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus produk ini?')) return;
    try {
      await productsApi.delete(id);
      fetchData();
    } catch (err) {
      if (err instanceof Error) alert(err.message);
    }
  };

  // Filter & Search Logic
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Katalog Produk</h1>
          <p className="text-sm text-muted-foreground">Kelola semua daftar produk skincare Skinwise by Glamora.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-2 bg-muted hover:bg-muted/80 text-muted-foreground px-4 py-3 rounded-xl font-bold border border-border transition-all active:scale-95 text-sm"
            title="Unduh Template CSV"
          >
            <FileText size={18} />
            <span>Template</span>
          </button>

          <label
            className="flex items-center gap-2 bg-muted hover:bg-muted/80 text-muted-foreground px-4 py-3 rounded-xl font-bold border border-border cursor-pointer transition-all active:scale-95 text-sm"
            title="Import dari CSV"
          >
            <Upload size={18} />
            <span>Import</span>
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleImportCSV}
            />
          </label>

          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-muted hover:bg-muted/80 text-muted-foreground px-4 py-3 rounded-xl font-bold border border-border transition-all active:scale-95 text-sm"
            title="Export ke CSV"
          >
            <Download size={18} />
            <span>Export</span>
          </button>

          <button
            onClick={() => {
              setForm({ name: '', brand: '', description: '', price: 0, category_id: categories[0]?.id || 0 });
              setShowModal(true);
            }}
            className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 text-sm"
          >
            <Plus size={18} />
            <span>Tambah Produk</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-background p-4 rounded-2xl border border-border shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text"
            placeholder="Cari produk atau brand..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all text-sm"
          />
        </div>
        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest hidden sm:block">
          Total: {filteredProducts.length} Produk
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-background rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">BRAND</th>
                <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">categories</th>
                <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </td>
                </tr>
              ) : paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground italic">
                    Tidak ada produk ditemukan.
                  </td>
                </tr>
              ) : paginatedProducts.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-6 py-4 text-sm text-foreground font-bold">{p.brand}</td>
                  <td className="px-6 py-4 text-sm text-foreground font-semibold">{p.name}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground max-w-[250px] truncate" title={p.description}>
                    {p.description}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-semibold px-2 py-1 bg-muted rounded-md text-foreground/70">
                      {categories.find(c => c.id === p.category_id)?.name || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-xs ring-1 ring-primary/20">
                      {formatRupiah(p.price)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => { setForm(p); setError(''); setShowModal(true); }} 
                        className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                        title="Edit"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(p.id)} 
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

        {/* Pagination Controls */}
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[100] overflow-y-auto">
          <div className="bg-background rounded-3xl max-w-2xl w-full p-6 md:p-8 my-auto shadow-2xl border border-border animate-chatbot-enter">
            <h2 className="text-xl md:text-2xl font-bold mb-6 text-foreground">{form.id ? 'Edit Produk' : 'Tambah Produk Baru'}</h2>
            
            {error && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold flex items-center gap-3 rounded-2xl animate-chatbot-enter">
                <AlertCircle size={18} />
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Nama Produk</label>
                  <input type="text" required className="w-full rounded-2xl border border-border bg-muted/20 p-4 text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Brand</label>
                  <input type="text" required className="w-full rounded-2xl border border-border bg-muted/20 p-4 text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all" value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Deskripsi</label>
                <textarea rows={3} required className="w-full rounded-2xl border border-border bg-muted/20 p-4 text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Harga (Rp)</label>
                  <input type="number" required className="w-full rounded-2xl border border-border bg-muted/20 p-4 text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold" value={form.price} onChange={e => setForm({...form, price: Number(e.target.value)})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Kategori</label>
                  <select className="w-full rounded-2xl border border-border bg-muted/20 p-4 text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none" value={form.category_id} onChange={e => setForm({...form, category_id: Number(e.target.value)})}>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>


              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-8 pt-6 border-t border-border">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 text-muted-foreground font-bold hover:text-foreground">Batal</button>
                <button type="submit" className="bg-primary text-primary-foreground px-6 md:px-10 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95">
                  {form.id ? 'Simpan Perubahan' : 'Terbitkan Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Conflict Resolution Modal */}
      {importConflicts && importConflicts.length > 0 && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[120] overflow-y-auto">
          <div className="bg-background rounded-3xl max-w-2xl w-full p-6 md:p-8 my-auto shadow-2xl border border-border animate-chatbot-enter">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <ArrowRightLeft className="text-amber-500" size={22} />
                <span>Resolusi Konflik Import ({importConflicts.length})</span>
              </h2>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              Beberapa produk dalam file CSV memiliki nama dan brand yang sama dengan produk yang sudah ada. 
              Pilih apakah Anda ingin menimpa data yang lama atau mengabaikannya.
            </p>

            <div className="max-h-[400px] overflow-y-auto space-y-3 mb-6 pr-2">
              {importConflicts.map((c, idx) => (
                <div key={idx} className="bg-muted/30 p-4 rounded-2xl border border-border flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1 w-full overflow-hidden">
                    <div className="font-bold text-sm text-foreground mb-3">{c.row.brand} - {c.row.name}</div>
                    <div className="grid grid-cols-[70px_1fr_1fr] gap-x-3 gap-y-2 text-xs">
                      <div className="font-semibold text-muted-foreground/70">Atribut</div>
                      <div className="font-bold text-amber-600 dark:text-amber-500">Data Baru (CSV)</div>
                      <div className="font-bold text-muted-foreground">Data Lama</div>

                      <div className="text-muted-foreground font-medium">Harga</div>
                      <div className="font-semibold text-foreground">{formatRupiah(c.row.price)}</div>
                      <div className="text-muted-foreground line-through">{formatRupiah(c.existingProduct.price)}</div>

                      <div className="text-muted-foreground font-medium">Kategori</div>
                      <div className="font-semibold text-foreground truncate" title={c.row.categoryName}>{c.row.categoryName}</div>
                      <div className="text-muted-foreground truncate" title={categories.find(cat => cat.id === c.existingProduct.category_id)?.name || 'N/A'}>{categories.find(cat => cat.id === c.existingProduct.category_id)?.name || 'N/A'}</div>

                      <div className="text-muted-foreground font-medium">Deskripsi</div>
                      <div className="font-semibold text-foreground truncate" title={c.row.description}>{c.row.description || '-'}</div>
                      <div className="text-muted-foreground truncate" title={c.existingProduct.description}>{c.existingProduct.description || '-'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button 
                      onClick={() => resolveConflict(idx, 'skip')}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-background border border-border hover:bg-muted transition-colors"
                    >
                      Abaikan
                    </button>
                    <button 
                      onClick={() => resolveConflict(idx, 'replace')}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      Timpa
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
              <div className="flex gap-2 w-full sm:w-auto">
                <button 
                  onClick={() => resolveAllConflicts('skip')}
                  className="flex-1 sm:flex-none px-4 py-2 text-sm font-bold rounded-xl bg-background border border-border hover:bg-muted transition-colors"
                >
                  Abaikan Semua
                </button>
                <button 
                  onClick={() => resolveAllConflicts('replace')}
                  className="flex-1 sm:flex-none px-4 py-2 text-sm font-bold rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20 hover:bg-amber-500 hover:text-white transition-colors"
                >
                  Timpa Semua
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Result Modal */}
      {importStats && (!importConflicts || importConflicts.length === 0) && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[110] overflow-y-auto">
          <div className="bg-background rounded-3xl max-w-lg w-full p-6 md:p-8 my-auto shadow-2xl border border-border animate-chatbot-enter">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <FileText className="text-primary" size={22} />
                <span>Hasil Import Produk</span>
              </h2>
              <button 
                onClick={() => setImportStats(null)}
                className="p-1.5 hover:bg-muted rounded-xl transition-all text-muted-foreground hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Summary Banner */}
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center gap-3">
                <div className="bg-emerald-500/20 p-2 rounded-xl">
                  <CheckCircle2 size={20} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <div className="text-sm font-bold">Import Selesai</div>
                  <div className="text-xs opacity-90 mt-0.5">
                    {importStats.successCount} baru | {importStats.updatedCount} ditimpa | {importStats.skippedCount} diabaikan
                  </div>
                </div>
              </div>

              {/* Other failures list */}
              {importStats.failedOthers.length > 0 && (
                <div className="space-y-2 mt-4">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-1.5 text-destructive">
                    <AlertCircle size={14} />
                    <span>Gagal karena error sistem ({importStats.failedOthers.length})</span>
                  </div>
                  <div className="bg-destructive/5 border border-destructive/10 rounded-2xl p-3 max-h-[150px] overflow-y-auto space-y-1.5 text-xs text-destructive font-semibold">
                    {importStats.failedOthers.map((prod, idx) => (
                      <div key={idx} className="flex items-start gap-2 bg-destructive/10 p-2 rounded-xl">
                        <span className="mt-0.5">•</span>
                        <span>{prod}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Invalid rows info */}
              {importStats.invalidRows > 0 && (
                <p className="text-[11px] text-muted-foreground italic ml-1 mt-4">
                  * {importStats.invalidRows} baris dilewati karena data nama/brand kosong atau harga tidak valid.
                </p>
              )}
            </div>

            <div className="flex justify-end mt-8 pt-4 border-t border-border">
              <button 
                onClick={() => setImportStats(null)}
                className="bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 text-sm"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
