'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Desktop } from '@/components/desktop';
import { getAvatarUrl } from '@/lib/utils';
import Image from 'next/image';
import {
  User, Mail, Bell, Shield, Palette, Globe2, LogOut,
  ChevronRight, Loader2, Lock, Eye, EyeOff,
  Smartphone, Monitor, Volume2, VolumeX, Save,
  AlertTriangle, Trash2, CheckCircle2,
} from 'lucide-react';

type Section = 'profile' | 'security' | 'notifications' | 'appearance' | 'privacy' | 'danger';

const NAV: { id: Section; label: string; icon: typeof User }[] = [
  { id: 'profile',       label: 'Profile',       icon: User },
  { id: 'security',      label: 'Security',       icon: Shield },
  { id: 'notifications', label: 'Notifications',  icon: Bell },
  { id: 'appearance',    label: 'Appearance',     icon: Palette },
  { id: 'privacy',       label: 'Privacy',        icon: Lock },
  { id: 'danger',        label: 'Danger Zone',    icon: AlertTriangle },
];

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative flex-shrink-0 w-10 h-5 rounded-full transition-colors duration-200 cursor-pointer ${on ? 'bg-emerald-500' : 'bg-zinc-700'}`}
      role="switch"
      aria-checked={on}
    >
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${on ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  );
}

function SaveBtn({ onClick, saving }: { onClick: () => void; saving: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={saving}
      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold font-sans text-xs transition cursor-pointer disabled:opacity-60 shadow-md"
    >
      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
      <span>{saving ? 'Saving…' : 'Save Changes'}</span>
    </button>
  );
}

export default function AccountSettingsPage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [section, setSection] = useState<Section>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Profile
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');

  // Security
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);

  // Notifications
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifStreak, setNotifStreak] = useState(true);
  const [notifLeaderboard, setNotifLeaderboard] = useState(false);
  const [notifPush, setNotifPush] = useState(true);

  // Appearance
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [fontScale, setFontScale] = useState(1.08);

  // Privacy
  const [profilePublic, setProfilePublic] = useState(true);
  const [showOnLeaderboard, setShowOnLeaderboard] = useState(true);

  useEffect(() => {
    if (user?.name) setDisplayName(user.name);
  }, [user]);

  useEffect(() => {
    const stored = parseFloat(localStorage.getItem('ecoquest_font_scale') ?? '1.08');
    const val = isNaN(stored) ? 1.08 : stored;
    setFontScale(val);
    document.documentElement.style.setProperty('--ui-font-scale', String(val));
  }, []);

  function applyFontScale(value: number) {
    setFontScale(value);
    document.documentElement.style.setProperty('--ui-font-scale', String(value));
    localStorage.setItem('ecoquest_font_scale', String(value));
  }

  function save(msg = 'Settings saved successfully.') {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast({ title: '✓ Saved', description: msg });
    }, 600);
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Permanently delete your account? All progress, badges, and scores will be erased forever.')) return;
    try {
      setIsDeleting(true);
      const res = await fetch('/api/user/delete-account', { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        toast({ title: 'Account Deleted', description: 'Your data has been wiped.' });
        await logout();
      } else {
        toast({ title: 'Error', description: json.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Network error deleting account.', variant: 'destructive' });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) {
    return (
      <Desktop>
        <div className="flex items-center justify-center py-20 gap-2 text-zinc-500 font-sans text-sm">
          <Loader2 className="animate-spin w-4 h-4" /> Loading settings…
        </div>
      </Desktop>
    );
  }

  const avatarSeed = displayName || user.name || 'Explorer';
  const avatarUrl = getAvatarUrl(avatarSeed);

  return (
    <Desktop>
      <div className="max-w-4xl mx-auto font-sans pb-8 px-1 space-y-6">

        {/* ── Top Header Card ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#080d14]/90 border border-zinc-800/80 shadow-lg">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-700/80 overflow-hidden flex-shrink-0 shadow-md">
              <Image
                src={avatarUrl}
                alt={avatarSeed}
                width={48}
                height={48}
                unoptimized
                className="w-full h-full"
              />
            </div>
            <div>
              <p className="font-sans font-bold text-white text-base leading-snug">
                {displayName || user.name || 'Explorer'}
              </p>
              <p className="font-mono text-xs text-zinc-400">
                {user.email}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white text-xs font-mono transition cursor-pointer self-stretch sm:self-auto justify-center"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* ── Horizontal Navigation Tabs for Clean Adaptability ── */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {NAV.map((n) => {
            const Icon = n.icon;
            const active = section === n.id;
            const isDanger = n.id === 'danger';
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => setSection(n.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-sans font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  active
                    ? isDanger
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                      : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-sm'
                    : isDanger
                      ? 'text-rose-500/70 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 border border-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{n.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Content Card ── */}
        <div className="rounded-2xl bg-[#080d14]/90 border border-zinc-800/80 p-5 sm:p-7 shadow-xl space-y-6">

          {/* ── PROFILE SECTION ── */}
          {section === 'profile' && (
            <div className="space-y-5">
              <div className="border-b border-zinc-800/80 pb-3">
                <h2 className="font-sans font-bold text-base text-white">Public Profile</h2>
                <p className="font-sans text-xs text-zinc-400 mt-0.5">Customize how your identity appears across the Gaia network.</p>
              </div>

              {/* Avatar Live Preview */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
                <div className="w-16 h-16 rounded-xl bg-zinc-800 border border-zinc-700 overflow-hidden flex-shrink-0 shadow-inner">
                  <Image src={avatarUrl} alt={avatarSeed} width={64} height={64} unoptimized className="w-full h-full" />
                </div>
                <div className="space-y-0.5">
                  <p className="font-sans font-bold text-sm text-white">{avatarSeed}</p>
                  <p className="font-sans text-xs text-zinc-400">Dynamic avatar seeded from your display name.</p>
                  <p className="font-mono text-[11px] text-emerald-400 flex items-center gap-1 pt-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Synced with Dashboard & Passport
                  </p>
                </div>
              </div>

              <div className="space-y-4 font-sans">
                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-400 font-mono uppercase tracking-wide">Display Name</Label>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your name"
                    className="bg-zinc-900/90 border-zinc-800 text-white placeholder-zinc-600 focus:border-emerald-500/50 rounded-xl h-10 text-sm font-sans"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-400 font-mono uppercase tracking-wide">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                    <Input
                      value={user.email ?? ''}
                      disabled
                      className="bg-zinc-900/40 border-zinc-800/60 text-zinc-500 pl-9 rounded-xl h-10 text-sm font-mono cursor-not-allowed"
                    />
                  </div>
                  <p className="text-[11px] text-zinc-500">Authentication identifier (cannot be changed).</p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-400 font-mono uppercase tracking-wide">
                    Bio <span className="text-zinc-600 font-sans normal-case">(optional)</span>
                  </Label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value.slice(0, 160))}
                    placeholder="Write a brief note about your sustainability mission…"
                    rows={3}
                    className="w-full bg-zinc-900/90 border border-zinc-800 text-white placeholder-zinc-600 rounded-xl px-3.5 py-2.5 text-sm font-sans resize-none focus:outline-none focus:border-emerald-500/50 transition"
                  />
                  <p className="text-[11px] text-zinc-500 text-right font-mono">{bio.length}/160</p>
                </div>
              </div>

              <SaveBtn onClick={() => save('Profile updated!')} saving={isSaving} />
            </div>
          )}

          {/* ── SECURITY SECTION ── */}
          {section === 'security' && (
            <div className="space-y-5">
              <div className="border-b border-zinc-800/80 pb-3">
                <h2 className="font-sans font-bold text-base text-white">Security & Password</h2>
                <p className="font-sans text-xs text-zinc-400 mt-0.5">Manage authentication credentials and active sessions.</p>
              </div>

              <div className="space-y-3 font-sans">
                {[
                  { id: 'cur-pw', label: 'Current Password', val: currentPassword, set: setCurrentPassword },
                  { id: 'new-pw', label: 'New Password', val: newPassword, set: setNewPassword },
                  { id: 'confirm-pw', label: 'Confirm New Password', val: confirmPassword, set: setConfirmPassword },
                ].map((f) => (
                  <div key={f.id} className="space-y-1.5">
                    <Label className="text-xs text-zinc-400 font-mono uppercase tracking-wide">{f.label}</Label>
                    <div className="relative">
                      <Input
                        id={f.id}
                        type={showPw ? 'text' : 'password'}
                        value={f.val}
                        onChange={(e) => f.set(e.target.value)}
                        placeholder="••••••••"
                        className="bg-zinc-900/90 border-zinc-800 text-white pr-10 rounded-xl h-10 text-sm font-sans focus:border-emerald-500/50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw((p) => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition cursor-pointer"
                      >
                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))}

                {newPassword.length > 0 && (
                  <div className="flex items-center gap-2 pt-1">
                    <div className="flex-1 h-1 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className={`h-full transition-all ${newPassword.length < 6 ? 'w-1/3 bg-rose-500' : newPassword.length < 10 ? 'w-2/3 bg-amber-500' : 'w-full bg-emerald-500'}`}
                      />
                    </div>
                    <span className="text-[11px] font-mono text-zinc-500">
                      {newPassword.length < 6 ? 'Weak' : newPassword.length < 10 ? 'Fair' : 'Strong'}
                    </span>
                  </div>
                )}

                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-[11px] text-rose-400 font-sans">Passwords do not match.</p>
                )}
              </div>

              <SaveBtn onClick={() => save('Password updated!')} saving={isSaving} />

              {/* Active Sessions */}
              <div className="pt-4 border-t border-zinc-800/60 space-y-2.5">
                <p className="text-xs text-zinc-400 font-mono uppercase tracking-wide">Active Sessions</p>
                {[
                  { device: 'Desktop Browser', location: 'Current active session', Icon: Monitor, current: true },
                  { device: 'Mobile Browser', location: 'Active 2 days ago', Icon: Smartphone, current: false },
                ].map((s) => (
                  <div key={s.device} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60 font-sans">
                    <s.Icon className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white">{s.device}</p>
                      <p className="text-[11px] text-zinc-500">{s.location}</p>
                    </div>
                    {s.current ? (
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                        Current
                      </span>
                    ) : (
                      <button type="button" className="text-[11px] text-rose-400 hover:text-rose-300 font-mono transition cursor-pointer">
                        Revoke
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── NOTIFICATIONS SECTION ── */}
          {section === 'notifications' && (
            <div className="space-y-4">
              <div className="border-b border-zinc-800/80 pb-3">
                <h2 className="font-sans font-bold text-base text-white">Notification Preferences</h2>
                <p className="font-sans text-xs text-zinc-400 mt-0.5">Control how and when EcoQuest communicates alerts.</p>
              </div>

              {[
                { label: 'Weekly Progress Digest', desc: 'Summary of XP points earned, streak milestones, and badges.', val: notifEmail, set: setNotifEmail },
                { label: 'Streak Expiry Reminders', desc: 'Alerts to protect your consecutive daily login multiplier.', val: notifStreak, set: setNotifStreak },
                { label: 'Global Ranking Changes', desc: 'Notifications when your position shifts on the leaderboard.', val: notifLeaderboard, set: setNotifLeaderboard },
                { label: 'Push Notifications', desc: 'Real-time in-browser alerts for new ecological quests.', val: notifPush, set: setNotifPush },
              ].map((t) => (
                <div key={t.label} className="flex items-center justify-between py-3 border-b border-zinc-800/60 last:border-0 font-sans">
                  <div>
                    <p className="text-sm text-white font-medium">{t.label}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">{t.desc}</p>
                  </div>
                  <Toggle on={t.val} onChange={() => t.set(!t.val)} />
                </div>
              ))}

              <SaveBtn onClick={() => save('Notification preferences saved!')} saving={isSaving} />
            </div>
          )}

          {/* ── APPEARANCE SECTION ── */}
          {section === 'appearance' && (
            <div className="space-y-5">
              <div className="border-b border-zinc-800/80 pb-3">
                <h2 className="font-sans font-bold text-base text-white">Appearance & Accessibility</h2>
                <p className="font-sans text-xs text-zinc-400 mt-0.5">Tailor UI scaling, animations, and sound effects.</p>
              </div>

              {/* Font Scale Slider */}
              <div className="space-y-2.5 font-sans">
                <div className="flex justify-between items-center">
                  <Label className="text-xs text-zinc-400 font-mono uppercase tracking-wide">Interface Text Scaling</Label>
                  <span className="text-xs font-mono text-emerald-400 font-bold">
                    {fontScale <= 1.0 ? 'Default' : fontScale <= 1.08 ? 'Comfortable' : fontScale <= 1.18 ? 'Large' : 'Extra Large'}
                  </span>
                </div>
                <input
                  type="range"
                  min={0.9}
                  max={1.35}
                  step={0.01}
                  value={fontScale}
                  onChange={(e) => applyFontScale(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { l: 'Default', v: 1.0 },
                    { l: 'Comfortable', v: 1.08 },
                    { l: 'Large', v: 1.18 },
                    { l: 'XL', v: 1.30 },
                  ].map((p) => (
                    <button
                      key={p.l}
                      type="button"
                      onClick={() => applyFontScale(p.v)}
                      className={`py-1.5 rounded-lg text-xs font-mono border transition cursor-pointer ${
                        Math.abs(fontScale - p.v) < 0.01
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 font-bold'
                          : 'bg-zinc-900/60 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {p.l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-1 font-sans">
                {[
                  { label: 'Audio SFX', desc: 'Interactive audio cues on clicks and achievements.', Icon: soundEnabled ? Volume2 : VolumeX, val: soundEnabled, set: setSoundEnabled },
                  { label: 'Reduced Motion', desc: 'Disable heavy viewport transformations for accessibility.', Icon: Monitor, val: reducedMotion, set: setReducedMotion },
                ].map((t) => (
                  <div key={t.label} className="flex items-center justify-between py-3 border-b border-zinc-800/60 last:border-0">
                    <div className="flex items-center gap-3">
                      <t.Icon className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-white font-medium">{t.label}</p>
                        <p className="text-xs text-zinc-400 mt-0.5">{t.desc}</p>
                      </div>
                    </div>
                    <Toggle on={t.val} onChange={() => t.set(!t.val)} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── PRIVACY SECTION ── */}
          {section === 'privacy' && (
            <div className="space-y-4">
              <div className="border-b border-zinc-800/80 pb-3">
                <h2 className="font-sans font-bold text-base text-white">Privacy & Visibility</h2>
                <p className="font-sans text-xs text-zinc-400 mt-0.5">Control leaderboard visibility and data governance.</p>
              </div>

              {[
                { label: 'Public Leaderboard Profile', desc: 'Display your explorer name and score on global rankings.', val: showOnLeaderboard, set: setShowOnLeaderboard },
                { label: 'Public Explorer Card', desc: 'Allow other citizens to view your minted badges.', val: profilePublic, set: setProfilePublic },
              ].map((t) => (
                <div key={t.label} className="flex items-center justify-between py-3 border-b border-zinc-800/60 last:border-0 font-sans">
                  <div>
                    <p className="text-sm text-white font-medium">{t.label}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">{t.desc}</p>
                  </div>
                  <Toggle on={t.val} onChange={() => t.set(!t.val)} />
                </div>
              ))}

              <div className="pt-2">
                <SaveBtn onClick={() => save('Privacy settings saved!')} saving={isSaving} />
              </div>
            </div>
          )}

          {/* ── DANGER ZONE ── */}
          {section === 'danger' && (
            <div className="space-y-4">
              <div className="border-b border-rose-500/30 pb-3">
                <h2 className="font-sans font-bold text-base text-rose-400">Danger Zone</h2>
                <p className="font-sans text-xs text-zinc-400 mt-0.5">Permanent actions that cannot be reversed.</p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/60 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-sans">
                <div>
                  <p className="text-sm font-semibold text-white">Reset Gameplay Progress</p>
                  <p className="text-xs text-zinc-400 mt-0.5">Wipes all XP points, streak counters, and earned badges. Account stays active.</p>
                </div>
                <button
                  type="button"
                  onClick={() => toast({ title: 'Progress Reset', description: 'Your XP data was reset.' })}
                  className="flex-shrink-0 px-3.5 py-1.5 rounded-xl border border-amber-500/40 text-amber-400 hover:bg-amber-500/10 text-xs font-mono transition cursor-pointer"
                >
                  Reset
                </button>
              </div>

              <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-sans">
                <div>
                  <p className="text-sm font-semibold text-rose-300">Permanent Account Deletion</p>
                  <p className="text-xs text-zinc-400 mt-0.5">Permanently erases user credentials, scores, and all records. Immediate sign-out.</p>
                </div>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-mono font-bold transition cursor-pointer disabled:opacity-60"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isDeleting ? 'Erasing…' : 'Delete Account'}</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </Desktop>
  );
}
