import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import cuteYetiMascot from '../../assets/images/cute_yeti_mascot_1789974758085.jpg';
import zipblindLogoClean from '../../assets/images/zipblind_logo_clean.png';

export const LoginPage: React.FC = () => {
  const { login, showToast } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const errs: { email?: string; password?: string } = {};
    if (!email) {
      errs.email = 'Email wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Format email tidak valid';
    }

    if (!password) {
      errs.password = 'Password wajib diisi';
    } else if (password.length < 4) {
      errs.password = 'Password minimal 4 karakter';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const ok = await login(email, password, rememberMe);
      if (!ok) {
        setErrors({ email: 'Kredensial login tidak cocok' });
      } else {
        showToast('Selamat Datang!', 'Berhasil masuk ke portal ZIPBLIND.', 'success');
      }
    } catch {
      setErrors({ email: 'Gagal menghubungi server otentikasi' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-3 sm:p-6 lg:p-10 bg-gradient-to-br from-[#B9D7F7] via-[#D2E6FC] to-[#EDF5FD] relative overflow-hidden">
      {/* Dreamy soft cloud background accents */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-20 w-80 h-80 bg-white/50 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-20 left-1/4 w-[500px] h-60 bg-white/60 rounded-full blur-3xl pointer-events-none" />

      {/* Main floating card container */}
      <div className="relative z-10 w-full max-w-5xl bg-white rounded-[28px] sm:rounded-[36px] shadow-[0_20px_60px_-15px_rgba(59,130,246,0.18)] border border-white/90 p-3.5 sm:p-5 lg:p-6 flex flex-col lg:flex-row items-stretch gap-6 lg:gap-8">
        
        {/* LEFT COLUMN: Cute Cartoon Mascot Visual */}
        <div className="lg:w-1/2 relative rounded-[22px] sm:rounded-[28px] overflow-hidden bg-[#E2EEFC] aspect-square sm:aspect-[4/3] lg:aspect-auto lg:min-h-[560px] flex items-end group shadow-inner">
          {/* 3D Cute Yeti Mascot Image */}
          <img
            src={cuteYetiMascot}
            alt="Cute Yeti Mascot"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
          />

          {/* Gentle gradient overlay at bottom for bold text contrast */}
          <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />

          {/* Bold Impact Typography overlaid bottom left */}
          <div className="relative z-10 p-6 sm:p-8 select-none">
            <h2 className="font-black text-white text-3xl sm:text-4xl lg:text-[42px] leading-[1.05] tracking-tight drop-shadow-[0_3px_8px_rgba(0,0,0,0.5)]">
              EXPLORE.
              <br />
              LEARN. GROW.
            </h2>
            <div className="flex items-center gap-2 mt-2.5 text-white/90 text-xs font-semibold drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>ZIPBLIND • PT SHINMADO</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Form & Sign-In Actions */}
        <div className="lg:w-1/2 flex flex-col justify-center px-2 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* Header mascot avatar & title */}
          <div className="text-center mb-6">
            {/* Cute Cartoon Mascot Avatar Icon */}
            <div className="inline-flex items-center justify-center mb-3">
              <div className="relative w-12 h-12 rounded-full bg-blue-50 border-2 border-blue-200 overflow-hidden shadow-sm flex items-center justify-center">
                <img
                  src={cuteYetiMascot}
                  alt="Mascot Icon"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover scale-150"
                />
              </div>
            </div>
            
            <div className="flex justify-center mb-2.5">
              <img
                src={zipblindLogoClean}
                alt="ZIPBLIND®"
                referrerPolicy="no-referrer"
                className="h-7 sm:h-8 w-auto object-contain"
              />
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              WELCOME BACK
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              Enter your email and password to access your account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto w-full">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className={`w-full bg-[#F3F6F9] text-slate-900 text-sm rounded-xl px-4 py-3 placeholder:text-slate-400 border transition-all focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710] ${
                    errors.email ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-rose-500 mt-1 font-medium">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className={`w-full bg-[#F3F6F9] text-slate-900 text-sm rounded-xl px-4 py-3 pr-11 placeholder:text-slate-400 border transition-all focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710] ${
                    errors.password ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-rose-500 mt-1 font-medium">{errors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#B88710] focus:ring-[#B88710]"
                />
                <span className="text-slate-600">Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  showToast(
                    'Reset Password',
                    'Hubungi Administrator PT Shinmado via WhatsApp untuk instruksi reset password.',
                    'info'
                  );
                }}
                className="text-slate-600 hover:text-slate-900 font-medium hover:underline"
              >
                Forgot Password
              </button>
            </div>

            {/* Primary Sign In Button (Black Sleek) */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#111827] hover:bg-black text-white font-bold text-sm py-3.5 px-4 rounded-xl transition-all shadow-md active:scale-[0.99] disabled:opacity-70 flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
