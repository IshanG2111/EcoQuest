'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, KeyRound, Lock, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function SecretAdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [securityCode, setSecurityCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      setLoading(true);
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 1, email }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Special admin address not recognized.');
      }
      setSuccessMsg('Special admin email verified. Enter Master Password.');
      setStep(2);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      setLoading(true);
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 2, email, password }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Invalid master password.');
      }
      setSuccessMsg('Master password verified. Enter 6-Digit Security Code.');
      setStep(3);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStep3 = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      setLoading(true);
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 3, email, password, securityCode }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Invalid 6-digit security code.');
      }
      setSuccessMsg('Authentication Granted. Opening Control Studio...');
      setTimeout(() => {
        router.push('/admin/ecograph');
      }, 800);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07080c] text-zinc-100 flex items-center justify-center p-4 font-sans select-none">
      <div className="w-full max-w-md bg-[#0e1017] border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-6">

        {/* Top Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-inner">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <h1 className="text-lg font-bold text-white tracking-wide">EcoGraph Master Control Gateway</h1>
          <p className="text-xs text-zinc-400">
            3-Step Multi-Factor Authentication Portal for Super Admin Control Studio.
          </p>
        </div>

        {/* Step Indicator Progress Bar */}
        <div className="flex items-center justify-center gap-2 font-mono text-[10px]">
          <span className={`px-2.5 py-1 rounded-full border ${step >= 1 ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300 font-bold' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>
            1. Email
          </span>
          <span className="text-zinc-700">➔</span>
          <span className={`px-2.5 py-1 rounded-full border ${step >= 2 ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300 font-bold' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>
            2. Password
          </span>
          <span className="text-zinc-700">➔</span>
          <span className={`px-2.5 py-1 rounded-full border ${step >= 3 ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300 font-bold' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>
            3. Security Code
          </span>
        </div>

        {/* Status Notifications */}
        {errorMsg && (
          <div className="p-3 bg-rose-950/80 border border-rose-800/80 rounded-lg text-xs text-rose-300 flex items-center gap-2 animate-in fade-in">
            <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && !errorMsg && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-800/80 rounded-lg text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* STEP 1 FORM: Special Email */}
        {step === 1 && (
          <form onSubmit={handleStep1} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1.5">Special Admin Gateway Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin.master@ecoquest.org"
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !email}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition shadow-lg"
            >
              {loading ? 'Verifying Address...' : 'Verify Special Email'} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* STEP 2 FORM: Custom Password */}
        {step === 2 && (
          <form onSubmit={handleStep2} className="space-y-4">
            <div className="p-2 bg-zinc-950 rounded border border-zinc-800 text-[10px] text-zinc-400 font-mono">
              Verified: <span className="text-emerald-400">{email}</span>
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1.5 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-emerald-400" /> Enter Master Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition shadow-lg"
            >
              {loading ? 'Authenticating Password...' : 'Verify Password'} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* STEP 3 FORM: Security Code */}
        {step === 3 && (
          <form onSubmit={handleStep3} className="space-y-4">
            <div className="p-2 bg-zinc-950 rounded border border-zinc-800 text-[10px] text-zinc-400 font-mono space-y-0.5">
              <div>Email: <span className="text-emerald-400">{email}</span></div>
              <div>Password: <span className="text-emerald-400">••••••••</span></div>
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1.5 flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" /> Enter 6-Digit Master Security Code
              </label>
              <input
                type="text"
                value={securityCode}
                onChange={e => setSecurityCode(e.target.value)}
                placeholder="987654"
                maxLength={6}
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-center text-base tracking-widest font-mono text-emerald-400 placeholder:text-zinc-700 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading || securityCode.length < 6}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition shadow-lg"
            >
              {loading ? 'Unlocking Control Studio...' : 'Unlock Control Page'} <ShieldCheck className="w-4 h-4" />
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
