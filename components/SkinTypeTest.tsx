'use client';

import React, { useState } from 'react';
import { SearchCode, RefreshCcw, Check, Droplets } from 'lucide-react';

const questions = [
  {
    id: 1,
    question: 'Bagaimana kondisi kulitmu saat bangun tidur (sebelum cuci muka)?',
    options: [
      { text: 'Terasa kencang dan kasar', type: 'kering' },
      { text: 'Mengkilap di seluruh wajah', type: 'berminyak' },
      { text: 'Berminyak di area T-Zone (dahi, hidung), kering di pipi', type: 'kombinasi' },
      { text: 'Biasa saja, tidak kering dan tidak berminyak', type: 'normal' },
    ]
  },
  {
    id: 2,
    question: 'Berapa lama efek pelembap bertahan di wajahmu?',
    options: [
      { text: 'Cepat hilang, kulit kembali terasa kering', type: 'kering' },
      { text: 'Wajah justru terasa berat dan semakin berminyak', type: 'berminyak' },
      { text: 'Bertahan baik, tapi area hidung/dahi cepat berminyak', type: 'kombinasi' },
      { text: 'Tahan seharian dengan nyaman', type: 'normal' },
    ]
  },
  {
    id: 3,
    question: 'Bagaimana reaksi kulitmu setelah menggunakan produk baru atau terkena sinar matahari/debu?',
    options: [
      { text: 'Sering kemerahan, gatal, atau iritasi', type: 'sensitif' },
      { text: 'Jarang iritasi, tapi mudah berjerawat/bruntusan', type: 'berminyak' },
      { text: 'Kadang kering/mengelupas', type: 'kering' },
      { text: 'Tidak ada reaksi berlebihan', type: 'normal' },
    ]
  }
];

const resultsInfo: Record<string, any> = {
  kering: {
    title: 'Kulit Kering (Dry Skin)',
    desc: 'Kulitmu kekurangan produksi sebum (minyak) alami, sehingga mudah kehilangan kelembapan dan terasa kencang/kasar.',
    tips: ['Gunakan sabun cuci muka yang lembut (gentle cleanser)', 'Wajib gunakan pelembap yang thick (mengandung Ceramide/Hyaluronic Acid)', 'Hindari eksfoliasi berlebihan']
  },
  berminyak: {
    title: 'Kulit Berminyak (Oily Skin)',
    desc: 'Kelenjar minyak di kulitmu sangat aktif, memproduksi sebum berlebih yang bisa menyumbat pori-pori dan menyebabkan jerawat.',
    tips: ['Gunakan pelembap bertekstur gel/water-based', 'Rutin lakukan eksfoliasi dengan BHA/Salicylic Acid (2-3x seminggu)', 'Selalu gunakan sunscreen non-comedogenic']
  },
  kombinasi: {
    title: 'Kulit Kombinasi (Combination Skin)',
    desc: 'Kamu memiliki dua tipe kulit sekaligus! Area T-Zone (Dahi, Hidung, Dagu) cenderung berminyak, sedangkan area U-Zone (Pipi) kering atau normal.',
    tips: ['Gunakan produk berbeda untuk area berbeda (multi-masking/moisturizing)', 'Pilih pembersih wajah yang seimbang (tidak terlalu bikin kering)', 'BHA cocok untuk area T-Zone']
  },
  normal: {
    title: 'Kulit Normal (Normal Skin)',
    desc: 'Selamat! Kulitmu tergolong seimbang, tidak terlalu berminyak maupun terlalu kering. Sawar kulitmu bekerja dengan sangat baik.',
    tips: ['Pertahankan rutinitas dasar: Cleansing, Toning, Moisturizing, Protecting (Sunscreen)', 'Eksplorasi bahan aktif seperti Vitamin C untuk mencerahkan', 'Hindari produk yang terlalu keras/abrasif']
  },
  sensitif: {
    title: 'Kulit Sensitif (Sensitive Skin)',
    desc: 'Sawar kulitmu (skin barrier) cenderung lebih tipis/lemah, sehingga mudah bereaksi terhadap pemicu dari luar seperti cuaca atau bahan kimia.',
    tips: ['Hindari produk dengan parfum (fragrance) atau alkohol', 'Fokus pada bahan yang menenangkan seperti Centella Asiatica, Mugwort, atau Ceramide', 'Selalu lakukan patch test sebelum mencoba produk baru']
  }
};

export default function SkinTypeTest() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<string | null>(null);

  const handleSelectOption = (type: string) => {
    const newAnswers = [...answers, type];
    setAnswers(newAnswers);

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      calculateResult(newAnswers);
    }
  };

  const calculateResult = (finalAnswers: string[]) => {
    // Hitung kemunculan tiap tipe
    const counts: Record<string, number> = {};
    finalAnswers.forEach(ans => {
      counts[ans] = (counts[ans] || 0) + 1;
    });

    // Cari tipe dengan skor terbanyak
    let maxType = 'normal';
    let maxCount = 0;
    
    // Jika ada 'sensitif' minimal 1 kali, kita bisa kasih label sensitif, atau kombinasi sensitif
    // Tapi untuk simplifikasi, kita cari mayoritas
    for (const [key, value] of Object.entries(counts)) {
      if (value > maxCount) {
        maxCount = value;
        maxType = key;
      }
    }

    // Special case: if there is sensitif in answer 3 and maxCount is just 1 (all different), 
    // prioritize sensitif or combinations.
    if (finalAnswers[2] === 'sensitif' && counts['sensitif'] >= 1 && maxCount < 2) {
      maxType = 'sensitif';
    }

    setResult(maxType);
  };

  const resetTest = () => {
    setCurrentStep(0);
    setAnswers([]);
    setResult(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-24 px-6">
      <div className="text-center space-y-4 mb-10">
        <div className="w-16 h-16 mx-auto bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-4">
          <SearchCode size={32} />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Kenali Tipe Kulitmu</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Masih bingung menentukan produk skincare karena tidak tahu tipe kulitmu? Coba ikuti kuis singkat ini.
        </p>
      </div>

      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-border shadow-sm max-w-3xl mx-auto relative overflow-hidden">
        {/* Progress Bar */}
        {!result && (
          <div className="absolute top-0 left-0 w-full h-1.5 bg-muted">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(currentStep / questions.length) * 100}%` }}
            />
          </div>
        )}

        {!result ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
                Pertanyaan {currentStep + 1} dari {questions.length}
              </span>
              <h3 className="text-xl md:text-2xl font-bold text-foreground leading-snug">
                {questions[currentStep].question}
              </h3>
            </div>

            <div className="space-y-3">
              {questions[currentStep].options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(opt.type)}
                  className="w-full text-left p-4 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all group flex items-center justify-between"
                >
                  <span className="text-foreground group-hover:text-primary font-medium">{opt.text}</span>
                  <div className="w-5 h-5 rounded-full border border-muted-foreground/30 group-hover:border-primary group-hover:bg-primary/10 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-transparent group-hover:bg-primary transition-all scale-0 group-hover:scale-100" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center space-y-6 animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 mx-auto bg-[#E8F8F0] text-[#1D5E3F] rounded-full flex items-center justify-center border-4 border-[#BDE7D3]">
              <Droplets size={32} />
            </div>
            
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Hasil Analisis</span>
              <h3 className="text-3xl font-black text-foreground">{resultsInfo[result].title}</h3>
              <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
                {resultsInfo[result].desc}
              </p>
            </div>

            <div className="bg-muted/50 p-6 rounded-2xl text-left border border-border space-y-4 max-w-lg mx-auto mt-8">
              <h4 className="font-bold text-foreground flex items-center gap-2">
                <Check size={18} className="text-primary" /> Tips Perawatan Utama
              </h4>
              <ul className="space-y-3">
                {resultsInfo[result].tips.map((tip: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button 
              onClick={resetTest}
              className="inline-flex items-center gap-2 mt-8 px-6 py-2.5 rounded-full border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-all text-sm font-semibold"
            >
              <RefreshCcw size={16} /> Ulangi Kuis
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
