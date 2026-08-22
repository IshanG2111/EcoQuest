'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  ArrowLeft,
  Lock,
  Database,
  EyeOff,
  UserCheck,
  FileText,
  Cookie,
  Server,
  Baby,
  RefreshCw,
  Mail,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

const LAST_UPDATED = 'August 22, 2026';

const SECTIONS = [
  { id: 'collection', label: '1. Information We Collect', icon: Database },
  { id: 'usage', label: '2. How We Use Your Data', icon: UserCheck },
  { id: 'security', label: '3. Security & Storage', icon: Lock },
  { id: 'retention', label: '4. Immediate Data Deletion', icon: RefreshCw },
  { id: 'rights', label: '5. Your Rights (GDPR / CCPA)', icon: ShieldCheck },
  { id: 'cookies', label: '6. Essential Cookies Only', icon: Cookie },
  { id: 'subprocessors', label: '7. Third-Party Infrastructure', icon: Server },
  { id: 'children', label: '8. Children’s Privacy', icon: Baby },
  { id: 'contact', label: '9. Contact & Data Officer', icon: Mail },
];

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState('collection');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -60% 0px' }
    );

    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen h-screen overflow-y-auto bg-[#03070a] text-zinc-200 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />
      </div>

      {/* Sticky Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-[#03070a]/90 backdrop-blur-2xl px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/welcome"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white text-xs font-mono transition group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Return to Welcome</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>GAIA PRIVACY PROTOCOL</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        
        {/* Hero Title Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#080f14] via-[#050b0f] to-[#04080c] border border-zinc-800/90 p-6 sm:p-10 shadow-2xl mb-10">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/8 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-4 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-emerald-400 tracking-widest uppercase">
                Transparency & Data Governance
              </span>
              <span className="text-zinc-600">·</span>
              <span className="text-xs font-mono text-zinc-500">v2.6 // {LAST_UPDATED}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-sans">
              EcoQuest Privacy Policy
            </h1>

            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
              We believe in radical data minimalism. EcoQuest collects only what is required to provide an authentic, rewarding planetary educational computing experience. We do not sell data, track you across the web, or build advertising profiles.
            </p>
          </div>
        </div>

        {/* 2-Column Layout: Sticky Sidebar TOC + Scrollable Content */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
          
          {/* Sticky Left Table of Contents (Desktop) */}
          <aside className="hidden lg:block sticky top-24 space-y-1.5 bg-[#060c11]/80 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-3.5 shadow-xl">
            <p className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider px-2 py-1 mb-1">
              Table of Contents
            </p>
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              const isActive = activeSection === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => scrollToSection(s.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition text-left cursor-pointer ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 border border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{s.label}</span>
                </button>
              );
            })}
          </aside>

          {/* Main Policy Content */}
          <div className="space-y-8 min-w-0">

            {/* 1. Information We Collect */}
            <PolicyCard id="collection" title="1. Information We Collect" icon={Database}>
              <div className="space-y-5 text-sm text-zinc-300 leading-relaxed">
                <div>
                  <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    Account & Profile Identifiers
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-zinc-400">
                    <li><strong className="text-zinc-200">Display Name:</strong> Selected by you to personalize your Planetary Passport and global rankings.</li>
                    <li><strong className="text-zinc-200">Email Address:</strong> Used strictly for secure authentication and optional system alerts.</li>
                    <li><strong className="text-zinc-200">Passwords:</strong> Encrypted using industry-standard bcrypt salt hashing (cost factor ≥ 12). Passwords are never accessible in plaintext.</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-sky-400" />
                    Gameplay, Telemetry & Achievements
                  </h4>
                  <p className="text-zinc-400 mb-2">
                    To calculate your planetary XP level, streak multipliers, and unlocked badges, we record:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-zinc-400">
                    <li>Quiz answers, submission timestamps, and accuracy scores.</li>
                    <li>Minigame session durations and conservation points.</li>
                    <li>Claimed badges and EcoGraph node exploration progress.</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-400" />
                    Local Storage Exclusives (Not Sent to Server)
                  </h4>
                  <p className="text-zinc-400">
                    Your 3D Planetary Passport card customization (custom ink colors, custom rank stamps, generative textures) is stored strictly in your local browser storage (<code className="text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded font-mono text-xs">localStorage</code>). It is never sent to or stored on our servers.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-emerald-300">
                  <strong>Zero Surveillance Guarantee:</strong> EcoQuest does not use cross-site trackers, third-party analytics pixels (no Google Analytics, no Meta Pixel), or behavioral advertising cookies.
                </div>
              </div>
            </PolicyCard>

            {/* 2. How We Use Your Data */}
            <PolicyCard id="usage" title="2. How We Use Your Data" icon={UserCheck}>
              <div className="space-y-4 text-sm text-zinc-300 leading-relaxed">
                <p>We process your data strictly under recognized legal bases under the GDPR and CCPA:</p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse font-mono">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-wider">
                        <th className="py-2.5 px-3">Purpose</th>
                        <th className="py-2.5 px-3">Data Categories</th>
                        <th className="py-2.5 px-3">Legal Basis</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                      <tr>
                        <td className="py-2.5 px-3 font-sans font-medium text-white">Authentication & Account Management</td>
                        <td className="py-2.5 px-3">Email, Password Hash, Display Name</td>
                        <td className="py-2.5 px-3 text-emerald-400">Contractual Necessity</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-sans font-medium text-white">Progress Tracking & Global Leaderboards</td>
                        <td className="py-2.5 px-3">XP Points, Streak, Badges, Level</td>
                        <td className="py-2.5 px-3 text-emerald-400">Contractual Necessity</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-sans font-medium text-white">Email Digest & Streak Notifications</td>
                        <td className="py-2.5 px-3">Email, Notification Preferences</td>
                        <td className="py-2.5 px-3 text-sky-400">User Consent (Opt-in)</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-sans font-medium text-white">Platform Security & Rate Limiting</td>
                        <td className="py-2.5 px-3">IP Address (Anonymized), Request Logs</td>
                        <td className="py-2.5 px-3 text-amber-400">Legitimate Interest</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </PolicyCard>

            {/* 3. Security & Storage */}
            <PolicyCard id="security" title="3. Security & Infrastructure Storage" icon={Lock}>
              <div className="space-y-3 text-sm text-zinc-400 leading-relaxed">
                <p>We deploy bank-grade security practices across our cloud architecture:</p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li><strong className="text-zinc-200">Encrypted in Transit:</strong> All data transmissions are strictly enforced over HTTPS with TLS 1.3 encryption.</li>
                  <li><strong className="text-zinc-200">Encrypted at Rest:</strong> Database records are stored within an encrypted MongoDB Atlas cluster hosted with automated isolation and firewalls.</li>
                  <li><strong className="text-zinc-200">Credential Isolation:</strong> Service keys and API secrets are never exposed client-side and are rotated periodically.</li>
                </ul>
              </div>
            </PolicyCard>

            {/* 4. Immediate Data Deletion */}
            <PolicyCard id="retention" title="4. Immediate & Irreversible Data Deletion" icon={RefreshCw}>
              <div className="space-y-4 text-sm text-zinc-300 leading-relaxed">
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-2">
                  <h4 className="font-bold text-rose-400 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Permanent Cascade Erasure
                  </h4>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    When you delete your account in <strong className="text-white">Account Settings → Danger Zone</strong>, our system immediately runs a hard cascade deletion across all database collections:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-xs text-zinc-400 font-mono">
                    <li>User Profile & Credentials</li>
                    <li>All Quiz Attempts & Scores</li>
                    <li>All Minigame Records & Sessions</li>
                    <li>All System Notification Records</li>
                  </ul>
                  <p className="text-xs text-rose-300 font-semibold pt-1">
                    We do not retain &quot;soft deletes&quot; or shadow records. Once deleted, your data is gone forever.
                  </p>
                </div>
              </div>
            </PolicyCard>

            {/* 5. Your Rights */}
            <PolicyCard id="rights" title="5. Your Rights (GDPR / CCPA)" icon={ShieldCheck}>
              <div className="space-y-3 text-sm text-zinc-400 leading-relaxed">
                <p>Every EcoQuest user has full autonomy over their digital footprint:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {[
                    { title: 'Right to Access', desc: 'Request a full export of your personal data at any time.' },
                    { title: 'Right to Rectification', desc: 'Update or modify your profile name and credentials instantly.' },
                    { title: 'Right to Erasure', desc: 'Permanently delete your entire account with one click in settings.' },
                    { title: 'Right to Restrict Processing', desc: 'Opt out of leaderboards or notification emails seamlessly.' },
                  ].map((r) => (
                    <div key={r.title} className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-1">
                      <h5 className="font-bold text-white text-xs font-mono">{r.title}</h5>
                      <p className="text-xs text-zinc-400">{r.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </PolicyCard>

            {/* 6. Essential Cookies */}
            <PolicyCard id="cookies" title="6. Essential Cookies Only" icon={Cookie}>
              <div className="space-y-3 text-sm text-zinc-400 leading-relaxed">
                <p>EcoQuest only uses strictly necessary session cookies required for authentication and security:</p>
                <div className="overflow-x-auto font-mono text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-500 uppercase">
                        <th className="py-2 px-3">Cookie Name</th>
                        <th className="py-2 px-3">Function</th>
                        <th className="py-2 px-3">Lifespan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                      <tr>
                        <td className="py-2 px-3 text-emerald-400">__Secure-next-auth.session-token</td>
                        <td className="py-2 px-3 font-sans">Maintains your authenticated session state</td>
                        <td className="py-2 px-3 text-zinc-500">30 Days</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 text-emerald-400">next-auth.csrf-token</td>
                        <td className="py-2 px-3 font-sans">Protects against Cross-Site Request Forgery</td>
                        <td className="py-2 px-3 text-zinc-500">Session</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </PolicyCard>

            {/* 7. Sub-processors */}
            <PolicyCard id="subprocessors" title="7. Third-Party Infrastructure" icon={Server}>
              <div className="space-y-3 text-sm text-zinc-400 leading-relaxed">
                <p>We work with trusted infrastructure providers who adhere to strict data protection standards:</p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li><strong className="text-zinc-200">Vercel Inc.</strong> — Edge hosting and application delivery (USA / EU).</li>
                  <li><strong className="text-zinc-200">MongoDB Atlas</strong> — Managed database cloud with encryption at rest (AWS Cloud).</li>
                  <li><strong className="text-zinc-200">DiceBear API</strong> — Client-side SVG avatar generation via seed string (No personal data retained).</li>
                </ul>
              </div>
            </PolicyCard>

            {/* 8. Children's Privacy */}
            <PolicyCard id="children" title="8. Children’s Privacy" icon={Baby}>
              <div className="space-y-3 text-sm text-zinc-400 leading-relaxed">
                <p>
                  EcoQuest is an educational platform designed to inspire planetary stewardship across all ages. We do not knowingly collect personal data from children under 13 without consent. If you believe a child has created an account without parental guidance, please contact us for immediate deletion.
                </p>
              </div>
            </PolicyCard>

            {/* 9. Contact */}
            <PolicyCard id="contact" title="9. Contact & Data Protection Officer" icon={Mail}>
              <div className="space-y-4 text-sm text-zinc-300 leading-relaxed">
                <p>
                  For any privacy inquiries, data export requests, or security disclosures, reach our Data Governance team directly:
                </p>
                <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="font-bold text-white font-mono text-xs uppercase tracking-wider">
                      EcoQuest Data Governance Officer
                    </div>
                    <div className="text-xs text-zinc-400 mt-0.5">
                      Direct response time: within 24–48 hours
                    </div>
                  </div>
                  <a
                    href="mailto:privacy@ecoquest.org"
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs font-mono transition"
                  >
                    privacy@ecoquest.org
                  </a>
                </div>
              </div>
            </PolicyCard>

          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-zinc-800/80 text-center text-xs text-zinc-600 font-mono">
          ECOQUEST // PLANETARY SUSTAINABILITY COMPUTING // PRIVACY PROTOCOL 2026
        </footer>

      </div>
    </div>
  );
}

function PolicyCard({
  id,
  title,
  icon: Icon,
  children,
}: {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 p-6 sm:p-8 rounded-3xl bg-[#060c11]/80 backdrop-blur-xl border border-zinc-800/80 shadow-xl space-y-4 transition-all"
    >
      <div className="flex items-center gap-3 pb-3 border-b border-zinc-800/70">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
          <Icon className="w-4 h-4" />
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}
