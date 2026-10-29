'use client';

import React from 'react';
import { Baby, ShieldAlert, ShieldCheck } from 'lucide-react';

export default function PregnancyGuide() {
  const safeIngredients = [
    { name: 'Vitamin C', desc: 'Mencerahkan dan antioksidan yang aman.' },
    { name: 'Niacinamide', desc: 'Sangat aman untuk mencerahkan dan menjaga skin barrier.' },
    { name: 'Hyaluronic Acid', desc: 'Aman untuk menghidrasi kulit.' },
    { name: 'Azelaic Acid', desc: 'Alternatif aman untuk mengatasi jerawat dan kemerahan saat hamil.' },
    { name: 'AHA (Glycolic/Lactic Acid)', desc: 'Aman dalam konsentrasi rendah (<10%).' },
    { name: 'Bakuchiol', desc: 'Alternatif Retinol alami yang terbukti aman bagi ibu hamil.' },
  ];

  const avoidIngredients = [
    { name: 'Retinol & Retinoid', desc: 'Turunan Vitamin A konsentrasi tinggi dapat mengganggu perkembangan janin.' },
    { name: 'BHA (Salicylic Acid) Tinggi', desc: 'Konsentrasi >2% (peeling) sangat disarankan untuk dihindari.' },
    { name: 'Hydroquinone', desc: 'Bahan pencerah keras yang penyerapan ke aliran darahnya cukup tinggi.' },
    { name: 'Phthalates & Formaldehyde', desc: 'Bahan kimia berbahaya yang sering ada di produk tidak ber-BPOM.' },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto my-24 px-6">
      <div className="text-center space-y-4 mb-14">
        <div className="w-16 h-16 mx-auto bg-pink-100 rounded-2xl flex items-center justify-center text-pink-500 mb-4">
          <Baby size={32} />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Panduan Ibu Hamil & Menyusui</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Perubahan hormon selama kehamilan sering memicu jerawat atau melasma. Pilih kandungan skincare dengan hati-hati demi keamanan si kecil!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Safe Side */}
        <div className="bg-[#F6FDF9] border-2 border-[#D1F0E0] rounded-[2rem] p-8">
          <div className="flex items-center gap-3 mb-8">
            <ShieldCheck size={28} className="text-[#218F5A]" />
            <h3 className="text-2xl font-bold text-[#1D5E3F]">Aman Digunakan</h3>
          </div>
          <div className="space-y-4">
            {safeIngredients.map((item, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-[#E8F8F0]">
                <h4 className="font-bold text-[#218F5A] mb-1">{item.name}</h4>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Avoid Side */}
        <div className="bg-[#FFF8F8] border-2 border-[#FBD6D6] rounded-[2rem] p-8">
          <div className="flex items-center gap-3 mb-8">
            <ShieldAlert size={28} className="text-[#D32F2F]" />
            <h3 className="text-2xl font-bold text-[#9A1C1C]">Hindari Dulu</h3>
          </div>
          <div className="space-y-4">
            {avoidIngredients.map((item, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-[#FFEDED]">
                <h4 className="font-bold text-[#D32F2F] mb-1">{item.name}</h4>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
