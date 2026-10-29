"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { MessageSquare, X, Maximize2, Minimize2, Send, Sparkles, User, BrainCircuit, Trash2, Lock } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { chatbotApi } from "@/lib/api/chatbot";
import { authApi } from "@/lib/api/auth";

interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
  reasoning?: string;
  isError?: boolean;
}

const suggestions = [
  "Rekomendasi serum untuk jerawat?",
  "Apa skincare terbaik untuk kulit kering?",
  "Cara menghilangkan bekas jerawat?",
  "Berapa harga produk terlaris?",
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "bot",
      content: "Halo! 👋 Saya Beauty Advisor virtual Skinwise by Glamora. Tanyakan apa saja seputar rekomendasi produk skincare untuk masalah kulitmu!",
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [historyKey, setHistoryKey] = useState("chatbotHistory_guest");
  const [isKeyLoaded, setIsKeyLoaded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await authApi.getMe();
        if (res && res.success && res.data && res.data.id) {
          setHistoryKey(`chatbotHistory_${res.data.id}`);
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (err) {
        setIsLoggedIn(false);
      } finally {
        setIsKeyLoaded(true);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!isKeyLoaded) return;
    try {
      const savedMessages = localStorage.getItem(historyKey);
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages);
        if (parsed && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch (err) {
      console.error("Gagal memuat history chat:", err);
    } finally {
      setIsLoaded(true);
    }
  }, [isKeyLoaded, historyKey]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(historyKey, JSON.stringify(messages));
    }
  }, [messages, isLoaded, historyKey]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, isFullScreen, isLoading, scrollToBottom]);

  useEffect(() => {
    const handleOpenChatbot = () => setIsOpen(true);
    window.addEventListener('open-chatbot', handleOpenChatbot);
    return () => window.removeEventListener('open-chatbot', handleOpenChatbot);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640 && isOpen) {
        setIsFullScreen(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsFullScreen(false);
      setIsClosing(false);
    }, 250);
  }, []);

  const nextIdRef = useRef(0);
  const generateId = useCallback(() => {
    nextIdRef.current += 1;
    return `msg-${nextIdRef.current}-${Date.now()}`;
  }, []);

  const handleSend = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;
    
    setInput("");
    const userMsgId = generateId();
    setMessages((prev) => [...prev, { id: userMsgId, role: "user", content: text }]);
    setIsLoading(true);

    try {
      const response = await chatbotApi.sendMessage(text);
      setMessages((prev) => [
        ...prev,
        { 
          id: generateId(), 
          role: "bot", 
          content: response.data.answer,
          reasoning: response.data.reasoning
        },
      ]);
    } catch (error: unknown) {
      console.error("Chatbot Error:", error);
      const errorMsg = error instanceof Error ? error.message : "Mohon maaf, server Skinwise by Glamora AI sedang sibuk. Ayo coba sebentar lagi!";
      setMessages((prev) => [
        ...prev,
        { 
          id: generateId(), 
          role: "bot", 
          content: errorMsg,
          isError: true 
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, generateId]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend(input);
    }
  };

  return (
    <>
      {/* FAB Button */}
      {!isOpen && !isClosing && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-linear-to-tr from-primary to-accent text-primary-foreground rounded-full shadow-xl shadow-primary/20 flex items-center justify-center transition-all duration-300 z-40 hover:scale-110 active:scale-95 group notranslate"
          translate="no"
          aria-label="Tanya Beauty Advisor Skinwise by Glamora"
        >
          <Sparkles size={30} className="group-hover:rotate-12 transition-transform" />
        </button>
      )}

      {/* Backdrop for Fullscreen */}
      {(isOpen || isClosing) && isFullScreen && (
        <div
          className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-50 ${isClosing ? "opacity-0 transition-opacity" : "chatbot-backdrop-enter"}`}
          onClick={handleClose}
        />
      )}

      {/* Chat Panel */}
      {(isOpen || isClosing) && (
        <div
          className={`fixed z-60 bg-background flex flex-col shadow-2xl transition-all duration-300 ease-in-out overflow-hidden notranslate
            ${isClosing ? "chatbot-exit" : "chatbot-enter"}
            ${isFullScreen
              ? "inset-0 w-full h-full rounded-none"
              : "bottom-6 right-6 w-[400px] h-[650px] rounded-3xl max-h-[calc(100vh-48px)] max-w-[calc(100vw-48px)]"
            }
            max-sm:inset-0 max-sm:w-full max-sm:h-full max-sm:rounded-none max-sm:bottom-0 max-sm:right-0 max-sm:max-h-full max-sm:max-w-full
          `}
          translate="no"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {/* Header */}
          <div className="bg-linear-to-r from-primary via-accent to-primary text-primary-foreground p-5 flex items-center justify-between shrink-0 shadow-md relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
             
             <div className="flex items-center gap-4 relative z-10">
                <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                  <Sparkles size={22} className="text-white animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-[16px] tracking-tight">Beauty Advisor AI</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                    <p className="text-[10px] font-medium text-primary-foreground/80 uppercase tracking-widest">Skinwise by Glamora Assistant</p>
                  </div>
                </div>
             </div>

             <div className="flex items-center gap-1 relative z-10">
                <button
                  onClick={() => {
                    if (confirm("Apakah Anda yakin ingin menghapus riwayat chat?")) {
                      localStorage.removeItem(historyKey);
                      setMessages([{
                        id: "1",
                        role: "bot",
                        content: "Halo! 👋 Saya Beauty Advisor virtual Skinwise by Glamora. Tanyakan apa saja seputar rekomendasi produk skincare untuk masalah kulitmu!",
                      }]);
                    }
                  }}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  title="Hapus Riwayat"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  onClick={() => setIsFullScreen(!isFullScreen)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors hidden sm:block"
                >
                  {isFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-black/10 rounded-full transition-colors"
                >
                  <X size={18} />
                </button>
             </div>
          </div>

          {!isLoggedIn ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-muted/30 text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <Lock size={36} className="text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Akses Terkunci</h3>
              <p className="text-muted-foreground text-sm mb-8 max-w-[280px] leading-relaxed">
                Silakan login terlebih dahulu untuk berkonsultasi dengan AI Beauty Advisor kami.
              </p>
              <Link 
                href="/login"
                onClick={handleClose}
                className="bg-primary text-primary-foreground px-8 py-3.5 rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
              >
                Login Sekarang
              </Link>
            </div>
          ) : (
            <>
              {/* Messages Timeline */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 bg-muted/30 space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse ml-auto max-w-[85%]" : "max-w-[95%] sm:max-w-[92%]"}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 shadow-sm
                  ${msg.role === "user" ? "bg-primary/10 text-primary" : "bg-background border border-border text-accent"}
                `}>
                  {msg.role === "user" ? <User size={16} /> : <Sparkles size={16} />}
                </div>

                <div className={`flex flex-col gap-1 min-w-0 ${msg.role === "user" ? "items-end" : "items-start flex-1"}`}>
                  
                  {/* Reasoning Section (Bot only) */}
                  {msg.reasoning && (
                    <div className="mb-2 w-full">
                      <div className="flex items-center gap-1.5 text-[11px] text-accent font-bold uppercase tracking-wider mb-1 ml-1">
                        <BrainCircuit size={12} />
                        <span>Analysis</span>
                      </div>
                      <div className="bg-accent/5 border border-accent/10 rounded-xl px-4 py-2 text-[12px] italic text-accent leading-relaxed">
                        {msg.reasoning}
                      </div>
                    </div>
                  )}

                  <div className={`px-5 py-3.5 rounded-2xl text-[14px] md:text-[15px] leading-relaxed relative w-full shadow-sm
                    ${msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-none"
                      : msg.isError
                        ? "bg-red-50 text-red-600 border border-red-100 rounded-tl-none"
                        : "bg-background border border-border text-foreground rounded-tl-none shadow-sm"
                    }
                  `}>
                    {msg.role === "user" ? (
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    ) : (
                      <div className="prose prose-sm max-w-none prose-rose wrap-break-word 
                        prose-p:leading-[1.6] prose-p:mb-3 prose-p:last:mb-0
                        prose-li:my-1 prose-ul:my-3 prose-ol:my-3
                        prose-strong:text-foreground prose-strong:font-bold
                        prose-headings:text-foreground prose-headings:font-bold prose-headings:mb-3 prose-headings:mt-4
                      ">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({...props}) => <p className="mb-3 last:mb-0" {...props} />,
                            a: ({...props}) => <a className="text-primary underline hover:text-primary/80 font-medium break-all" {...props} />,
                            ul: ({...props}) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />,
                            ol: ({...props}) => <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />,
                            li: ({...props}) => <li className="mb-0.5" {...props} />,
                            h3: ({...props}) => <h3 className="font-bold text-foreground text-base mb-2 mt-3" {...props} />,
                            h4: ({...props}) => <h4 className="font-semibold text-foreground text-[15px] mb-1.5 mt-2" {...props} />,
                            table: ({...props}) => <div className="overflow-x-auto my-3"><table className="w-full text-left border-collapse border border-border text-[13px]" {...props} /></div>,
                            th: ({...props}) => <th className="p-2 border border-border bg-muted font-bold" {...props} />,
                            td: ({...props}) => <td className="p-2 border border-border" {...props} />
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 uppercase font-bold tracking-tight px-1">
                    {msg.role === "user" ? "Kamu" : "Advisor"}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 items-start max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-background border border-border text-accent flex items-center justify-center shrink-0 mt-1 shadow-sm">
                  <Sparkles size={16} />
                </div>
                <div className="bg-background/80 border border-border px-5 py-4 rounded-2xl rounded-tl-none flex items-center gap-3">
                  <div className="flex space-x-1.5">
                    <div className="w-1.5 h-1.5 bg-accent/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-accent/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-accent/40 rounded-full animate-bounce"></div>
                  </div>
                  <span className="text-[12px] text-accent font-bold uppercase tracking-wider">Menganalisis...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-2" />
          </div>

          {/* Suggestions Area */}
          {messages.length === 1 && !isLoading && (
            <div className="px-5 pb-4 bg-muted/10">
              <p className="text-[11px] font-bold text-muted-foreground mb-3 ml-1 uppercase tracking-widest">Saran Konsultasi:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(s)}
                    className="text-[12px] bg-background border border-border text-foreground/70 hover:border-primary hover:text-primary px-4 py-2.5 rounded-2xl transition-all shadow-sm active:scale-95 text-left"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 bg-background border-t border-border shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-2 bg-muted/20 rounded-2xl p-1.5 pl-5 border border-border focus-within:border-primary/30 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Konsultasi kulitmu di sini..."
                className="flex-1 bg-transparent text-[14px] text-foreground outline-none py-3"
                disabled={isLoading}
                autoComplete="off"
              />
              <button
                onClick={() => handleSend(input)}
                disabled={!input.trim() || isLoading}
                className="w-12 h-12 bg-primary text-primary-foreground rounded-xl flex items-center justify-center disabled:opacity-40 hover:bg-primary/90 transition-all active:scale-90 shadow-lg shadow-primary/20"
              >
                <Send size={18} />
              </button>
            </div>
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground mt-4 font-bold uppercase tracking-tighter opacity-70">
                <Sparkles size={11} className="text-primary" />
                <span>Ditenagai Skinwise by Glamora AI Groq. Hasil bisa bervariasi.</span>
              </div>
            </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
