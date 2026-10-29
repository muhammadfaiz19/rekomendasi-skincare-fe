'use client';

import React, { useState } from 'react';
import { Sun, Moon, Check, Droplets, Sparkles, Shield, Wind } from 'lucide-react';

const allProducts = [
  { id: 'cleanser', name: 'Facial Wash / Cleanser', icon: <Droplets size={16} /> },
  { id: 'toner', name: 'Toner / Essence', icon: <Wind size={16} /> },
  { id: 'serum', name: 'Serum / Ampoule', icon: <Sparkles size={16} /> },
  { id: 'moisturizer', name: 'Moisturizer / Pelembap', icon: <Droplets size={16} /> },
  { id: 'sunscreen', name: 'Sunscreen / Tabir Surya', icon: <Shield size={16} /> },
  { id: 'exfoliator', name: 'Exfoliator (AHA/BHA)', icon: <Sparkles size={16} /> },
  { id: 'micellar', name: 'Micellar Water / Cleansing Oil', icon: <Droplets size={16} /> },
];

export default function RoutineBuilder() {
  const [selected, setSelected] = useState<string[]>(['cleanser', 'moisturizer', 'sunscreen']);

  const toggleProduct = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(item => item !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  // Logic for AM Routine
  const getAMRoutine = () => {
    const routine = [];
    if (selected.includes('cleanser')) routine.push({ name: 'Facial Wash (Opsional, bisa hanya air)', note: 'Membersihkan sisa skincare malam' });
    if (selected.includes('toner')) routine.push({ name: 'Toner / Essence', note: 'Mengembalikan pH kulit & hidrasi awal' });
    if (selected.includes('serum')) routine.push({ name: 'Serum', note: 'Bahan aktif ringan (seperti Vitamin C)' });
    if (selected.includes('moisturizer')) routine.push({ name: 'Moisturizer', note: 'Mengunci kelembapan' });
    if (selected.includes('sunscreen')) routine.push({ name: 'Sunscreen', note: 'Wajib! Perlindungan dari sinar UV' });
    return routine;
  };

  // Logic for PM Routine
  const getPMRoutine = () => {
    const routine = [];
    if (selected.includes('micellar')) routine.push({ name: 'First Cleanser (Micellar/Oil)', note: 'Menghapus makeup dan sunscreen' });
    if (selected.includes('cleanser')) routine.push({ name: 'Facial Wash (Second Cleanser)', note: 'Membersihkan pori-pori secara mendalam' });
    if (selected.includes('exfoliator')) routine.push({ name: 'Exfoliator (AHA/BHA)', note: 'Gunakan 1-2 kali seminggu saja' });
    if (selected.includes('toner')) routine.push({ name: 'Toner / Essence', note: 'Menyiapkan kulit untuk step selanjutnya' });
    if (selected.includes('serum')) routine.push({ name: 'Serum', note: 'Perawatan spesifik (Retinol, Niacinamide, dll)' });
    if (selected.includes('moisturizer')) routine.push({ name: 'Moisturizer', note: 'Lebih tebal untuk regenerasi kulit semalaman' });
    return routine;
  };

  const amRoutine = getAMRoutine();
  const pmRoutine = getPMRoutine();

  return (
    <div className="w-full max-w-4xl mx-auto my-20">
      <div className="text-center space-y-4 mb-10">
        <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider inline-block">
          Interactive Tool
        </span>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Skincare Routine Builder</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Pilih produk yang kamu miliki saat ini, dan kami akan menyusunkan urutan pemakaian yang paling tepat untuk pagi dan malam.
        </p>
      </div>

      <div className="bg-white p-6 md:p-10 rounded-[2rem] border border-border shadow-sm">
        <h3 className="text-lg font-bold mb-4">1. Pilih Produk Kamu</h3>
        <div className="flex flex-wrap gap-3 mb-10">
          {allProducts.map((prod) => {
            const isSelected = selected.includes(prod.id);
            return (
              <button
                key={prod.id}
                onClick={() => toggleProduct(prod.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
                  isSelected
                    ? 'bg-primary text-primary-foreground border-primary shadow-md'
                    : 'bg-background border-border text-muted-foreground hover:border-primary/50'
                }`}
              >
                {isSelected ? <Check size={16} /> : prod.icon}
                <span className="text-sm font-medium">{prod.name}</span>
              </button>
            );
          })}
        </div>

        <div className="h-px bg-border/50 mb-10 w-full" />

        <h3 className="text-lg font-bold mb-6">2. Urutan Pemakaian Terbaik</h3>
        
        {selected.length === 0 ? (
          <div className="text-center p-8 bg-muted rounded-2xl text-muted-foreground">
            Silakan pilih minimal satu produk di atas untuk melihat urutan pemakaian.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* AM Routine */}
            <div className="bg-[#FFFDF5] border border-[#FBE39A] p-6 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FBE39A]/20 rounded-full blur-2xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
              <div className="flex items-center gap-3 mb-6 text-[#A68019]">
                <Sun size={24} />
                <h4 className="font-bold text-xl uppercase tracking-wide">Pagi Hari</h4>
              </div>
              
              <div className="space-y-4 relative">
                <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-[#FBE39A]/50 -z-10"></div>
                {amRoutine.length > 0 ? amRoutine.map((step, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-8 h-8 shrink-0 rounded-full bg-white border-2 border-[#FBE39A] flex items-center justify-center text-xs font-bold text-[#A68019]">
                      {idx + 1}
                    </div>
                    <div className="pt-1">
                      <p className="font-bold text-[#806000]">{step.name}</p>
                      <p className="text-xs text-[#A68019] mt-0.5">{step.note}</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-[#A68019] italic">Tidak ada rutinitas pagi (disarankan minimal cuci muka & sunscreen).</p>
                )}
              </div>
            </div>

            {/* PM Routine */}
            <div className="bg-[#F5F8FF] border border-[#B8CFFF] p-6 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#B8CFFF]/20 rounded-full blur-2xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
              <div className="flex items-center gap-3 mb-6 text-[#2C5282]">
                <Moon size={24} />
                <h4 className="font-bold text-xl uppercase tracking-wide">Malam Hari</h4>
              </div>
              
              <div className="space-y-4 relative">
                <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-[#B8CFFF]/50 -z-10"></div>
                {pmRoutine.length > 0 ? pmRoutine.map((step, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-8 h-8 shrink-0 rounded-full bg-white border-2 border-[#B8CFFF] flex items-center justify-center text-xs font-bold text-[#2C5282]">
                      {idx + 1}
                    </div>
                    <div className="pt-1">
                      <p className="font-bold text-[#1A365D]">{step.name}</p>
                      <p className="text-xs text-[#2C5282] mt-0.5">{step.note}</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-[#2C5282] italic">Tidak ada rutinitas malam (disarankan minimal cuci muka & pelembap).</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
