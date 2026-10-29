'use client';

import React, { useState } from 'react';
import { Sparkles, ArrowRight, RefreshCcw, Palette } from 'lucide-react';

const questions = [
  {
    id: 1,
    text: 'Coba lihat urat nadi di pergelangan tanganmu di bawah cahaya matahari. Warna apa yang paling terlihat?',
    options: [
      { text: 'Biru atau Ungu', value: 'cool' },
      { text: 'Hijau atau Zaitun (Olive)', value: 'warm' },
      { text: 'Campuran Biru dan Hijau', value: 'neutral' },
    ],
  },
  {
    id: 2,
    text: 'Saat kamu berjemur di bawah sinar matahari cukup lama, apa reaksi kulitmu?',
    options: [
      { text: 'Cepat memerah atau mudah terbakar', value: 'cool' },
      { text: 'Langsung menggelap (tanning) dengan mudah', value: 'warm' },
      { text: 'Kadang memerah sedikit, lalu perlahan menggelap', value: 'neutral' },
    ],
  },
  {
    id: 3,
    text: 'Perhiasan warna apa yang paling membuat kulitmu terlihat lebih cerah dan "hidup"?',
    options: [
      { text: 'Perak / Silver / Emas Putih', value: 'cool' },
      { text: 'Emas / Gold / Rose Gold', value: 'warm' },
      { text: 'Dua-duanya terlihat sama-sama bagus', value: 'neutral' },
    ],
  },
];

type Undertone = 'cool' | 'warm' | 'neutral' | null;

const resultsInfo = {
  cool: {
    title: 'Cool Undertone ❄️',
    color: 'bg-[#E3F2FD] border-[#90CAF9] text-[#1565C0]',
    desc: 'Kulitmu memiliki rona dasar kebiruan, pink, atau merah. Foundation dan cushion dengan base pink akan sangat cocok untukmu agar wajah tidak terlihat kusam.',
    tips: 'Saat membeli makeup, cari shade yang memiliki kode huruf "C" (contoh: C15, Cool Porcelain) atau yang memiliki deskripsi "Rosy" / "Pinkish".',
  },
  warm: {
    title: 'Warm Undertone ☀️',
    color: 'bg-[#FFF8E1] border-[#FFE082] text-[#F57F17]',
    desc: 'Kulitmu memiliki rona dasar kuning, peach, atau keemasan. Kamu butuh makeup dengan base kuning agar menyatu sempurna dengan kulit aslimu.',
    tips: 'Carilah produk complexion dengan kode huruf "W" (contoh: W20, Warm Ivory) atau yang memiliki deskripsi "Golden" / "Yellowish".',
  },
  neutral: {
    title: 'Neutral Undertone 🌿',
    color: 'bg-[#F1F8E9] border-[#A5D6A7] text-[#2E7D32]',
    desc: 'Beruntungnya! Kulitmu memiliki keseimbangan rona pink dan kuning. Kamu cenderung cocok menggunakan banyak warna pakaian dan makeup.',
    tips: 'Cari shade foundation dengan kode huruf "N" (contoh: N20, Natural Beige) atau deskripsi "Neutral". Hindari base yang terlalu kuning atau terlalu pink pekat.',
  },
};

export default function UndertoneFinder() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<Undertone>(null);

  const handleAnswer = (val: string) => {
    const newAnswers = [...answers, val];
    setAnswers(newAnswers);

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      calculateResult(newAnswers);
    }
  };

  const calculateResult = (finalAnswers: string[]) => {
    const counts = { cool: 0, warm: 0, neutral: 0 };
    finalAnswers.forEach((ans) => {
      counts[ans as keyof typeof counts]++;
    });

    if (counts.cool > counts.warm && counts.cool > counts.neutral) setResult('cool');
    else if (counts.warm > counts.cool && counts.warm > counts.neutral) setResult('warm');
    else setResult('neutral'); // If tie or mostly neutral
  };

  const resetQuiz = () => {
    setCurrentStep(0);
    setAnswers([]);
    setResult(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-20">
      <div className="text-center space-y-4 mb-10">
        <span className="px-4 py-1.5 rounded-full bg-accent/20 text-accent-foreground text-xs font-bold uppercase tracking-wider inline-block">
          Interactive Tool
        </span>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center justify-center gap-3">
          <Palette className="text-primary" size={36} /> Undertone & Shade Finder
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Jawab 3 pertanyaan simpel ini untuk mengetahui warna dasar kulitmu agar tidak salah pilih shade makeup (Cushion / Foundation).
        </p>
      </div>

      <div className="bg-white p-6 md:p-10 rounded-[2rem] border border-border shadow-sm relative overflow-hidden min-h-[400px] flex flex-col justify-center">
        
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2"></div>

        {!result ? (
          <div className="max-w-2xl mx-auto w-full">
            {/* Progress Bar */}
            <div className="flex gap-2 mb-8">
              {questions.map((q, idx) => (
                <div 
                  key={q.id} 
                  className={`h-2 flex-1 rounded-full transition-all duration-300 ${idx <= currentStep ? 'bg-primary' : 'bg-muted'}`}
                />
              ))}
            </div>

            <div className="text-center mb-8">
              <span className="text-primary font-bold text-sm mb-2 block">Pertanyaan {currentStep + 1} dari {questions.length}</span>
              <h3 className="text-2xl font-bold text-foreground leading-snug">
                {questions[currentStep].text}
              </h3>
            </div>

            <div className="space-y-4">
              {questions[currentStep].options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(opt.value)}
                  className="w-full text-left p-5 rounded-2xl border-2 border-muted hover:border-primary/50 hover:bg-primary/5 transition-all group flex justify-between items-center"
                >
                  <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {opt.text}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    <ArrowRight size={16} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto w-full animate-in fade-in zoom-in duration-500">
            <div className="text-center mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-100 text-green-700 font-bold text-sm mb-4">
                <Sparkles size={16} /> Analisis Selesai
              </span>
              <h3 className="text-xl text-muted-foreground">Undertone kamu adalah:</h3>
            </div>

            <div className={`p-8 rounded-3xl border-2 text-center mb-8 ${resultsInfo[result].color}`}>
              <h2 className="text-4xl font-black mb-4">{resultsInfo[result].title}</h2>
              <p className="text-lg font-medium leading-relaxed mb-6 opacity-90">
                {resultsInfo[result].desc}
              </p>
              
              <div className="bg-white/60 p-6 rounded-2xl text-left border border-white/40 shadow-sm backdrop-blur-sm">
                <p className="text-sm font-bold uppercase tracking-wider mb-2 opacity-70">💡 Tips Memilih Shade:</p>
                <p className="font-semibold">{resultsInfo[result].tips}</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <button 
                onClick={resetQuiz}
                className="px-8 py-3 rounded-full border-2 border-border font-bold hover:bg-muted transition-all flex items-center justify-center gap-2 text-muted-foreground"
              >
                <RefreshCcw size={18} /> Coba Ulangi
              </button>
              <button 
                onClick={() => window.dispatchEvent(new Event('open-chatbot'))}
                className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all flex items-center justify-center shadow-lg shadow-primary/20"
              >
                Cari Produk yang Cocok di AI
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
