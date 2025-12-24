'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TrendingUp, BarChart3, Search, Users, Home, Globe, Sun, Moon, Clock } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const Navigation = () => {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { href: '/recommend', label: 'Recommendations', icon: TrendingUp },
    { href: '/analysis', label: 'Analysis', icon: Search },
    { href: '/funds', label: 'Fund Explorer', icon: Users },
    { href: '/what-if', label: 'What If?', icon: Clock },
  ];

  return (
    <nav className="sticky top-0 z-50 px-4 pt-4">
      {/* Subtle Background Glow */}
      <div className={`absolute inset-0 -z-10 bg-gradient-to-b blur-3xl opacity-50 ${
        theme === 'light' 
          ? 'from-amber-100/20 to-transparent' 
          : 'from-amber-900/20 to-transparent'
      }`} />

      {/* Main Nav Container */}
      <div className={`max-w-7xl mx-auto backdrop-blur-md border shadow-2xl rounded-[2rem] theme-transition ${
        theme === 'light'
          ? 'bg-white/60 border-white/50 shadow-amber-900/5'
          : 'bg-slate-900/60 border-slate-700/50 shadow-amber-500/5'
      }`}>
        <div className="px-6">
          <div className="flex h-18 items-center justify-between py-3">

            {/* Logo - Matching the Pearl/Gold theme */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className={`flex h-10 w-10 items-center justify-center rounded-2xl shadow-lg group-hover:scale-105 transition-transform duration-300 ${
                theme === 'light' ? 'bg-slate-950' : 'bg-slate-950'
              }`}>
                <Globe className="h-5 w-5 text-amber-500" />
              </div>
              <span className={`text-xl font-black tracking-tighter theme-transition ${
                theme === 'light' ? 'text-slate-950' : 'text-white'
              }`}>
                MUTUAL.<span className="text-amber-600">AI</span>
              </span>
            </Link>

            {/* Nav Items - Floating Pill Style */}
            <div className={`hidden md:flex items-center gap-1 p-1 rounded-2xl border theme-transition ${
              theme === 'light'
                ? 'bg-slate-100/50 border-slate-200/50'
                : 'bg-slate-800/50 border-slate-700/50'
            }`}>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      group relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all duration-300 theme-transition
                      ${isActive
                        ? theme === 'light'
                          ? 'bg-white text-amber-600 shadow-sm'
                          : 'bg-slate-700 text-amber-400 shadow-sm'
                        : theme === 'light'
                          ? 'text-slate-500 hover:text-slate-950 hover:bg-white/50'
                          : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}
                    `}
                  >
                    <Icon
                      className={`h-4 w-4 transition-transform group-hover:scale-110 theme-transition ${
                        isActive 
                          ? theme === 'light' ? 'text-amber-600' : 'text-amber-400'
                          : theme === 'light'
                            ? 'text-slate-400 group-hover:text-slate-950'
                            : 'text-slate-500 group-hover:text-white'
                      }`}
                    />
                    <span className="tracking-tight">{item.label}</span>
                    
                    {/* Active Underline Dot */}
                    {isActive && (
                      <span className={`absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${
                        theme === 'light' ? 'bg-amber-600' : 'bg-amber-400'
                      }`} />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Theme Toggle & Hackathon Badge */}
            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`flex items-center justify-center w-10 h-10 rounded-full border transition-all duration-300 ${
                  theme === 'light'
                    ? 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
                aria-label="Toggle theme"
              >
                {theme === 'light' ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
              </button>

              {/* Hackathon Badge - Luxury Style */}
              <div className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-[10px] font-black uppercase tracking-widest theme-transition ${
                theme === 'light'
                  ? 'border-amber-200 bg-amber-50/50 text-amber-700 shadow-[inset_0_1px_2px_rgba(251,191,36,0.1)]'
                  : 'border-amber-600/30 bg-amber-900/20 text-amber-400 shadow-[inset_0_1px_2px_rgba(251,191,36,0.05)]'
              }`}>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                TechNEX 2025
              </div>
            </div>

          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;