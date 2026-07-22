'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  GitBranch,
  Sparkles,
  CheckCircle2,
  Sliders,
  Eye,
  ShieldCheck,
  ArrowLeft,
  Users,
} from 'lucide-react';

export default function EcoGraphAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin/ecograph', label: 'Dashboard & Health', icon: LayoutDashboard },
    { href: '/admin/users', label: 'User Management', icon: Users },
    { href: '/admin/ecograph/editor', label: 'Visual Graph Editor', icon: GitBranch },
    { href: '/admin/ecograph/ai-ingest', label: 'AI Web Ingestion', icon: Sparkles },
    { href: '/admin/ecograph/drafts', label: 'Drafts & Versions', icon: CheckCircle2 },
    { href: '/admin/ecograph/settings', label: 'Global Physics Presets', icon: Sliders },
  ];

  return (
    <div className="h-screen w-screen bg-[#090a0f] text-zinc-100 flex font-sans select-none overflow-hidden">
      {/* Admin Sidebar Navigation */}
      <aside className="w-64 h-full bg-[#11131c] border-r border-zinc-800/80 flex flex-col justify-between p-4 flex-shrink-0">
        <div>
          {/* Header */}
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-zinc-800/80">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-wide">Knowledge Studio</h1>
              <span className="text-[10px] text-emerald-400 font-mono">EcoGraph Admin CMS</span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? 'bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 font-bold'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-zinc-800/80 space-y-2">
          <Link
            href="/ecograph"
            target="_blank"
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs font-medium text-zinc-300 transition"
          >
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            <span>Preview Public SaaS</span>
          </Link>
          <Link
            href="/desktop"
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-zinc-950 hover:bg-zinc-900 text-zinc-500 hover:text-zinc-300 rounded-lg text-xs transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Desktop</span>
          </Link>
        </div>
      </aside>

      {/* Main Admin Content Body with Full Height Scrolling */}
      <main className="flex-1 h-full bg-[#090a0f] overflow-y-auto p-6 min-w-0">{children}</main>
    </div>
  );
}
