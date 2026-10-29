'use client';

import React, { useState } from 'react';
import { BookOpen, Search, ChevronDown, ChevronUp } from 'lucide-react';

const dictionaryData = [
  {
    name: 'AHA (Alpha Hydroxy Acid)',
    desc: 'Eksfolian kimiawi yang larut dalam air. Bekerja di permukaan kulit untuk mengangkat sel kulit mati.',
    benefits: ['Mencerahkan kulit', 'Memudarkan noda hitam', 'Menghaluskan tekstur'],
    suitedFor: 'Kulit normal hingga kering',
  },
  {
    name: 'BHA (Beta Hydroxy Acid)',
    desc: 'Eksfolian kimiawi yang larut dalam minyak. Mampu menembus pori-pori untuk membersihkan sumbatan sebum.',
    benefits: ['Mengatasi komedo', 'Meredakan jerawat', 'Mengontrol minyak berlebih'],
    suitedFor: 'Kulit berminyak dan berjerawat',
  },
  {
    name: 'Niacinamide (Vitamin B3)',
    desc: 'Bahan aktif multifungsi yang lembut namun sangat efektif memperbaiki kondisi kulit.',
    benefits: ['Memperkuat skin barrier', 'Mengecilkan pori-pori', 'Mencerahkan wajah'],
    suitedFor: 'Semua tipe kulit',
  },
  {
    name: 'Retinol',
    desc: 'Turunan Vitamin A yang sangat ampuh untuk anti-aging dan perbaikan tekstur kulit.',
    benefits: ['Menyamarkan kerutan halus', 'Meningkatkan produksi kolagen', 'Mengatasi jerawat membandel'],
    suitedFor: 'Kulit dewasa, tidak untuk kulit sangat sensitif atau ibu hamil',
  },
  {
    name: 'Ceramide',
    desc: 'Lemak alami penyusun lapisan terluar kulit. Sangat penting untuk mempertahankan kelembapan.',
    benefits: ['Memperbaiki skin barrier yang rusak', 'Mencegah Transepidermal Water Loss (TEWL)', 'Menenangkan iritasi'],
    suitedFor: 'Semua tipe kulit, sangat disarankan untuk kulit sensitif/kering',
  },
];

export default function SkincareDictionary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filteredData = dictionaryData.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full max-w-4xl mx-auto my-24 px-6">
      <div className="text-center space-y-4 mb-10">
        <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4">
          <BookOpen size={32} />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Kamus Skincare</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Cari tahu fungsi dan manfaat dari berbagai bahan aktif yang sering muncul di produk skincare Anda.
        </p>
      </div>

      <div className="relative max-w-md mx-auto mb-10">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search size={18} className="text-muted-foreground" />
        </div>
        <input 
          type="text" 
          placeholder="Cari bahan (contoh: Niacinamide)..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {filteredData.length > 0 ? (
          filteredData.map((item, idx) => (
            <div 
              key={idx} 
              className="bg-white border border-border rounded-2xl overflow-hidden transition-all duration-200"
            >
              <button 
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none hover:bg-muted/50"
              >
                <h3 className="text-lg font-bold text-foreground">{item.name}</h3>
                {openIndex === idx ? <ChevronUp className="text-muted-foreground" /> : <ChevronDown className="text-muted-foreground" />}
              </button>
              
              <div className={`px-6 overflow-hidden transition-all duration-300 ${openIndex === idx ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
                <p className="text-muted-foreground mb-4 leading-relaxed">{item.desc}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary mb-2 block">Manfaat Utama</span>
                    <ul className="list-disc list-inside text-sm text-foreground/80 space-y-1">
                      {item.benefits.map((benefit, bIdx) => (
                        <li key={bIdx}>{benefit}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-accent/10 p-4 rounded-xl border border-accent/20">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-2 block">Cocok Untuk</span>
                    <p className="text-sm text-foreground/80">{item.suitedFor}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10">
            <p className="text-muted-foreground">Bahan aktif tidak ditemukan.</p>
          </div>
        )}
      </div>
    </div>
  );
}
