'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Desktop } from '@/components/desktop';
import { getAvatarUrl } from '@/lib/utils';
import '@/app/settings.css';
import {
  User, Mail, Bell, Shield, Palette, Globe2, LogOut,
  Check, ChevronRight, Camera, Leaf, Lock, Eye, EyeOff,
  Smartphone, Moon, Sun, Monitor, Volume2, VolumeX, Save,
  AlertTriangle, Trash2
} from 'lucide-react';

type Section = 'profile' | 'security' | 'notifications' | 'appearance' | 'privacy' | 'danger';

const NAV: { id: Section; label: string; icon: typeof User; desc: string }[] = [
  { id: 'profile',       label: 'Profile',       icon: User,    desc: 'Name, handle & avatar' },
  { id: 'security',      label: 'Security',       icon: Shield,  desc: 'Password & sessions' },
  { id: 'notifications', label: 'Notifications',  icon: Bell,    desc: 'Email & push alerts' },
  { id: 'appearance',    label: 'Appearance',     icon: Palette, desc: 'Theme & display' },
  { id: 'privacy',       label: 'Privacy',        icon: Lock,    desc: 'Data & visibility' },
  { id: 'danger',        label: 'Danger Zone',    icon: AlertTriangle, desc: 'Delete account' },
];

export default function AccountSettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [section, setSection] = useState<Section>('profile');

  // Profile
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');

  // Security
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);

  // Notifications
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(true);
  const [notifStreak, setNotifStreak] = useState(true);
  const [notifLeaderboard, setNotifLeaderboard] = useState(false);
  const [notifNews, setNotifNews] = useState(true);

  // Appearance
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  const [fontScale, setFontScale] = useState(1.08); // 1.0 = default, 1.08 = comfortable, 1.18 = large

  // Privacy
  const [profilePublic, setProfilePublic] = useState(true);
  const [showOnLeaderboard, setShowOnLeaderboard] = useState(true);
  const [shareProgress, setShareProgress] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  const avatarUrl = getAvatarUrl(user?.id || user?.name);

  useEffect(() => {
    if (user?.name) {
      setUsername(user.name.toLowerCase().replace(/\s+/g, '_'));
      setDisplayName(user.name);
    }
  }, [user]);

  // Load and apply font scale from localStorage
  useEffect(() => {
    const stored = parseFloat(localStorage.getItem('ecoquest_font_scale') ?? '1.08');
    setFontScale(isNaN(stored) ? 1.08 : stored);
    document.documentElement.style.setProperty('--ui-font-scale', String(isNaN(stored) ? 1.08 : stored));
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
    }, 800);
  }

  if (!user) {
    return <Desktop><div className="settings-loading"><Leaf className="animate-spin h-6 w-6" /> Loading…</div></Desktop>;
  }

  return (
    <Desktop>
      <div className="settings-root">
        {/* ── LEFT NAV ── */}
        <aside className="settings-nav">
          <div className="settings-nav-header">
            <div className="settings-user-avatar">
              <img src={avatarUrl} alt={displayName} />
              <div className="settings-avatar-edit">
                <Camera className="h-3 w-3" />
              </div>
            </div>
            <div className="settings-user-info">
              <p className="settings-user-name">{displayName || user.name}</p>
              <p className="settings-user-email">{user.email}</p>
            </div>
          </div>

          <nav className="settings-nav-list">
            {NAV.map(n => (
              <button
                key={n.id}
                className={`settings-nav-item ${section === n.id ? 'active' : ''} ${n.id === 'danger' ? 'danger' : ''}`}
                onClick={() => setSection(n.id)}
              >
                <n.icon className="h-4 w-4 flex-shrink-0" />
                <div className="settings-nav-text">
                  <span className="settings-nav-label">{n.label}</span>
                  <span className="settings-nav-desc">{n.desc}</span>
                </div>
                <ChevronRight className="h-3 w-3 ml-auto opacity-40" />
              </button>
            ))}
          </nav>

          <button className="settings-logout-btn">
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </aside>

        {/* ── CONTENT ── */}
        <main className="settings-main">

          {/* ── PROFILE ── */}
          {section === 'profile' && (
            <div className="settings-section">
              <div className="settings-section-header">
                <User className="h-5 w-5 text-primary" />
                <div>
                  <h2>Public Profile</h2>
                  <p>This information is shown to other players on the leaderboard.</p>
                </div>
              </div>

              <div className="settings-avatar-section">
                <div className="settings-avatar-large">
                  <img src={avatarUrl} alt="avatar" />
                </div>
                <div>
                  <p className="settings-avatar-hint">Your avatar is auto-generated from your username. Change your username to get a new one!</p>
                  <div className="settings-avatar-tags">
                    <span className="settings-chip">DiceBear Lorelei</span>
                    <span className="settings-chip">Auto-generated</span>
                  </div>
                </div>
              </div>

              <div className="settings-fields">
                <div className="settings-field">
                  <Label htmlFor="display-name">Display Name</Label>
                  <p className="settings-field-hint">Shown on your profile card and dashboard.</p>
                  <Input id="display-name" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name" className="settings-input" />
                </div>

                <div className="settings-field">
                  <Label htmlFor="username">Username / Handle</Label>
                  <p className="settings-field-hint">Used as @handle — must be unique, lowercase.</p>
                  <div className="settings-input-prefix">
                    <span className="settings-prefix">@</span>
                    <Input id="username" value={username} onChange={e => setUsername(e.target.value.toLowerCase().replace(/\s+/g,'_'))} placeholder="your_handle" className="settings-input settings-input-with-prefix" />
                  </div>
                </div>

                <div className="settings-field">
                  <Label htmlFor="email">Email Address</Label>
                  <p className="settings-field-hint">Used for login and notifications. Cannot be changed.</p>
                  <div className="settings-input-prefix">
                    <span className="settings-prefix"><Mail className="h-3.5 w-3.5" /></span>
                    <Input id="email" value={user.email ?? ''} disabled className="settings-input settings-input-with-prefix opacity-60" />
                  </div>
                </div>

                <div className="settings-field">
                  <Label htmlFor="bio">Bio</Label>
                  <p className="settings-field-hint">A short description about yourself (max 160 chars).</p>
                  <textarea
                    id="bio"
                    value={bio}
                    onChange={e => setBio(e.target.value.slice(0, 160))}
                    placeholder="Tell the community about yourself…"
                    rows={3}
                    className="settings-textarea"
                  />
                  <span className="settings-char-count">{bio.length}/160</span>
                </div>
              </div>

              <div className="settings-actions">
                <Button onClick={() => save('Profile updated!')} disabled={isSaving} className="settings-save-btn">
                  {isSaving ? <><Leaf className="animate-spin h-4 w-4" /> Saving…</> : <><Save className="h-4 w-4" /> Save Profile</>}
                </Button>
              </div>
            </div>
          )}

          {/* ── SECURITY ── */}
          {section === 'security' && (
            <div className="settings-section">
              <div className="settings-section-header">
                <Shield className="h-5 w-5 text-blue-400" />
                <div>
                  <h2>Security</h2>
                  <p>Manage your password and active sessions.</p>
                </div>
              </div>

              <div className="settings-group">
                <div className="settings-group-title">Change Password</div>
                <div className="settings-fields">
                  <div className="settings-field">
                    <Label htmlFor="cur-pw">Current Password</Label>
                    <div className="settings-input-suffix">
                      <Input id="cur-pw" type={showPw ? 'text' : 'password'} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Enter current password" className="settings-input" />
                      <button className="settings-suffix-btn" onClick={() => setShowPw(p => !p)}>
                        {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="settings-field">
                    <Label htmlFor="new-pw">New Password</Label>
                    <Input id="new-pw" type={showPw ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="At least 8 characters" className="settings-input" />
                    {newPassword.length > 0 && (
                      <div className="settings-pw-strength">
                        <div className={`settings-pw-bar ${newPassword.length < 6 ? 'weak' : newPassword.length < 10 ? 'medium' : 'strong'}`} />
                        <span>{newPassword.length < 6 ? 'Weak' : newPassword.length < 10 ? 'Fair' : 'Strong'}</span>
                      </div>
                    )}
                  </div>
                  <div className="settings-field">
                    <Label htmlFor="confirm-pw">Confirm New Password</Label>
                    <Input id="confirm-pw" type={showPw ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat new password" className="settings-input" />
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="settings-error">Passwords do not match.</p>
                    )}
                  </div>
                </div>
                <Button onClick={() => save('Password updated!')} disabled={isSaving || !currentPassword || newPassword !== confirmPassword} className="settings-save-btn">
                  {isSaving ? 'Saving…' : <><Lock className="h-4 w-4" /> Update Password</>}
                </Button>
              </div>

              <div className="settings-group">
                <div className="settings-group-title">Active Sessions</div>
                <div className="settings-session-list">
                  {[
                    { device: 'Chrome on Windows', location: 'Current session', icon: Monitor, current: true },
                    { device: 'Safari on iPhone', location: 'Last active 2 days ago', icon: Smartphone, current: false },
                  ].map(s => (
                    <div key={s.device} className="settings-session-item">
                      <s.icon className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="settings-session-device">{s.device}</p>
                        <p className="settings-session-loc">{s.location}</p>
                      </div>
                      {s.current ? <span className="settings-chip-green">Active</span> : <Button variant="ghost" size="sm" className="text-destructive text-xs">Revoke</Button>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── NOTIFICATIONS ── */}
          {section === 'notifications' && (
            <div className="settings-section">
              <div className="settings-section-header">
                <Bell className="h-5 w-5 text-yellow-400" />
                <div>
                  <h2>Notifications</h2>
                  <p>Choose what you want to be notified about.</p>
                </div>
              </div>

              <div className="settings-group">
                <div className="settings-group-title">Email Notifications</div>
                <div className="settings-toggles">
                  {[
                    { label: 'Weekly Progress Report', desc: 'A summary of your eco progress each week.', val: notifEmail, set: setNotifEmail },
                    { label: 'Streak Reminders', desc: 'Remind me to maintain my daily streak.', val: notifStreak, set: setNotifStreak },
                    { label: 'Leaderboard Updates', desc: 'Notify me when my rank changes significantly.', val: notifLeaderboard, set: setNotifLeaderboard },
                    { label: 'EcoQuest News', desc: 'New quizzes, features, and announcements.', val: notifNews, set: setNotifNews },
                  ].map(t => (
                    <div key={t.label} className="settings-toggle-row">
                      <div>
                        <p className="settings-toggle-label">{t.label}</p>
                        <p className="settings-toggle-desc">{t.desc}</p>
                      </div>
                      <button className={`settings-toggle ${t.val ? 'on' : ''}`} onClick={() => t.set(!t.val)}>
                        <span className="settings-toggle-thumb" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="settings-group">
                <div className="settings-group-title">Push Notifications</div>
                <div className="settings-toggles">
                  <div className="settings-toggle-row">
                    <div>
                      <p className="settings-toggle-label">Enable Push Notifications</p>
                      <p className="settings-toggle-desc">Browser push alerts for real-time updates.</p>
                    </div>
                    <button className={`settings-toggle ${notifPush ? 'on' : ''}`} onClick={() => setNotifPush(!notifPush)}>
                      <span className="settings-toggle-thumb" />
                    </button>
                  </div>
                </div>
              </div>

              <Button onClick={() => save('Notification preferences saved!')} disabled={isSaving} className="settings-save-btn">
                {isSaving ? 'Saving…' : <><Bell className="h-4 w-4" /> Save Preferences</>}
              </Button>
            </div>
          )}

          {/* ── APPEARANCE ── */}
          {section === 'appearance' && (
            <div className="settings-section">
              <div className="settings-section-header">
                <Palette className="h-5 w-5 text-purple-400" />
                <div>
                  <h2>Appearance</h2>
                  <p>Customize how EcoQuest looks and feels.</p>
                </div>
              </div>

              <div className="settings-group">
                <div className="settings-group-title">Eco Theme</div>
                <div className="settings-theme-grid">
                  {[
                    { id: 'the-verdant-grove', label: 'Verdant Grove', color1: '#22c55e', color2: '#134e10', desc: 'Deep Forest Green' },
                    { id: 'the-ember-hearth', label: 'Ember Hearth', color1: '#f97316', color2: '#7c2d12', desc: 'Blazing Fire' },
                    { id: 'the-abyssal-tide', label: 'Abyssal Tide', color1: '#06b6d4', color2: '#0c2044', desc: 'Deep Ocean Blue' },
                  ].map(t => (
                    <button key={t.id} className="settings-theme-card">
                      <div className="settings-theme-swatch" style={{ background: `linear-gradient(135deg, ${t.color1}, ${t.color2})` }} />
                      <p className="settings-theme-name">{t.label}</p>
                      <p className="settings-theme-desc">{t.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="settings-group">
                <div className="settings-group-title">Font Size</div>
                <div style={{ padding: '8px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span className="settings-toggle-label">Interface Text Size</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'hsl(var(--primary))', fontWeight: 700 }}>
                      {fontScale === 1.0 ? 'Default' : fontScale === 1.08 ? 'Comfortable' : fontScale === 1.18 ? 'Large' : fontScale === 1.3 ? 'Extra Large' : `${Math.round(fontScale * 100)}%`}
                    </span>
                  </div>
                  <input
                    type="range" min={0.9} max={1.35} step={0.01}
                    value={fontScale}
                    onChange={e => applyFontScale(parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: 'hsl(var(--primary))' }}
                  />
                  <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                    {[
                      { label: 'Default', val: 1.0 },
                      { label: 'Comfortable', val: 1.08 },
                      { label: 'Large', val: 1.18 },
                      { label: 'Extra Large', val: 1.30 },
                    ].map(p => (
                      <button
                        key={p.label}
                        onClick={() => applyFontScale(p.val)}
                        style={{
                          flex: 1, padding: '5px 4px', fontSize: '0.65rem', fontWeight: 700,
                          borderRadius: 6, border: '1px solid',
                          borderColor: Math.abs(fontScale - p.val) < 0.01 ? 'hsl(var(--primary))' : 'hsl(var(--border) / 0.5)',
                          background: Math.abs(fontScale - p.val) < 0.01 ? 'hsl(var(--primary) / 0.15)' : 'transparent',
                          color: Math.abs(fontScale - p.val) < 0.01 ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
                          cursor: 'pointer', transition: 'all 0.15s',
                        }}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                  <p className="settings-field-hint" style={{ marginTop: 8 }}>Changes apply instantly across the entire app.</p>
                </div>
              </div>

              <div className="settings-group">
                <div className="settings-group-title">Display</div>
                <div className="settings-toggles">
                  {[
                    { label: 'Sound Effects', desc: 'Play sounds for interactions and achievements.', icon: soundEnabled ? Volume2 : VolumeX, val: soundEnabled, set: setSoundEnabled },
                    { label: 'Reduce Motion', desc: 'Minimize animations for accessibility.', icon: Monitor, val: reducedMotion, set: setReducedMotion },
                    { label: 'Compact Mode', desc: 'Tighter spacing and smaller text.', icon: Monitor, val: compactMode, set: setCompactMode },
                  ].map(t => (
                    <div key={t.label} className="settings-toggle-row">
                      <div className="flex items-center gap-3">
                        <t.icon className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="settings-toggle-label">{t.label}</p>
                          <p className="settings-toggle-desc">{t.desc}</p>
                        </div>
                      </div>
                      <button className={`settings-toggle ${t.val ? 'on' : ''}`} onClick={() => t.set(!t.val)}>
                        <span className="settings-toggle-thumb" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── PRIVACY ── */}
          {section === 'privacy' && (
            <div className="settings-section">
              <div className="settings-section-header">
                <Lock className="h-5 w-5 text-cyan-400" />
                <div>
                  <h2>Privacy</h2>
                  <p>Control your data and how others see you.</p>
                </div>
              </div>

              <div className="settings-group">
                <div className="settings-group-title">Profile Visibility</div>
                <div className="settings-toggles">
                  {[
                    { label: 'Public Profile', desc: 'Other users can view your profile page.', val: profilePublic, set: setProfilePublic },
                    { label: 'Show on Leaderboard', desc: 'Display your name and score on global rankings.', val: showOnLeaderboard, set: setShowOnLeaderboard },
                    { label: 'Share Progress Reports', desc: 'Allow EcoQuest to include you in community stats.', val: shareProgress, set: setShareProgress },
                  ].map(t => (
                    <div key={t.label} className="settings-toggle-row">
                      <div>
                        <p className="settings-toggle-label">{t.label}</p>
                        <p className="settings-toggle-desc">{t.desc}</p>
                      </div>
                      <button className={`settings-toggle ${t.val ? 'on' : ''}`} onClick={() => t.set(!t.val)}>
                        <span className="settings-toggle-thumb" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="settings-group">
                <div className="settings-group-title">Your Data</div>
                <div className="flex gap-3 flex-wrap">
                  <Button variant="outline" size="sm" className="settings-outline-btn">
                    <Globe2 className="h-4 w-4" /> Download My Data
                  </Button>
                </div>
              </div>

              <Button onClick={() => save('Privacy settings saved!')} disabled={isSaving} className="settings-save-btn">
                {isSaving ? 'Saving…' : <><Lock className="h-4 w-4" /> Save Privacy Settings</>}
              </Button>
            </div>
          )}

          {/* ── DANGER ZONE ── */}
          {section === 'danger' && (
            <div className="settings-section">
              <div className="settings-section-header">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <div>
                  <h2>Danger Zone</h2>
                  <p>These actions are permanent and cannot be undone.</p>
                </div>
              </div>

              <div className="settings-danger-card">
                <div>
                  <p className="settings-danger-title">Reset All Progress</p>
                  <p className="settings-danger-desc">This will wipe all your Eco Points, badges, and streak data. Your account will remain active.</p>
                </div>
                <Button variant="outline" size="sm" className="border-orange-500/40 text-orange-400 hover:bg-orange-500/10">
                  <AlertTriangle className="h-4 w-4" /> Reset Progress
                </Button>
              </div>

              <div className="settings-danger-card settings-danger-red">
                <div>
                  <p className="settings-danger-title">Delete Account</p>
                  <p className="settings-danger-desc">Permanently delete your EcoQuest account. All data will be erased and you will be signed out immediately.</p>
                </div>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4" /> Delete Account
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </Desktop>
  );
}
