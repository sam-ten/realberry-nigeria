import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Landmark, TrendingUp, Shield, Users, Zap, ArrowRight, CheckCircle2,
  Building2, Wallet, FileCheck, BarChart3, Globe, Lock, Clock,
  ChevronRight, Star, Play
} from 'lucide-react';

const LandingPage = () => {
  const [activePillar, setActivePillar] = useState(0);

  const pillars = [
    {
      icon: Wallet,
      title: 'The Bulk Capital Engine',
      subtitle: 'Crowdfund ₦100M infrastructure costs from 1,000 retail buyers.',
      color: 'from-gold-500 to-gold-600',
      features: ['Fractional tokenization', 'Real-time funding tracker', 'Automated cap table', 'Investor onboarding flow']
    },
    {
      icon: Shield,
      title: 'Trust & Allocation Dashboard',
      subtitle: 'Secure portal for digital land titles and ownership certificates.',
      color: 'from-primary-500 to-primary-600',
      features: ['Digital C of O storage', 'Co-ownership agreements', 'Blockchain-ready titles', 'Legal document vault']
    },
    {
      icon: Zap,
      title: 'Excel & WhatsApp Replacement',
      subtitle: 'Automates manual payment tracking, logs, and receipts.',
      color: 'from-emerald-500 to-emerald-600',
      features: ['Auto-reconciliation', 'Payment gateway integration', 'Receipt generation', 'Audit trail']
    },
    {
      icon: Users,
      title: 'The Community Synchronizer',
      subtitle: 'Builds long-term digital investor networks for future estates.',
      color: 'from-purple-500 to-purple-600',
      features: ['Investor communities', 'Project updates', 'Dividend distribution', 'Referral tracking']
    }
  ];

  const stats = [
    { label: 'Properties Tokenized', value: '50+' },
    { label: 'Investors Onboarded', value: '12,000+' },
    { label: 'Capital Raised', value: '₦2.5B+' },
    { label: 'Dividends Paid', value: '₦180M+' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-navy-900 to-navy-700 rounded-lg flex items-center justify-center">
              <Landmark className="w-6 h-6 text-gold-400" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-navy-900 leading-tight">RealBerry</h1>
              <p className="text-xs text-gray-500">Nigeria</p>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#pillars" className="text-sm font-medium text-gray-600 hover:text-navy-900 transition-colors">Platform</a>
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-navy-900 transition-colors">Features</a>
            <a href="#companies" className="text-sm font-medium text-gray-600 hover:text-navy-900 transition-colors">For Developers</a>
            <Link to="/login" className="text-sm font-semibold text-navy-900 hover:text-navy-700">Sign In</Link>
            <Link to="/register" className="btn-primary text-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gold-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-500 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center gap-2 mb-6">
            <span className="px-3 py-1 bg-gold-500/20 text-gold-400 rounded-full text-xs font-semibold border border-gold-500/30">
              Now Serving Abuja's Top Developers
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Fractional Real Estate<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600">
              Investment Infrastructure
            </span>
            <br />for Nigeria
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mb-10 leading-relaxed">
            The complete B2B SaaS platform that empowers real estate companies like 
            <span className="text-white font-semibold"> Barnes & Harmer</span>, 
            <span className="text-white font-semibold"> MSHEL</span>, and 
            <span className="text-white font-semibold"> Promise Land</span> to 
            tokenize properties, crowdfund developments, and distribute dividends to thousands of investors — automatically.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/register" className="btn-gold flex items-center gap-2 text-lg px-8 py-4">
              Launch Your Platform <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="flex items-center gap-2 px-8 py-4 border border-white/20 rounded-lg hover:bg-white/10 transition-all">
              <Play className="w-5 h-5" /> Watch Demo
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <p className="text-3xl font-bold text-gold-400">{stat.value}</p>
                <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The 4 Pillars */}
      <section id="pillars" className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-navy-900 mb-4">Your Land Banking B2B SaaS System</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Four powerful engines that replace spreadsheets, WhatsApp groups, and manual bank transfers with a single, elegant platform.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {pillars.map((pillar, i) => (
              <div
                key={i}
                className={`group bg-white rounded-2xl p-8 border-2 transition-all duration-300 cursor-pointer hover:shadow-xl ${
                  activePillar === i ? 'border-navy-900 shadow-lg' : 'border-transparent hover:border-gray-200'
                }`}
                onClick={() => setActivePillar(i)}
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${pillar.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <pillar.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-navy-900 mb-2">{pillar.title}</h3>
                <p className="text-gray-600 mb-6">{pillar.subtitle}</p>
                <div className="grid grid-cols-2 gap-3">
                  {pillar.features.map((feat, j) => (
                    <div key={j} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {feat}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-navy-900 mb-4">Core Platform Features</h2>
            <p className="text-lg text-gray-600">Everything you need to run a modern fractional real estate business in Nigeria.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Building2, title: 'Investor Dashboard', desc: 'Portfolio value, rental income, and structural project updates with photos/videos.' },
              { icon: BarChart3, title: 'Fractional Unit Ledger', desc: 'Divide a luxury apartment into 100 or 1,000 digital tokens with full traceability.' },
              { icon: Wallet, title: 'Payment Gateway Integration', desc: 'Seamless Monnify, Paystack, and Flutterwave integration in Naira and USD.' },
              { icon: FileCheck, title: 'KYC & Document Vault', desc: 'Secure module for government IDs, digital co-ownership agreements, and C of O storage.' },
              { icon: Globe, title: 'Bulk Dividend Engine', desc: 'One-click distribution of land-appreciation payouts to thousands via Paystack/Korapay APIs.' },
              { icon: Lock, title: 'Bank-Grade Security', desc: 'End-to-end encryption, audit trails, and role-based access control.' },
            ].map((feature, i) => (
              <div key={i} className="card hover:shadow-lg transition-shadow group">
                <div className="w-12 h-12 bg-navy-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-navy-900 group-hover:text-white transition-colors">
                  <feature.icon className="w-6 h-6 text-navy-700 group-hover:text-white" />
                </div>
                <h3 className="text-lg font-bold text-navy-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Execute Bulk Dividend Demo */}
      <section className="py-24 px-6 bg-gradient-to-br from-navy-900 to-navy-950 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-gold-500/10 to-transparent"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">
                The <span className="text-gold-400">"Execute Bulk Dividend"</span> Button
              </h2>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                Imagine distributing ₦50M in land appreciation returns to 1,200 investors across 
                Maitama, Jabi, and Wuse — with a single, secure click. Your backend integrates with 
                <span className="text-white font-semibold"> Paystack</span> and 
                <span className="text-white font-semibold"> Korapay</span> APIs to process bulk transfers 
                simultaneously, with full audit trails and real-time status tracking.
              </p>
              <div className="space-y-4">
                {[
                  'One-click bulk NEFT transfers to 1,000+ investor accounts',
                  'Automatic receipt generation and email notifications',
                  'Real-time success/failure tracking per investor',
                  'Integrated with Monnify, Paystack, and Flutterwave'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-gold-400 flex-shrink-0" />
                    <span className="text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-gray-400">Bulk Dividend Execution</p>
                  <p className="text-2xl font-bold text-white">Maitama Luxury Residences — Q3 2024</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
              </div>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total Amount</span>
                  <span className="font-semibold">₦50,000,000.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Recipients</span>
                  <span className="font-semibold">1,247 investors</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Per Unit Payout</span>
                  <span className="font-semibold">₦40,000.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Gateway</span>
                  <span className="font-semibold">Paystack Bulk Transfers</span>
                </div>
              </div>
              <button className="w-full btn-gold text-lg py-4 animate-pulse-gold flex items-center justify-center gap-2">
                <Zap className="w-5 h-5" />
                Execute Bulk Dividend
              </button>
              <p className="text-xs text-gray-500 text-center mt-4">
                This action will initiate 1,247 simultaneous bank transfers. Requires 2FA confirmation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* For Real Estate Companies */}
      <section id="companies" className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-navy-900 mb-4">Built for Nigeria's Top Developers</h2>
            <p className="text-lg text-gray-600">White-label ready. Deploy under your brand in 48 hours.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Barnes & Harmer', type: 'Luxury Residences', location: 'Maitama, Abuja' },
              { name: 'MSHEL Properties', type: 'Commercial & Mixed-Use', location: 'Wuse II, Abuja' },
              { name: 'Promise Land', type: 'Land Banking', location: 'Lugbe, Abuja' },
            ].map((company, i) => (
              <div key={i} className="card hover:shadow-xl transition-all group">
                <div className="w-16 h-16 bg-gradient-to-br from-navy-800 to-navy-900 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Building2 className="w-8 h-8 text-gold-400" />
                </div>
                <h3 className="text-xl font-bold text-navy-900 mb-1">{company.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{company.type}</p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Globe className="w-4 h-4" />
                  {company.location}
                </div>
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Properties</span>
                    <span className="font-semibold text-navy-900">{4 + i * 2}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-gray-500">Investors</span>
                    <span className="font-semibold text-navy-900">{1200 + i * 800}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-navy-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your<br />
            <span className="text-gold-400">Real Estate Business?</span>
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            Join Barnes & Harmer, MSHEL, and Promise Land in revolutionizing property investment in Nigeria.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register" className="btn-gold text-lg px-10 py-4">
              Start Free Trial
            </Link>
            <Link to="/login" className="px-10 py-4 border border-white/20 rounded-lg hover:bg-white/10 transition-all text-lg">
              View Demo Dashboard
            </Link>
          </div>
          <div className="flex items-center justify-center gap-8 mt-12 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" /> No setup fees
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" /> 2.5% per transaction
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" /> White-label ready
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-950 text-gray-400 py-12 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-navy-800 to-navy-700 rounded-lg flex items-center justify-center">
                <Landmark className="w-5 h-5 text-gold-400" />
              </div>
              <span className="font-bold text-white">RealBerry Nigeria</span>
            </div>
            <p className="text-sm">Fractional real estate investment infrastructure for Africa's most dynamic property market.</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Investor Dashboard</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Admin Panel</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Bulk Dividends</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Document Vault</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">SEC Compliance</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-800 text-sm text-center">
          © 2024 RealBerry Nigeria. All rights reserved. Powered by Paystack, Monnify & Flutterwave.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
