'use client';

import { useEffect, useState } from 'react';
import { productsApi } from '@/lib/api/products';
import { categoriesApi } from '@/lib/api/categories';
import { chatbotContextApi } from '@/lib/api/contexts';
import { analyticsApi, RecentLogin } from '@/lib/api/analytics';

export default function DashboardOverview() {
  const [stats, setStats] = useState({ products: 0, categories: 0, contexts: 0, totalLoginsToday: 0 });
  const [recentLogins, setRecentLogins] = useState<RecentLogin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [p, c, ctxFiles, analytics] = await Promise.all([
          productsApi.list(),
          categoriesApi.list(),
          chatbotContextApi.listFiles(),
          analyticsApi.getLogins()
        ]);
        setStats({
          products: p.data.length,
          categories: c.data.length,
          contexts: ctxFiles.data.length,
          totalLoginsToday: analytics.data?.total_logins_today || 0
        });
        if (analytics.data?.recent_logins) {
          setRecentLogins(analytics.data.recent_logins);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const cards = [
    { title: 'Total Produk', value: stats.products, icon: '🧴', color: 'bg-primary' },
    { title: 'Kategori', value: stats.categories, icon: '🏷️', color: 'bg-accent' },
    { title: 'Info Konteks', value: stats.contexts, icon: '🧠', color: 'bg-foreground/10' },
    { title: 'Login Hari Ini', value: stats.totalLoginsToday, icon: '🔑', color: 'bg-blue-500' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-2">Selamat Datang, Admin!</h1>
      <p className="text-muted-foreground mb-8 text-sm font-medium">Berikut adalah ringkasan data toko Skinwise by Glamora hari ini.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div key={card.title} className="bg-background rounded-2xl shadow-sm border border-border p-6 flex items-center gap-6">
            <div className={`w-14 h-14 ${card.color} ${card.title === 'Info Konteks' ? 'text-foreground' : 'text-white'} rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-primary/10`}>
              {card.icon}
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{card.title}</p>
              <h3 className="text-2xl font-bold text-foreground">{loading ? '...' : card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-background rounded-2xl border border-border p-8">
        <h2 className="text-xl font-bold text-foreground mb-4">Aktivitas Login Terbaru</h2>
        {loading ? (
          <div className="h-40 bg-muted/30 rounded-2xl flex items-center justify-center border-2 border-dashed border-border">
             <p className="text-muted-foreground italic text-sm">Memuat data...</p>
          </div>
        ) : recentLogins.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/30 rounded-lg">
                <tr>
                  <th className="px-6 py-3 rounded-l-lg">Nama</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3 rounded-r-lg">Waktu Login</th>
                </tr>
              </thead>
              <tbody>
                {recentLogins.map((log) => (
                  <tr key={log.id} className="border-b border-border last:border-0">
                    <td className="px-6 py-4 font-medium text-foreground">{log.user_name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{log.user_email}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(log.login_timestamp).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="h-40 bg-muted/30 rounded-2xl flex items-center justify-center border-2 border-dashed border-border group hover:border-primary/30 transition-colors">
             <p className="text-muted-foreground italic text-sm group-hover:text-primary transition-colors">Belum ada aktivitas login hari ini.</p>
          </div>
        )}
      </div>
    </div>
  );
}
