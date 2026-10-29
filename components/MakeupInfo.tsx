'use client';

import React from 'react';
import { Sparkles, Droplets, Shield, Brush } from 'lucide-react';

export default function MakeupInfo() {
  const cards = [
    {
      title: 'Skin Prep 101',
      icon: <Droplets size={24} className="text-blue-500" />,
      color: 'bg-blue-50 border-blue-200',
      desc: 'Kunci makeup flawless dan tahan lama adalah kulit yang terhidrasi. Wajib gunakan moisturizer dan biarkan meresap selama 3-5 menit sebelum mengaplikasikan primer atau foundation.'
    },
    {
      title: 'Kenali Hasil Akhir (Finish)',
      icon: <Sparkles size={24} className="text-amber-500" />,
      color: 'bg-amber-50 border-amber-200',
      desc: 'Matte cocok untuk menahan minyak berlebih. Dewy/Glowy memberikan kesan sehat untuk kulit kering. Velvet/Satin berada di tengah, cocok untuk kulit kombinasi.'
    },
    {
      title: 'Makeup Ramah Jerawat',
      icon: <Shield size={24} className="text-green-500" />,
      color: 'bg-green-50 border-green-200',
      desc: 'Pilih produk dengan label "Non-Comedogenic" atau "Oil-Free". Hindari foundation berbahan dasar minyak berat jika kulitmu rentan berjerawat atau sensitif.'
    },
    {
      title: 'Pentingnya Double Cleansing',
      icon: <Brush size={24} className="text-purple-500" />,
      color: 'bg-purple-50 border-purple-200',
      desc: 'Sabun cuci muka saja tidak cukup untuk menghapus makeup dan sunscreen. Selalu gunakan Micellar Water, Cleansing Balm, atau Cleansing Oil sebelumnya!'
    }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto my-24 px-6">
      <div className="text-center space-y-4 mb-14">
        <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider inline-block">
          Edu Hub
        </span>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Edukasi Makeup Dasar</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Skincare dan makeup tidak bisa dipisahkan. Pahami dasar-dasarnya agar kulit tetap sehat meskipun sering menggunakan riasan.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <div 
            key={idx} 
            className={`p-8 rounded-3xl border transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/5 ${card.color} flex flex-col items-start`}
          >
            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6">
              {card.icon}
            </div>
            <h3 className="text-xl font-bold mb-3 text-foreground">{card.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {card.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
