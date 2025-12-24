import Link from 'next/link';
import { TrendingUp, BarChart3, Search, Users, ArrowRight, CheckCircle, ShieldCheck, Zap, Globe } from 'lucide-react';
import MarketConditionIndicator from '@/components/MarketConditionIndicator';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FCFBF7] text-slate-900 selection:bg-amber-100 selection:text-amber-900 font-sans overflow-x-hidden">
      {/* Golden Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[50%] rounded-full bg-gradient-to-br from-amber-100/40 to-transparent blur-[120px]" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr from-yellow-50/50 to-transparent blur-[120px]" />
      </div>

      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-amber-200/50 shadow-sm text-amber-700 text-sm font-bold mb-8 animate-fade-in">
            <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span className="tracking-tight uppercase">Tier-1 Quant Intelligence</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-slate-950 mb-8 leading-[1.1]">
            Wealth Management <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700">
              Redefined by AI
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
            Experience a new standard of financial clarity. Our high-fidelity machine learning models 
            analyze 789+ funds to pinpoint your optimal growth path.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-5 justify-center mb-24">
            <Link
              href="/recommend"
              className="group relative bg-slate-950 text-white px-10 py-4 rounded-2xl font-bold transition-all hover:bg-amber-600 hover:shadow-2xl hover:shadow-amber-200 flex items-center justify-center overflow-hidden"
            >
              Get Recommendations
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/dashboard"
              className="bg-white/80 backdrop-blur-md border border-slate-200 text-slate-900 px-10 py-4 rounded-2xl font-bold hover:bg-white transition-all flex items-center justify-center shadow-sm"
            >
              Market Analytics
              <BarChart3 className="ml-2 h-5 w-5 text-slate-400" />
            </Link>
          </div>

          {/* Market Condition Indicator */}
          <div className="max-w-2xl mx-auto mb-16">
            <MarketConditionIndicator />
          </div>

          {/* Luxury Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-200/60 overflow-hidden rounded-3xl border border-white shadow-2xl shadow-amber-900/10">
            {[
              { label: "Mutual Funds", val: "789+" },
              { label: "Asset Classes", val: "39" },
              { label: "ML Accuracy", val: "96.4%", highlight: true },
              { label: "API Nodes", val: "10" },
            ].map((stat, i) => (
              <div key={i} className="bg-white/90 backdrop-blur-sm py-10 px-4 group hover:bg-white transition-colors">
                <div className={`text-4xl font-black mb-1 tracking-tighter transition-transform group-hover:scale-110 duration-500 ${stat.highlight ? 'text-amber-600' : 'text-slate-950'}`}>{stat.val}</div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400 font-bold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="relative py-28 bg-white/40 backdrop-blur-sm border-y border-amber-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="text-3xl md:text-4xl font-black text-slate-950 tracking-tight mb-4">Precision Ecosystem</h2>
            <div className="h-1 w-12 bg-amber-500 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              href="/recommend" 
              icon={<TrendingUp className="text-amber-600" />} 
              title="AI Engine" 
              desc="Proprietary fund matching using non-linear risk-reward regression."
              accent="bg-amber-50"
            />
            <FeatureCard 
              href="/dashboard" 
              icon={<BarChart3 className="text-slate-600" />} 
              title="Market Pulse" 
              desc="Live performance tracking with institutional-grade volatility mapping."
              accent="bg-slate-100"
            />
            <FeatureCard 
              href="/analysis" 
              icon={<Search className="text-amber-700" />} 
              title="Deep Search" 
              desc="Advanced correlations that reveal hidden market alpha."
              accent="bg-amber-50"
            />
            <FeatureCard 
              href="/funds" 
              icon={<Users className="text-slate-600" />} 
              title="Fund Explorer" 
              desc="Granular transparency for 39+ AMCs and manager performance."
              accent="bg-slate-100"
            />
          </div>
        </div>
      </div>

      {/* Trust Section */}
      <div className="py-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-10">
              <h2 className="text-4xl md:text-5xl font-black text-slate-950 leading-tight tracking-tight">
                Built for <br />
                <span className="text-amber-600">Reliable Growth.</span>
              </h2>
              <div className="space-y-8">
                <BenefitItem title="Fiduciary Design" desc="Our intelligence is mathematically objective and AMC-neutral." />
                <BenefitItem title="Smart Risk Mitigation" desc="Dynamic models that prioritize capital preservation during volatility." />
                <BenefitItem title="Performance Optimized" desc="Sub-second response times across all recommendation nodes." />
              </div>
            </div>
            
            <div className="relative group">
              <div className="absolute inset-0 bg-amber-500/10 rounded-[2.5rem] blur-2xl group-hover:bg-amber-500/20 transition-all duration-700" />
              <div className="relative bg-white p-12 rounded-[2.5rem] border border-amber-100 shadow-xl">
                <ShieldCheck className="h-14 w-14 text-amber-600 mb-8" />
                <h3 className="text-2xl font-bold text-slate-950 mb-4">Institutional AI for You</h3>
                <p className="text-slate-600 mb-10 leading-relaxed font-medium">
                  We bring the same tools used by elite wealth managers to the middle-class investor.
                </p>
                <Link
                  href="/recommend"
                  className="w-full bg-slate-950 text-white px-6 py-5 rounded-2xl font-bold hover:bg-amber-600 transition-all flex items-center justify-center shadow-lg shadow-amber-900/10"
                >
                  Start Investing Smart
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Luxury Footer */}
      <footer className="bg-slate-950 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2 font-black text-xl tracking-tighter">
              <Globe className="w-6 h-6 text-amber-500" />
              MUTUAL.AI
            </div>
            <p className="text-slate-500 text-[10px] font-bold tracking-[0.4em] uppercase">
              Hackathon 2025 • Technical Excellence • Secure Infrastructure
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ href, icon, title, desc, accent }) {
  return (
    <Link href={href} className="group">
      <div className="h-full bg-white/60 border border-white p-8 rounded-[2.5rem] hover:bg-white hover:shadow-2xl hover:shadow-amber-900/5 transition-all duration-500 transform hover:-translate-y-2">
        <div className={`mb-8 p-4 rounded-2xl inline-block ${accent} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <h3 className="text-xl font-black text-slate-950 mb-3 tracking-tight">{title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed font-medium">{desc}</p>
      </div>
    </Link>
  );
}

function BenefitItem({ title, desc }) {
  return (
    <div className="flex items-start gap-5 group">
      <div className="mt-1 bg-white shadow-sm border border-amber-100 p-2 rounded-xl group-hover:bg-amber-50 transition-colors">
        <CheckCircle className="h-5 w-5 text-amber-600" />
      </div>
      <div>
        <h3 className="font-bold text-slate-950 text-lg tracking-tight">{title}</h3>
        <p className="text-slate-500 font-medium">{desc}</p>
      </div>
    </div>
  );
}