'use client';

import React, { useState } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';

const ingredients = [
  {
    id: 'retinol',
    name: 'Retinol',
    desc: 'Mendorong regenerasi sel kulit dan produksi kolagen. Sangat efektif untuk kerutan dan jerawat.',
  },
  {
    id: 'niacinamide',
    name: 'Niacinamide',
    desc: 'Vitamin B3 yang memperkuat sawar kulit, mengontrol sebum, dan memudarkan noda hitam.',
  },
  {
    id: 'vit_c',
    name: 'Vitamin C',
    desc: 'Antioksidan kuat yang mencerahkan kulit dan melindungi dari radikal bebas.',
  },
  {
    id: 'aha_bha',
    name: 'AHA / BHA',
    desc: 'Eksfolian kimia untuk mengangkat sel kulit mati dan membersihkan pori-pori.',
  },
  {
    id: 'hyaluronic',
    name: 'Hyaluronic Acid',
    desc: 'Menghidrasi secara mendalam dengan menahan kelembapan di dalam kulit.',
  },
];

const compatibilityDB: Record<string, Record<string, any>> = {
  retinol: {
    niacinamide: {
      status: 'kompatibel',
      title: 'KOMPATIBEL & SINERGIS',
      desc: 'Kombinasi Hebat! Niacinamide memperkuat skin barrier dan menenangkan kulit, membantu mengurangi efek iritasi/kemerahan dari Retinol.',
    },
    vit_c: {
      status: 'waspada',
      title: 'GUNAKAN DI WAKTU BERBEDA',
      desc: 'Keduanya bahan aktif yang kuat. Gunakan Vitamin C di pagi hari dan Retinol di malam hari untuk menghindari iritasi.',
    },
    aha_bha: {
      status: 'berbahaya',
      title: 'HINDARI PENGGUNAAN BERSAMAAN',
      desc: 'Risiko iritasi tinggi! Keduanya mengeksfoliasi kulit. Gunakan di malam yang berbeda (skin cycling).',
    },
    hyaluronic: {
      status: 'kompatibel',
      title: 'SANGAT KOMPATIBEL',
      desc: 'Sempurna! Hyaluronic Acid memberikan hidrasi ekstra yang dapat menenangkan kulit saat menggunakan Retinol.',
    },
    retinol: {
      status: 'info',
      title: 'PILIH BAHAN LAIN',
      desc: 'Silakan pilih bahan aktif yang berbeda untuk melihat kecocokannya.',
    }
  },
  niacinamide: {
    vit_c: {
      status: 'waspada',
      title: 'PERHATIAN PENGGUNAAN',
      desc: 'Dulu dianggap tidak bisa dicampur, tapi formula modern umumnya aman. Namun jika kulit sensitif, jeda penggunaannya 15 menit.',
    },
    aha_bha: {
      status: 'kompatibel',
      title: 'KOMPATIBEL',
      desc: 'Bisa digunakan bersamaan. Niacinamide dapat membantu meredakan iritasi setelah eksfoliasi AHA/BHA.',
    },
    hyaluronic: {
      status: 'kompatibel',
      title: 'SANGAT KOMPATIBEL',
      desc: 'Kombinasi hidrasi dan perbaikan barrier yang sangat baik untuk kulit dehidrasi.',
    },
    niacinamide: {
      status: 'info',
      title: 'PILIH BAHAN LAIN',
      desc: 'Silakan pilih bahan aktif yang berbeda.',
    }
  },
  vit_c: {
    aha_bha: {
      status: 'berbahaya',
      title: 'HINDARI PENGGUNAAN BERSAMAAN',
      desc: 'Keduanya memiliki pH rendah dan asam. Menggabungkannya dapat menyebabkan iritasi parah dan merusak skin barrier.',
    },
    hyaluronic: {
      status: 'kompatibel',
      title: 'KOMPATIBEL',
      desc: 'Aman dan disarankan. Hyaluronic acid tidak mengganggu penyerapan Vitamin C.',
    },
    vit_c: {
      status: 'info',
      title: 'PILIH BAHAN LAIN',
      desc: 'Silakan pilih bahan aktif yang berbeda.',
    }
  },
  aha_bha: {
    hyaluronic: {
      status: 'kompatibel',
      title: 'SANGAT KOMPATIBEL',
      desc: 'Hyaluronic Acid sangat disarankan setelah menggunakan AHA/BHA untuk mengembalikan hidrasi yang hilang.',
    },
    aha_bha: {
      status: 'info',
      title: 'PILIH BAHAN LAIN',
      desc: 'Silakan pilih bahan aktif yang berbeda.',
    }
  },
  hyaluronic: {
    hyaluronic: {
      status: 'info',
      title: 'PILIH BAHAN LAIN',
      desc: 'Silakan pilih bahan aktif yang berbeda.',
    }
  }
};

// Helper untuk mendapatkan status bolak balik
const getCompatibility = (id1: string, id2: string) => {
  if (compatibilityDB[id1] && compatibilityDB[id1][id2]) return compatibilityDB[id1][id2];
  if (compatibilityDB[id2] && compatibilityDB[id2][id1]) return compatibilityDB[id2][id1];
  return {
    status: 'info',
    title: 'TIDAK ADA DATA',
    desc: 'Informasi kombinasi belum tersedia.',
  };
};

export default function IngredientChecker() {
  const [ing1, setIng1] = useState('retinol');
  const [ing2, setIng2] = useState('niacinamide');

  const selected1 = ingredients.find((i) => i.id === ing1);
  const selected2 = ingredients.find((i) => i.id === ing2);

  const result = getCompatibility(ing1, ing2);

  return (
    <div className="w-full max-w-4xl mx-auto my-20">
      <div className="text-center space-y-4 mb-10">
        <span className="px-4 py-1.5 rounded-full bg-muted text-muted-foreground text-xs font-bold uppercase tracking-wider inline-block">
          Interactive Tool
        </span>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Pengecek Kecocokan Bahan Aktif</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Pilih dua bahan aktif di bawah untuk langsung mengetahui apakah keduanya aman digunakan bersamaan.
        </p>
      </div>

      <div className="bg-[#FAF8F5] p-6 md:p-10 rounded-[2rem] border border-border shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Bahan 1 */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Bahan Aktif 1
            </label>
            <select
              value={ing1}
              onChange={(e) => setIng1(e.target.value)}
              className="w-full p-4 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-medium appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23695e7c'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.5em' }}
            >
              {ingredients.map((ing) => (
                <option key={ing.id} value={ing.id}>
                  {ing.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground leading-relaxed min-h-[3rem]">
              {selected1?.desc}
            </p>
          </div>

          {/* Bahan 2 */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Bahan Aktif 2
            </label>
            <select
              value={ing2}
              onChange={(e) => setIng2(e.target.value)}
              className="w-full p-4 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-medium appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23695e7c'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.5em' }}
            >
              {ingredients.map((ing) => (
                <option key={ing.id} value={ing.id}>
                  {ing.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground leading-relaxed min-h-[3rem]">
              {selected2?.desc}
            </p>
          </div>
        </div>

        <div className="h-px bg-border/50 mb-8 w-full" />

        {/* Result */}
        <div className={`p-6 rounded-2xl flex items-start gap-4 transition-all
          ${result.status === 'kompatibel' ? 'bg-[#E8F8F0] border border-[#BDE7D3] text-[#1D5E3F]' : ''}
          ${result.status === 'waspada' ? 'bg-[#FFF9E6] border border-[#FBE39A] text-[#806000]' : ''}
          ${result.status === 'berbahaya' ? 'bg-[#FFEDED] border border-[#FBCACA] text-[#9A1C1C]' : ''}
          ${result.status === 'info' ? 'bg-muted border border-border text-foreground' : ''}
        `}>
          <div className="mt-1 shrink-0">
            {result.status === 'kompatibel' && <CheckCircle size={24} className="text-[#218F5A]" />}
            {result.status === 'waspada' && <AlertTriangle size={24} className="text-[#C69A1C]" />}
            {result.status === 'berbahaya' && <XCircle size={24} className="text-[#D32F2F]" />}
            {result.status === 'info' && <Info size={24} className="text-muted-foreground" />}
          </div>
          <div className="space-y-1">
            <h4 className="font-bold uppercase tracking-wide flex items-center gap-2">
              {result.title}
            </h4>
            <p className={`text-sm leading-relaxed 
              ${result.status === 'kompatibel' ? 'text-[#218F5A]' : ''}
              ${result.status === 'waspada' ? 'text-[#A68019]' : ''}
              ${result.status === 'berbahaya' ? 'text-[#B22A2A]' : ''}
              ${result.status === 'info' ? 'text-muted-foreground' : ''}
            `}>
              {result.desc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
