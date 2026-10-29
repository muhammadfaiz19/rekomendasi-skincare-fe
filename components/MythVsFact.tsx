'use client';

import React, { useState } from 'react';
import { HelpCircle, RefreshCw } from 'lucide-react';

const cardsData = [
  {
    id: 1,
    myth: 'Kulit berminyak tidak butuh pelembap (moisturizer).',
    fact: 'Kulit berminyak tetap butuh dihidrasi. Jika dehidrasi, kulit justru memproduksi lebih banyak minyak. Kuncinya adalah memilih pelembap bertekstur gel (water-based) yang ringan.',
  },
  {
    id: 2,
    myth: 'Makin kuat scrub wajah, makin bersih pori-porinya.',
    fact: 'Scrub (physical exfoliator) yang kasar justru merusak lapisan pelindung kulit (skin barrier) dan memicu iritasi. Gunakan chemical exfoliator (AHA/BHA) untuk hasil yang lebih aman.',
  },
  {
    id: 3,
    myth: 'Tidak perlu pakai Sunscreen kalau cuma di dalam rumah.',
    fact: 'Sinar UVA (penyebab penuaan/keriput) dapat menembus kaca jendela. Bahkan radiasi dari gadget (blue light) juga berdampak buruk. Tetap gunakan sunscreen di dalam ruangan.',
  },
  {
    id: 4,
    myth: 'Sensasi perih/cekit-cekit artinya skincare sedang bekerja.',
    fact: 'Sensasi perih (tingling) wajar pada eksfolian atau Vitamin C di awal. Tapi jika rasa terbakar atau sangat perih, itu tanda iritasi/skin barrier sedang meradang.',
  },
];

export default function MythVsFact() {
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});

  const toggleCard = (id: number) => {
    setFlippedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="w-full max-w-6xl mx-auto my-24 px-6">
      <div className="text-center space-y-4 mb-14">
        <div className="w-16 h-16 mx-auto bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mb-4">
          <HelpCircle size={32} />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Mitos vs Fakta Skincare</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Masih percaya rumor menyesatkan seputar perawatan kulit? Balikkan kartu di bawah ini untuk melihat fakta sebenarnya yang diakui oleh dermatologis.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cardsData.map((card) => {
          const isFlipped = flippedCards[card.id];
          return (
            <div 
              key={card.id} 
              className="relative h-64 w-full [perspective:1000px] cursor-pointer group"
              onClick={() => toggleCard(card.id)}
            >
              <div 
                className={`absolute inset-0 w-full h-full transition-all duration-500 ease-in-out [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
              >
                {/* Bagian Mitos (Depan) */}
                <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] bg-[#FFF5F5] border-2 border-[#FFE0E0] rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-sm group-hover:-translate-y-1 transition-transform">
                  <span className="text-xs font-bold uppercase tracking-widest text-red-500 mb-4 bg-red-100 px-3 py-1 rounded-full">MITOS</span>
                  <p className="font-bold text-foreground text-lg leading-snug">
                    "{card.myth}"
                  </p>
                  <div className="mt-6 text-muted-foreground flex items-center gap-1 text-xs font-medium">
                    <RefreshCw size={12} className="animate-spin-slow" /> Klik untuk putar
                  </div>
                </div>

                {/* Bagian Fakta (Belakang) */}
                <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-[#E8F8F0] border-2 border-[#BDE7D3] rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-lg">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#218F5A] mb-4 bg-[#C3EED9] px-3 py-1 rounded-full">FAKTA</span>
                  <p className="font-medium text-[#1D5E3F] text-sm leading-relaxed">
                    {card.fact}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
